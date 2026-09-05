const fs = require('fs');
let code = fs.readFileSync('src/services/tts/elevenLabsTTSService.ts', 'utf8');

// Add callback support
code = code.replace(
  'class ElevenLabsTTSService {',
  'export type TTSStateCallback = (isPlaying: boolean, msgId: string | null) => void;\n\nclass ElevenLabsTTSService {\n  private onStateChange: TTSStateCallback | null = null;\n\n  public setOnStateChange(cb: TTSStateCallback) {\n    this.onStateChange = cb;\n  }\n\n  private notifyStateChange() {\n    if (this.onStateChange) {\n      this.onStateChange(this.isPlayingAudio || this.queue.length > 0, this.currentMsgId);\n    }\n  }'
);

// Add notify calls in play/stop logic
code = code.replace(
  /this\.isPlayingAudio = false;\n\s*this\.processQueue\(\);/g,
  'this.isPlayingAudio = false;\n      this.notifyStateChange();\n      this.processQueue();'
);
code = code.replace(
  /this\.isPlayingAudio = false;\n\s*return;/g,
  'this.isPlayingAudio = false;\n      this.notifyStateChange();\n      return;'
);
code = code.replace(
  'this.isPlayingAudio = true;',
  'this.isPlayingAudio = true;\n    this.notifyStateChange();'
);

code = code.replace(
  'this.currentMsgId = null;',
  'this.currentMsgId = null;\n    this.notifyStateChange();'
);

code = code.replace(
  'this.paused = true;',
  'this.paused = true;\n      this.notifyStateChange();'
);

fs.writeFileSync('src/services/tts/elevenLabsTTSService.ts', code);
