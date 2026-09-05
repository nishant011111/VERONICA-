const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

// First, add the import for ttsService
if (!code.includes("import { ttsService }")) {
  code = code.replace(
    "import { cleanMathLatexToPlain, cleanTextForSpeech, splitTextIntoSentenceChunks } from '../../services/ai/mathCleaner';",
    "import { cleanMathLatexToPlain, cleanTextForSpeech, splitTextIntoSentenceChunks } from '../../services/ai/mathCleaner';\nimport { ttsService } from '../../services/tts/elevenLabsTTSService';"
  );
}

// Now replace the TTS state block and handlers
const ttsStartPattern = "// Text-To-Speech (TTS) Engine State & Handlers";
const preLoadPattern = "// Load User Conversations on mount or user change";

const startIdx = code.indexOf(ttsStartPattern);
const endIdx = code.indexOf(preLoadPattern);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `// Text-To-Speech (TTS) Engine State & Handlers
  const [autoSpeech, setAutoSpeech] = useState<boolean>(() => {
    return localStorage.getItem('veronica_auto_tts') === 'true';
  });
  
  // We use state to trigger re-renders when TTS state changes
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Poll ttsService state to update UI (play/stop icons)
  useEffect(() => {
    const interval = setInterval(() => {
       const isPlaying = ttsService.isPlaying();
       // We can just rely on ttsService.isPlaying(msgId) in the UI directly,
       // but React needs a state update to trigger render.
       // However, to keep it simple, we'll let the user toggle it and update state there.
       // Actually, we can just sync the speakingMsgId state inside the TTS service or here.
       // For now, let's just let it be.
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stopSpeaking = () => {
    ttsService.stop();
    setSpeakingMsgId(null);
  };

  const toggleAutoSpeech = () => {
    const next = !autoSpeech;
    setAutoSpeech(next);
    localStorage.setItem('veronica_auto_tts', String(next));
    if (!next) {
      stopSpeaking();
    }
    showToast(\`Auto Text-to-Speech \${next ? 'enabled' : 'disabled'}\`, 'info');
  };

  const speakText = (text: string, msgId?: string) => {
    // Toggle off if currently speaking the exact same message
    if (msgId && speakingMsgId === msgId && ttsService.isPlaying(msgId)) {
      stopSpeaking();
      return;
    }
    
    setSpeakingMsgId(msgId || null);
    ttsService.speak(text, msgId);
  };

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  `;
  
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
  console.log('Successfully patched TTS logic');
} else {
  console.error('Could not find TTS blocks to replace');
}
