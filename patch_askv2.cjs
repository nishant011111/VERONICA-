const fs = require('fs');
let code = fs.readFileSync('src/components/screens/AskVeronicaScreen.tsx', 'utf8');

const ttsStartPattern = "// We use state to trigger re-renders when TTS state changes";
const preLoadPattern = "const stopSpeaking = () => {";

const startIdx = code.indexOf(ttsStartPattern);
const endIdx = code.indexOf(preLoadPattern);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `// We use state to trigger re-renders when TTS state changes
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Sync TTS state to UI
  useEffect(() => {
    ttsService.setOnStateChange((isPlaying, msgId) => {
      if (isPlaying && msgId) {
        setSpeakingMsgId(msgId);
      } else {
        setSpeakingMsgId(null);
      }
    });
    return () => {
      ttsService.setOnStateChange(() => {});
    };
  }, []);

  `;
  
  code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
  fs.writeFileSync('src/components/screens/AskVeronicaScreen.tsx', code);
  console.log('Successfully patched TTS sync callback');
} else {
  console.error('Could not find TTS blocks to replace');
}
