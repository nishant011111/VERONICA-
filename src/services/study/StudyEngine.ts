import { PlannerContext, StudyRecommendation, TopicScore } from './StudyEngineTypes';
import { AIRouter } from '../ai/AIRouter';
import { Subject, SyllabusTopic } from '../../types';

export class StudyEngine {
  
  /**
   * Generates a single recommendation for "What should I study now?"
   */
  public static getNextBestSession(
    context: PlannerContext,
    availableMinutes: number
  ): StudyRecommendation | null {
    if (context.subjects.length === 0) return null;

    const topicScores = this.scoreTopics(context);
    if (topicScores.length === 0) return null;

    // Pick top scored topic
    const topTopic = topicScores[0];
    
    // Suggest duration based on settings, capping at available minutes
    const prefLength = context.settings.planner.preferredSessionLength || 60;
    const durationMinutes = Math.min(availableMinutes, prefLength);
    
    return {
      subjectId: topTopic.subjectId,
      topicId: topTopic.topic.id,
      topicTitle: topTopic.topic.title,
      durationMinutes,
      priority: topTopic.urgency,
      reason: topTopic.reason,
      type: this.determineStudyType(topTopic.topic)
    };
  }

  /**
   * Generate an explanation based on local data.
   */
  private static determineStudyType(topic: SyllabusTopic): 'revision' | 'learning' | 'practice' {
    if (topic.status === 'not_started') return 'learning';
    if (topic.status === 'revised' || topic.status === 'mastered') return 'practice';
    return 'revision';
  }

  /**
   * Scores all topics based on exam proximity, topic confidence, deadlines.
   */
  private static scoreTopics(context: PlannerContext): TopicScore[] {
    const scores: TopicScore[] = [];
    const now = new Date();

    for (const subject of context.subjects) {
      if (!subject.syllabus) continue;

      const subjectExams = context.exams.filter(e => e.subjectId === subject.id);
      const nextExam = this.getUpcoming(subjectExams, now);

      for (const topic of subject.syllabus) {
        let score = 0;
        let reasons: string[] = [];
        let urgency: 'low'|'medium'|'high' = 'low';

        // Exam urgency
        if (nextExam) {
          const daysToExam = Math.max(1, (new Date(nextExam.date).getTime() - now.getTime()) / (1000 * 3600 * 24));
          if (daysToExam < 7) {
            score += 50;
            reasons.push(`Exam "${nextExam.name}" is in ${Math.floor(daysToExam)} days.`);
            urgency = 'high';
          } else if (daysToExam < 14) {
            score += 20;
            reasons.push(`Exam "${nextExam.name}" is approaching.`);
            if (urgency === 'low') urgency = 'medium';
          }
        }

        // Confidence & Status
        if (topic.confidence === 'low') {
          score += 30;
          reasons.push('Low confidence in this topic.');
        } else if (topic.confidence === 'medium') {
          score += 15;
        }

        if (topic.status === 'not_started') {
          score += 20;
          reasons.push('Topic has not been started.');
        }

        if (topic.importance === 'high') {
          score += 20;
        }

        // Revision due
        if (topic.nextRevisionDate && new Date(topic.nextRevisionDate) < now) {
          score += 40;
          reasons.push('Revision is overdue.');
          urgency = 'high';
        }

        // Penalty for recently studied to avoid repeating
        if (topic.lastStudied) {
          const hoursSinceLastStudy = (now.getTime() - new Date(topic.lastStudied).getTime()) / (1000 * 3600);
          if (hoursSinceLastStudy < 12) {
            score -= 50; // heavily penalize studying the same thing immediately
          }
        }

        if (score > 0 || reasons.length > 0) {
          scores.push({
            subjectId: subject.id,
            topic,
            score,
            reason: reasons.length > 0 ? reasons.join(' ') : 'Good to review.',
            urgency
          });
        }
      }
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  private static getUpcoming(events: any[], now: Date) {
    const upcoming = events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  /**
   * Use AI to refine or generate a study plan. (Optional enhancement)
   */
  public static async generateAIPlan(context: PlannerContext, prompt: string): Promise<string> {
    if (!context.settings.planner.aiPlanningEnabled || !context.settings.ai.geminiApiKey) {
      throw new Error("AI Planning is disabled or API key missing.");
    }
    
    // Minimize data sent to AI
    const minimalContext = {
      exams: context.exams.map(e => ({ name: e.name, date: e.date, subjectId: e.subjectId })),
      tasks: context.tasks.map(t => ({ title: t.title, dueDate: t.date, status: t.status })),
      goals: "3 hours/day", // Replace with real goals
      availableTime: "90 minutes"
    };

    const aiPrompt = `
You are an expert study planner. 
User context: ${JSON.stringify(minimalContext)}
User request: ${prompt}

Output a clear, practical study schedule. Only output the plan. Do not hallucinate.`;

    const res = await AIRouter.ask(aiPrompt, context.settings.ai);
    return res.text;
  }

  /**
   * Reschedule a missed session
   */
  public static rescheduleSession(session: any, context: PlannerContext): Date | null {
    // Basic logic: move to tomorrow at preferred start time
    if (!context.settings.planner.autoReschedule) return null;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [h, m] = context.settings.planner.preferredStudyHoursStart.split(':').map(Number);
    tomorrow.setHours(h, m, 0, 0);
    return tomorrow;
  }

  /**
   * Calculates the current study streak in days based on completed sessions.
   */
  public static calculateStreak(sessions: any[]): number {
    const totalCompletedSessions = sessions.filter(s => s.status === 'completed' && s.createdAt);
    if (totalCompletedSessions.length === 0) return 0;
    
    const dates = Array.from(
      new Set(totalCompletedSessions.map((s) => s.createdAt.split('T')[0]))
    ).sort().reverse();

    if (dates.length === 0) return 0;
    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  }
}
