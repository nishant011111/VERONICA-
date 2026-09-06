const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const target = `      const response = await AIRouter.streamResponse(
        fullPrompt,
        settings.ai,
        {
          academicMode,
          explanationLevel,
          responseStyle,
          messages: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content })),
          context: {
            ...baseContext,
            ragChunks
          },
          systemPromptOverride: useKnowledgeBaseMode ? "You are in STRICT KNOWLEDGE BASE MODE. You MUST answer the user's question ONLY using the attached KNOWLEDGE BASE SOURCES. Do NOT use outside knowledge. If the answer is not contained in the sources, say 'I cannot find the answer to this in your notes.'" : undefined,
          signal: abortControllerRef.current.signal
        },`;

const replacement = `
      let relevantMemories: string[] = undefined;
      let pastConvs: string[] = undefined;

      if (settings.ai.memoryEnabled) {
          try {
              const embed = await MemoryService.getEmbedding(fullPrompt);
              if (embed) {
                  const pastResults = await vectorDB.search(embed, 'conversation', 2);
                  if (pastResults.length > 0) pastConvs = pastResults.filter(r => r.score > 0.6).map(r => r.text);

                  const allMemories = MemoryService.getMemories(userId);
                  if (allMemories.length <= 15) {
                      relevantMemories = allMemories.map(m => m.content);
                  } else {
                      const memResults = await vectorDB.search(embed, 'memory', 10);
                      relevantMemories = memResults.map(r => r.text);
                  }
              }
          } catch (e) {
              console.error('Memory retrieval failed:', e);
          }
      }

      const response = await AIRouter.streamResponse(
        fullPrompt,
        settings.ai,
        {
          academicMode,
          explanationLevel,
          responseStyle,
          messages: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content })),
          context: {
            ...baseContext,
            ragChunks,
            memories: relevantMemories,
            pastConversations: pastConvs
          },
          systemPromptOverride: useKnowledgeBaseMode ? "You are in STRICT KNOWLEDGE BASE MODE. You MUST answer the user's question ONLY using the attached KNOWLEDGE BASE SOURCES. Do NOT use outside knowledge. If the answer is not contained in the sources, say 'I cannot find the answer to this in your notes.'" : undefined,
          signal: abortControllerRef.current.signal
        },`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
