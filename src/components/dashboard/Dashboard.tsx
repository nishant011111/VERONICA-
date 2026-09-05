import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WidgetRegistry } from './DashboardWidgetRegistry';
import { DashboardWidget } from '../../types';
import { Settings, X, Plus, GripVertical, Check, EyeOff, Eye } from 'lucide-react';
import { Button } from '../ui/Button';

interface DashboardProps {
  onOpenQuickCreate?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenQuickCreate }) => {
  const { settings, updateSettings } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(settings.dashboard?.widgets || []);

  useEffect(() => {
    if (settings.dashboard?.widgets) {
      setWidgets(settings.dashboard.widgets);
    }
  }, [settings.dashboard]);

  const saveLayout = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets);
    updateSettings({
      dashboard: { widgets: newWidgets }
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex === dropIndex) return;

    const newWidgets = [...widgets];
    const draggedItem = newWidgets[dragIndex];
    newWidgets.splice(dragIndex, 1);
    newWidgets.splice(dropIndex, 0, draggedItem);
    
    // update order
    newWidgets.forEach((w, i) => w.order = i);
    saveLayout(newWidgets);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const toggleVisibility = (index: number) => {
    const newWidgets = [...widgets];
    newWidgets[index].visible = !newWidgets[index].visible;
    saveLayout(newWidgets);
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'full': return 'col-span-12';
      case 'large': return 'col-span-12 lg:col-span-6';
      case 'medium': return 'col-span-12 lg:col-span-4';
      case 'small': return 'col-span-12 lg:col-span-3';
      default: return 'col-span-12';
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      <div className="flex justify-end absolute -top-12 right-0 z-10">
        <Button 
          variant={isEditing ? 'primary' : 'ghost'} 
          size="sm" 
          onClick={() => setIsEditing(!isEditing)}
          icon={isEditing ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
        >
          {isEditing ? 'Done Editing' : 'Customize'}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6 w-full">
        {widgets.map((widget, index) => {
          if (!widget.visible && !isEditing) return null;

          const WidgetComponent = WidgetRegistry[widget.type];
          if (!WidgetComponent) return null;

          return (
            <div 
              key={widget.id} 
              className={`${getSizeClass(widget.size)} relative rounded-3xl ${isEditing ? 'border-2 border-dashed border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 p-2' : ''}`}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragOver={handleDragOver}
            >
              {isEditing && (
                <div className="absolute top-2 right-2 bg-white dark:bg-slate-800 shadow-md rounded-lg p-1 flex items-center gap-1 z-20">
                  <div className="cursor-grab p-1 text-slate-400 hover:text-slate-600">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <button 
                    onClick={() => toggleVisibility(index)}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <select 
                    value={widget.size}
                    onChange={(e) => {
                      const newWidgets = [...widgets];
                      newWidgets[index].size = e.target.value as any;
                      saveLayout(newWidgets);
                    }}
                    className="text-xs bg-transparent outline-none ml-1 cursor-pointer"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="full">Full</option>
                  </select>
                </div>
              )}
              
              <div className={`${!widget.visible ? 'opacity-30 pointer-events-none' : ''} h-full w-full`}>
                <WidgetComponent onOpenQuickCreate={onOpenQuickCreate} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
