const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const target = `      updateActiveMessages([...nextMessages, veronicaMsg]);

      if (autoSpeech) {
        speakText(veronicaMsg.content, veronicaMsg.id);
      }`;

const replacement = `      updateActiveMessages([...nextMessages, veronicaMsg]);

      if (autoSpeech) {
        speakText(veronicaMsg.content, veronicaMsg.id);
      }

      // ---------------------------------------------------------
      // MEMORY & VECTOR EXTRACTION (BACKGROUND)
      // ---------------------------------------------------------
      if (settings.ai.memoryEnabled) {
          setTimeout(async () => {
              try {
                  // Extract long-term facts
                  await MemoryService.extractMemories(userId, [...nextMessages, veronicaMsg], settings.ai);
                  
                  // Embed the chat segment for Semantic Conversation Search
                  const segmentText = \`User: \${fullPrompt}\\nVeronica: \${cleanedContent}\`;
                  const embed = await MemoryService.getEmbedding(segmentText);
                  if (embed) {
                      await vectorDB.upsert({
                          id: activeConvId + '_' + Date.now(),
                          text: segmentText,
                          embedding: embed,
                          metadata: {
                              type: 'conversation',
                              conversationId: activeConvId
                          }
                      });
                  }
              } catch (e) {
                  console.warn('Background extraction failed', e);
              }
          }, 500); // Small delay to avoid blocking UI thread
      }
      // ---------------------------------------------------------
`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
