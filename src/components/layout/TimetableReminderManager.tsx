import React, { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell } from 'lucide-react';

export const TimetableReminderManager: React.FC = () => {
  const { timetable, settings, subjects, showToast } = useApp();
  const notifiedSlots = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!settings.notifications?.timetableReminders) return;
    
    const reminderMinutes = settings.notifications.timetableReminderMinutes || 15;

    const checkReminders = () => {
      const now = new Date();
      const currentDay = now.getDay() || 7; // 1-7
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      timetable.forEach(slot => {
        if (slot.dayOfWeek !== currentDay) return;

        const [startH, startM] = slot.startTime.split(':').map(Number);
        const slotTimeInMinutes = startH * 60 + startM;

        const diff = slotTimeInMinutes - currentTimeInMinutes;
        
        // If the class is coming up exactly within the reminder window (and hasn't been notified)
        // We use a window of 0 to reminderMinutes
        if (diff > 0 && diff <= reminderMinutes) {
          const reminderId = `${slot.id}-${now.toDateString()}`;
          
          if (!notifiedSlots.current.has(reminderId)) {
            const subject = subjects.find(s => s.id === slot.subjectId);
            const subjectName = subject ? subject.name : 'Class';
            
            // Show toast
            showToast(
              `${subjectName} starts in ${diff} minutes${slot.room ? ` in ${slot.room}` : ''}.`,
              'info'
            );
            
            // Native notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Upcoming Class', {
                body: `${subjectName} starts in ${diff} minutes${slot.room ? `\nRoom: ${slot.room}` : ''}`,
                icon: '/icon.png'
              });
            }

            notifiedSlots.current.add(reminderId);
          }
        }
      });
    };

    // Request native permission if not granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [timetable, settings.notifications, subjects, showToast]);

  return null;
};
