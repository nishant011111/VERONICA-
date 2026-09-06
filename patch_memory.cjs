const fs = require('fs');
let code = fs.readFileSync('src/services/ai/MemoryService.ts', 'utf8');

code = code.replace(
  `      // Update embeddings for new/updated memories
      for (const op of extracted) {
          if (op.action === 'add' || op.action === 'update') {
              const text = op.content;
              const embed = await this.getEmbedding(text);
              if (embed) {
                  await vectorDB.upsert({
                      id: op.id || 'temp', // We should capture the actual generated ID above, wait
                      text,
                      embedding: embed,
                      metadata: {
                          type: 'memory'
                      }
                  });
              }
          } else if (op.action === 'delete') {
              await vectorDB.delete(op.id);
          }
      }`,
  `      // Update embeddings for new/updated memories
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
      }`
);

fs.writeFileSync('src/services/ai/MemoryService.ts', code);
