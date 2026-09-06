import { AIMemory, UserSettings, ChatMessage } from '../../types';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getApps, getApp } from 'firebase/app';
import { AIRouter } from './AIRouter';
import { vectorDB } from './VectorDatabase';

const STORAGE_PREFIX = 'veronica_memories_';

export class MemoryService {
  private static getStorageKey(userId: string): string {
    return `${STORAGE_PREFIX}${userId || 'local_user'}`;
  }

  static getMemories(userId: string): AIMemory[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse user memories:', e);
      return [];
    }
  }

  static saveMemories(userId: string, memories: AIMemory[], skipFirebase = false): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(memories));
      if (!skipFirebase) this.syncToFirebase(userId, memories);
    } catch (e) {
      console.error('Failed to save user memories:', e);
    }
  }

  private static async syncToFirebase(userId: string, memories: AIMemory[]) {
    if (!userId || userId === 'local_user') return;
    try {
      const db = getFirestore(getApp());
      const memRef = doc(db, 'users', userId, 'data', 'memories');
      await setDoc(memRef, { memories }, { merge: true });
    } catch (e) {
      console.error('Failed to sync memories to Firebase:', e);
    }
  }

  static async loadFromFirebase(userId: string): Promise<AIMemory[]> {
    if (!userId || userId === 'local_user') return [];
    try {
      const db = getFirestore(getApp());
      const memRef = doc(db, 'users', userId, 'data', 'memories');
      const snapshot = await getDoc(memRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.memories) {
          this.saveMemories(userId, data.memories, true);
          return data.memories;
        }
      }
    } catch (e) {
      console.error('Failed to load memories from Firebase:', e);
    }
    return [];
  }

  static async extractMemories(
    userId: string,
    recentMessages: ChatMessage[],
    aiSettings: UserSettings['ai']
  ): Promise<void> {
    if (!aiSettings.memoryEnabled) return;
    
    // Check if the provider is valid for extraction
    if (aiSettings.activeProvider === 'ollama' && !aiSettings.ollamaHost) return;
    
    const currentMemories = this.getMemories(userId);
    
    // We only need the last few turns for extraction, maybe the last user and AI message
    const msgsToAnalyze = recentMessages.slice(-4);
    if (msgsToAnalyze.length === 0) return;
    
    const chatStr = msgsToAnalyze.map(m => `${m.sender.toUpperCase()}: ${m.content}`).join('\n');
    
    const prompt = `
You are a highly intelligent memory extraction module for a personal AI assistant named Veronica.
Your task is to analyze the recent conversation and extract any new long-term facts, preferences, technical decisions, goals, or explicit requests from the user to remember something.

Current user memories:
${JSON.stringify(currentMemories, null, 2)}

Recent conversation segment:
${chatStr}

Rules:
1. Do NOT extract temporary, trivial, or contextual information (e.g., "User asked for a joke", "User is debugging a specific error right now").
2. Only extract information that would be genuinely useful across completely different conversations in the future.
3. If a new fact conflicts with an existing memory (e.g., User changed their major), UPDATE the existing memory's content instead of creating a duplicate.
4. If there is nothing new or useful to remember, return an empty array [].
5. You must output ONLY a valid JSON array of memory objects. No markdown formatting, no code blocks, just raw JSON.

Memory Object Schema:
{
  "action": "add" | "update" | "delete",
  "id": "existing-id" (if updating/deleting) or generate a new short ID (if adding),
  "content": "A concise statement of the fact",
  "category": "preference" | "project" | "fact" | "instruction"
}
`;

    try {
      const response = await AIRouter.ask(prompt, aiSettings, {
        temperature: 0.1, // low temp for extraction
      });
      
      const rawText = response.text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      const extracted: any[] = JSON.parse(rawText);
      
      if (!Array.isArray(extracted) || extracted.length === 0) return;
      
      let updatedMemories = [...currentMemories];
      
      for (const op of extracted) {
        if (op.action === 'add' && op.content) {
          const newMem: AIMemory = {
            id: op.id || `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId,
            content: op.content,
            category: op.category || 'fact',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          updatedMemories.push(newMem);
        } else if (op.action === 'update' && op.id && op.content) {
          const idx = updatedMemories.findIndex(m => m.id === op.id);
          if (idx !== -1) {
            updatedMemories[idx].content = op.content;
            updatedMemories[idx].category = op.category || updatedMemories[idx].category;
            updatedMemories[idx].updatedAt = new Date().toISOString();
          }
        } else if (op.action === 'delete' && op.id) {
          updatedMemories = updatedMemories.filter(m => m.id !== op.id);
        }
      }
      
      this.saveMemories(userId, updatedMemories);
      
      // Update embeddings for new/updated memories
      for (const mem of updatedMemories) {
         // Only embed memories that don't have embeddings in the vectorDB yet, or were updated.
         // For simplicity in this background task, we can just re-upsert the extracted ones.
      }
      
      for (const op of extracted) {
          if (op.action === 'add' || op.action === 'update') {
              const text = op.content;
              const targetId = op.action === 'add' ? updatedMemories[updatedMemories.length - 1].id : op.id; 
              // A safer way is to just find it:
              const found = updatedMemories.find(m => m.content === text);
              if (found) {
                  const embed = await this.getEmbedding(text);
                  if (embed) {
                      await vectorDB.upsert({
                          id: found.id,
                          text,
                          embedding: embed,
                          metadata: { type: 'memory' }
                      });
                  }
              }
          } else if (op.action === 'delete') {
              await vectorDB.delete(op.id);
          }
      }
      
    } catch (err) {
      console.warn('Background memory extraction failed:', err);
    }
  }

  // Generate embedding via our API endpoint
  static async getEmbedding(text: string): Promise<number[] | null> {
      try {
          const res = await fetch('/api/ai/embed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text })
          });
          if (res.ok) {
              const data = await res.json();
              return data.embedding;
          }
          return null;
      } catch {
          return null;
      }
  }
}
