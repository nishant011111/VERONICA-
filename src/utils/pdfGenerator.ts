import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Subject, Task, AttendanceRecord, UserProfile, StudySession, Goal } from '../types';

interface PDFReportData {
  profile: UserProfile;
  subjects: Subject[];
  tasks: Task[];
  attendanceRecords: AttendanceRecord[];
  studySessions?: StudySession[];
  goals?: Goal[];
}

export const generateAcademicPDFReport = async (data: PDFReportData): Promise<void> => {
  const { profile, subjects, tasks, attendanceRecords, studySessions = [] } = data;

  const targetCriteria = 75;

  // 1. Compute Subject-Wise Stats
  const subjectStats = subjects.map((sub) => {
    const subAttendance = attendanceRecords.filter((a) => a.subjectId === sub.id);
    const totalClasses = subAttendance.length;
    const presentClasses = subAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    const subTasks = tasks.filter((t) => t.subjectId === sub.id);
    const completedTasks = subTasks.filter((t) => t.status === 'completed').length;
    const taskPct = subTasks.length > 0 ? Math.round((completedTasks / subTasks.length) * 100) : 0;

    const completedSessions = studySessions.filter((s) => s.subjectId === sub.id && s.status === 'completed');
    const studyMins = completedSessions.reduce((sum, s) => sum + (s.actualDuration || s.plannedDuration || 0), 0);

    const subTarget = sub.targetPercentage || targetCriteria;

    return {
      id: sub.id,
      name: sub.name,
      code: sub.code,
      color: sub.color || '#4f46e5',
      totalClasses,
      presentClasses,
      attendancePct,
      totalTasks: subTasks.length,
      completedTasks,
      taskPct,
      studyHours: (studyMins / 60).toFixed(1),
      targetAttendance: subTarget,
    };
  });

  // 2. Compute Overall Metrics
  const totalClassesCount = attendanceRecords.length;
  const totalPresentCount = attendanceRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
  const totalAbsentCount = attendanceRecords.filter((a) => a.status === 'absent').length;
  const totalCancelledCount = attendanceRecords.filter((a) => a.status === 'cancelled').length;
  const overallAttendancePct = totalClassesCount > 0 ? Math.round((totalPresentCount / totalClassesCount) * 100) : 0;

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const overallTaskPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const totalStudyMinutes = studySessions
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + (s.actualDuration || s.plannedDuration || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // 3. Create temporary offscreen HTML container for PDF rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  container.style.padding = '40px';

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  container.innerHTML = `
    <div style="box-sizing: border-box; width: 100%; font-family: system-ui, -apple-system, sans-serif; color: #0f172a;">
      <!-- Header Banner -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px;">
        <div>
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #4338ca; letter-spacing: -0.5px;">VERONICA ACADEMIC REPORT</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500;">Comprehensive Performance, Attendance & Progress Analytics</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${profile.name || 'Student'}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Semester: ${profile.semester || 'N/A'} | Year: ${profile.academicYear || 'N/A'}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Generated: ${dateStr}</div>
        </div>
      </div>

      <!-- Top Summary Metrics Cards -->
      <div style="display: flex; gap: 15px; margin-bottom: 25px;">
        <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Overall Attendance</div>
          <div style="font-size: 28px; font-weight: 800; color: ${overallAttendancePct >= targetCriteria ? '#16a34a' : '#dc2626'}; margin-top: 4px;">
            ${overallAttendancePct}%
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${totalPresentCount} of ${totalClassesCount} classes attended</div>
        </div>

        <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Task Completion</div>
          <div style="font-size: 28px; font-weight: 800; color: #2563eb; margin-top: 4px;">
            ${overallTaskPct}%
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${completedTasksCount} of ${totalTasksCount} tasks finished</div>
        </div>

        <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Focus Hours</div>
          <div style="font-size: 28px; font-weight: 800; color: #7c3aed; margin-top: 4px;">
            ${totalStudyHours} <span style="font-size: 14px; font-weight: 500;">hrs</span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Across ${subjects.length} enrolled subjects</div>
        </div>
      </div>

      <!-- VISUAL GRAPHS SECTION -->
      <div style="margin-bottom: 25px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
        <h3 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
          📊 Subject-Wise Visual Progress & Criteria Analysis
        </h3>

        <!-- Graph 1: Subject Attendance Comparison Bars -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 10px;">
            Subject Attendance vs. Target Threshold (${targetCriteria}%)
          </div>
          ${
            subjectStats.length === 0
              ? '<div style="font-size: 12px; color: #94a3b8; font-style: italic;">No subject data registered.</div>'
              : subjectStats
                  .map(
                    (s) => `
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                  <span>${s.code} - ${s.name}</span>
                  <span style="color: ${s.attendancePct >= s.targetAttendance ? '#16a34a' : '#dc2626'}; font-weight: 700;">
                    ${s.attendancePct}% (${s.presentClasses}/${s.totalClasses} classes)
                  </span>
                </div>
                <div style="position: relative; width: 100%; height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden;">
                  <div style="width: ${Math.min(s.attendancePct, 100)}%; height: 100%; background: ${s.attendancePct >= s.targetAttendance ? '#22c55e' : '#ef4444'}; border-radius: 6px;"></div>
                  <div style="position: absolute; left: ${s.targetAttendance}%; top: 0; bottom: 0; width: 2px; background: #0f172a; z-index: 2;"></div>
                </div>
              </div>
            `
                  )
                  .join('')
          }
        </div>

        <!-- Graph 2: Subject Task Progress Grid -->
        <div>
          <div style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 10px;">Subject Task Completion & Progress</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${
              subjectStats.length === 0
                ? '<div style="font-size: 12px; color: #94a3b8; font-style: italic;">No tasks recorded.</div>'
                : subjectStats
                    .map(
                      (s) => `
                <div style="background: #f8fafc; border: 1px solid #f1f5f9; padding: 10px; border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; margin-bottom: 4px;">
                    <span style="color: #334155;">${s.code} (${s.completedTasks}/${s.totalTasks} Tasks)</span>
                    <span style="color: #4f46e5; font-weight: 700;">${s.taskPct}%</span>
                  </div>
                  <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${s.taskPct}%; height: 100%; background: #6366f1; border-radius: 4px;"></div>
                  </div>
                </div>
              `
                    )
                    .join('')
            }
          </div>
        </div>
      </div>

      <!-- DETAILED SUBJECT WISE BREAKDOWN TABLE -->
      <div style="margin-bottom: 25px;">
        <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
          📚 Subject-Wise Detailed Performance Matrix
        </h3>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
          <thead>
            <tr style="background: #4338ca; color: #ffffff;">
              <th style="padding: 10px; border-radius: 6px 0 0 0;">Code</th>
              <th style="padding: 10px;">Subject Name</th>
              <th style="padding: 10px;">Classes</th>
              <th style="padding: 10px;">Attendance %</th>
              <th style="padding: 10px;">Tasks Completed</th>
              <th style="padding: 10px;">Study Time</th>
              <th style="padding: 10px; border-radius: 0 6px 0 0;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              subjectStats.length === 0
                ? '<tr><td colspan="7" style="padding: 12px; text-align: center; color: #94a3b8;">No enrolled subjects registered yet.</td></tr>'
                : subjectStats
                    .map(
                      (s, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: 700; color: #334155;">${s.code}</td>
                <td style="padding: 10px; color: #0f172a; font-weight: 500;">${s.name}</td>
                <td style="padding: 10px; color: #475569;">${s.presentClasses} / ${s.totalClasses}</td>
                <td style="padding: 10px; font-weight: 700; color: ${s.attendancePct >= s.targetAttendance ? '#16a34a' : '#dc2626'};">
                  ${s.attendancePct}%
                </td>
                <td style="padding: 10px; color: #475569;">${s.completedTasks} / ${s.totalTasks} (${s.taskPct}%)</td>
                <td style="padding: 10px; color: #475569;">${s.studyHours} hrs</td>
                <td style="padding: 10px;">
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; background: ${
                    s.attendancePct >= s.targetAttendance ? '#dcfce7' : '#fee2e2'
                  }; color: ${s.attendancePct >= s.targetAttendance ? '#15803d' : '#b91c1c'};">
                    ${s.attendancePct >= s.targetAttendance ? 'Safe' : 'Shortage'}
                  </span>
                </td>
              </tr>
            `
                    )
                    .join('')
            }
          </tbody>
        </table>
      </div>

      <!-- ATTENDANCE BREAKDOWN STATS -->
      <div style="display: flex; gap: 15px; margin-bottom: 25px;">
        <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">Present Classes</div>
          <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 2px;">${totalPresentCount}</div>
        </div>

        <div style="flex: 1; background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #991b1b; text-transform: uppercase;">Absent Classes</div>
          <div style="font-size: 20px; font-weight: 800; color: #b91c1c; margin-top: 2px;">${totalAbsentCount}</div>
        </div>

        <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">Cancelled Classes</div>
          <div style="font-size: 20px; font-weight: 800; color: #64748b; margin-top: 2px;">${totalCancelledCount}</div>
        </div>
      </div>

      <!-- Footer Signoff -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center;">
        <span>Veronica Academic AI Workspace &copy; 2026 — Nishant</span>
        <span>Verified Academic Analytics Report</span>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `veronica_academic_report_${profile.name ? profile.name.toLowerCase().replace(/\s+/g, '_') : 'student'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
};

export default generateAcademicPDFReport;
