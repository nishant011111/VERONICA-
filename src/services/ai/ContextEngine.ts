import { PlannerContext } from '../study/StudyEngineTypes';

export interface ContextData {
  tasks: any[];
  exams: any[];
  recentFiles: any[];
  activeGoals: any[];
}

export class ContextEngine {
  /**
   * Builds context from current application state to feed the AI.
   * Limits data to prevent token bloat and protect privacy.
   */
  public static buildContext(context: PlannerContext, recentFiles: any[], goals: any[]): ContextData {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 1. Relevant tasks (due today or overdue)
    const relevantTasks = context.tasks
      .filter(t => t.status !== 'completed' && t.date <= todayStr)
      .slice(0, 10);

    // 2. Upcoming exams
    const upcomingExams = context.exams
      .filter(e => e.date >= todayStr)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    // 3. Recent files (top 5)
    const recent = recentFiles.slice(0, 5);

    // 4. Active goals
    const activeGoals = goals.filter(g => g.currentValue < g.targetValue).slice(0, 3);

    return {
      tasks: relevantTasks,
      exams: upcomingExams,
      recentFiles: recent,
      activeGoals,
    };
  }

  public static formatContextForPrompt(data: ContextData): string {
    let text = "USER CONTEXT:\n";
    if (data.tasks.length > 0) {
      text += "- Pending Tasks: " + data.tasks.map(t => `${t.title} (${t.date})`).join(', ') + "\n";
    }
    if (data.exams.length > 0) {
      text += "- Upcoming Exams: " + data.exams.map(e => `${e.name} (${e.date})`).join(', ') + "\n";
    }
    if (data.recentFiles.length > 0) {
      text += "- Recent Documents: " + data.recentFiles.map(f => f.name).join(', ') + "\n";
    }
    return text;
  }
}
