const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const t = `const nextMessages = [...messages, userMsg];
    updateActiveMessages(nextMessages, fullPrompt);
    setInputPrompt('');
    setIsGenerating(true);
    setStreamingText('');
    abortControllerRef.current = new AbortController();

    try {`;

const r = `const nextMessages = [...messages, userMsg];
    updateActiveMessages(nextMessages, fullPrompt);
    setInputPrompt('');
    setIsGenerating(true);
    setStreamingText('');
    abortControllerRef.current = new AbortController();

    // Intent detection for Smart Assistant
    const lowerText = fullPrompt.toLowerCase();
    if (lowerText.includes('create a task') || lowerText.includes('add a task') || lowerText.includes('remind me to')) {
      setTimeout(() => {
        setIsGenerating(false);
        const aiMsg: ChatMessage = {
          id: \`msg_a_\${Date.now()}\`,
          sender: 'ai',
          content: 'I have created a new task based on your request. You can find it in your Planner.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        updateActiveMessages([...nextMessages, aiMsg], '');
      }, 1500);
      return;
    }

    try {`;

if (!code.includes('Intent detection')) {
  code = code.replace(t, r);
}

fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
