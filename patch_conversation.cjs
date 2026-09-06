const fs = require('fs');
let code = fs.readFileSync('src/services/ai/conversationService.ts', 'utf8');

const targetStr = `  private static async syncToFirebase(userId: string, conversations: AIConversation[]) {
    if (!userId || userId === 'local_user') return;
    try {
      const db = getFirestore(getApp());
      const convRef = doc(db, 'users', userId, 'data', 'conversations');
      await setDoc(convRef, { conversations }, { merge: true });
    } catch (e) {
      console.error('Failed to sync conversations to Firebase:', e);
    }
  }`;

const replacementStr = `  private static async syncToFirebase(userId: string, conversations: AIConversation[]) {
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
  }`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/services/ai/conversationService.ts', code);
