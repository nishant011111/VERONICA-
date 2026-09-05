import React from 'react';
import { OverviewMetricsWidget } from './widgets/OverviewMetricsWidget';
import { ScheduleWidget } from './widgets/ScheduleWidget';
import { QuickAccessWidget } from './widgets/QuickAccessWidget';
import { SubjectsWidget } from './widgets/SubjectsWidget';
import { DailyBriefingWidget } from './widgets/DailyBriefingWidget';

export const WidgetRegistry: Record<string, React.FC<any>> = {
  'overview_metrics': OverviewMetricsWidget,
  'schedule': ScheduleWidget,
  'quick_access': QuickAccessWidget,
  'subjects': SubjectsWidget,
  'daily_briefing': DailyBriefingWidget,
};
