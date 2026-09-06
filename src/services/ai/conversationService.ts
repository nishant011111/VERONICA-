import { AIConversation, ChatMessage, AcademicMode, ExplanationLevel } from '../../types';
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { getApps, getApp } from 'firebase/app';


const STORAGE_PREFIX = 'veronica_conversations_';

export class ConversationService {
  private static getStorageKey(userId: string): string {
    return `${STORAGE_PREFIX}${userId || 'local_user'}`;
  }

  /** Load all conversations for a specific authenticated user */
  static getConversations(userId: string): AIConversation[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (!raw) return [];
      const parsed: AIConversation[] = JSON.parse(raw);
      return parsed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      console.error('Failed to parse user conversations:', e);
      return [];
    }
  }

  /** Save conversation list for a user */
  
  private static async syncToFirebase(userId: string, conversations: AIConversation[]) {
    if (!userId || userId === 'local_user') return;
    try {
      const db = getFirestore(getApp());
      const convRef = doc(db, 'users', userId, 'data', 'conversations');
      // Strip undefined values which Firebase rejects
      const sanitizedConversations = JSON.parse(JSON.stringify(conversations));
      await setDoc(convRef, { conversations: sanitizedConversations }, { merge: true });
    } catch (e) {
      console.error('Failed to sync conversations to Firebase:', e);
    }
  }

  static async loadFromFirebase(userId: string): Promise<AIConversation[]> {
    if (!userId || userId === 'local_user') return [];
    try {
      const db = getFirestore(getApp());
      const convRef = doc(db, 'users', userId, 'data', 'conversations');
      const { getDoc } = await import('firebase/firestore');
      const snapshot = await getDoc(convRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.conversations) {
          this.saveConversations(userId, data.conversations, true);
          return data.conversations;
        }
      }
    } catch (e) {
      console.error('Failed to load conversations from Firebase:', e);
    }
    return [];
  }

  private static saveConversations(userId: string, conversations: AIConversation[], skipFirebase = false): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(conversations));
      if (!skipFirebase) this.syncToFirebase(userId, conversations);
    } catch (e) {
      console.error('Failed to save user conversations:', e);
    }
  }

  /** Create a brand new conversation */
  static createConversation(
    userId: string,
    initialTitle = 'New Academic Chat',
    academicMode: AcademicMode = 'general',
    explanationLevel: ExplanationLevel = 'university',
    subjectId?: string
  ): AIConversation {
    const newConv: AIConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: initialTitle,
      academicMode,
      explanationLevel,
      subjectId,
      messages: [],
      isPinned: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const convs = this.getConversations(userId);
    convs.unshift(newConv);
    this.saveConversations(userId, convs);
    return newConv;
  }

  /** Update conversation messages & details */
  static saveMessageToConversation(
    userId: string,
    conversationId: string,
    messages: ChatMessage[],
    autoTitlePrompt?: string
  ): AIConversation | null {
    const convs = this.getConversations(userId);
    const index = convs.findIndex(c => c.id === conversationId);
    if (index === -1) return null;

    const conv = convs[index];
    conv.messages = messages;
    conv.updatedAt = new Date().toISOString();

    // Auto update title if first user prompt and title is generic
    if (autoTitlePrompt && (conv.title === 'New Academic Chat' || conv.title === 'New Chat')) {
      conv.title = autoTitlePrompt.slice(0, 36) + (autoTitlePrompt.length > 36 ? '...' : '');
    }

    convs[index] = conv;
    this.saveConversations(userId, convs);
    return conv;
  }

  /** Toggle Pin */
  static togglePin(userId: string, conversationId: string): AIConversation[] {
    const convs = this.getConversations(userId);
    const index = convs.findIndex(c => c.id === conversationId);
    if (index !== -1) {
      convs[index].isPinned = !convs[index].isPinned;
      convs[index].updatedAt = new Date().toISOString();
      this.saveConversations(userId, convs);
    }
    return this.getConversations(userId);
  }

  /** Toggle Archive */
  static toggleArchive(userId: string, conversationId: string): AIConversation[] {
    const convs = this.getConversations(userId);
    const index = convs.findIndex(c => c.id === conversationId);
    if (index !== -1) {
      convs[index].isArchived = !convs[index].isArchived;
      convs[index].updatedAt = new Date().toISOString();
      this.saveConversations(userId, convs);
    }
    return this.getConversations(userId);
  }

  /** Rename conversation */
  static renameConversation(userId: string, conversationId: string, newTitle: string): AIConversation[] {
    const convs = this.getConversations(userId);
    const index = convs.findIndex(c => c.id === conversationId);
    if (index !== -1) {
      convs[index].title = newTitle.trim() || 'Untitled Chat';
      convs[index].updatedAt = new Date().toISOString();
      this.saveConversations(userId, convs);
    }
    return this.getConversations(userId);
  }

  /** Delete a single conversation */
  static deleteConversation(userId: string, conversationId: string): AIConversation[] {
    const convs = this.getConversations(userId);
    const filtered = convs.filter(c => c.id !== conversationId);
    this.saveConversations(userId, filtered);
    return filtered;
  }

  /** Delete ALL AI conversation history for a user */
  static deleteAllHistory(userId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.getStorageKey(userId));
  }
}
