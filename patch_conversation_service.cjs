const fs = require('fs');
let code = fs.readFileSync('src/services/ai/conversationService.ts', 'utf8');

const importFirebase = `import { AIConversation, ChatMessage, AcademicMode, ExplanationLevel } from '../../types';
import { getFirestore, doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { getApps, getApp } from 'firebase/app';
`;

code = code.replace(
  "import { AIConversation, ChatMessage, AcademicMode, ExplanationLevel } from '../../types';",
  importFirebase
);

const firebaseHelpers = `
  private static async syncToFirebase(userId: string, conversations: AIConversation[]) {
    if (!userId || userId === 'local_user') return;
    try {
      const db = getFirestore(getApp());
      const convRef = doc(db, 'users', userId, 'data', 'conversations');
      await setDoc(convRef, { conversations }, { merge: true });
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
`;

code = code.replace(
  "private static saveConversations(userId: string, conversations: AIConversation[]): void {",
  firebaseHelpers + "\n  private static saveConversations(userId: string, conversations: AIConversation[], skipFirebase = false): void {"
);

code = code.replace(
  "localStorage.setItem(this.getStorageKey(userId), JSON.stringify(conversations));",
  "localStorage.setItem(this.getStorageKey(userId), JSON.stringify(conversations));\n      if (!skipFirebase) this.syncToFirebase(userId, conversations);"
);

fs.writeFileSync('src/services/ai/conversationService.ts', code);
