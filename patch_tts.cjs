const fs = require('fs');
let code = fs.readFileSync('src/services/tts/elevenLabsTTSService.ts', 'utf8');

const processQueueReplacement = `
  private currentProcessId = 0;

  public stop() {
    this.currentProcessId++;
    this.queue = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = "";
      this.currentAudio = null;
    }
    this.isPlayingAudio = false;
    this.paused = false;
    this.currentMsgId = null;
    this.notifyStateChange();
  }

  private async processQueue() {
    if (this.isPlayingAudio || this.queue.length === 0 || this.paused) {
      return;
    }
    this.isPlayingAudio = true;
    this.notifyStateChange();
    const item = this.queue.shift();
    
    if (!item) {
      this.isPlayingAudio = false;
      this.notifyStateChange();
      return;
    }
    
    const processId = this.currentProcessId;

    try {
      const audioUrl = await this.fetchTTSAudio(item.text);
      
      // If stop() or speak() was called while we were fetching
      if (processId !== this.currentProcessId) {
        return;
      }

      if (!audioUrl) {
        this.isPlayingAudio = false;
        this.notifyStateChange();
        this.processQueue();
        return;
      }
      
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      
      audio.onended = () => {
        if (processId !== this.currentProcessId) return;
        this.currentAudio = null;
        this.isPlayingAudio = false;
        this.notifyStateChange();
        this.processQueue();
      };
      
      audio.onerror = (e) => {
        if (processId !== this.currentProcessId) return;
        const errStr = audio.error ? \`[\${audio.error.code}] \${audio.error.message}\` : 'Unknown';
        console.error('Audio playback error details:', errStr, e);
        this.currentAudio = null;
        this.isPlayingAudio = false;
        this.notifyStateChange();
        this.processQueue();
      };
      
      await audio.play();
      
    } catch (err) {
      if (processId !== this.currentProcessId) return;
      console.error('Error processing TTS queue (autoplay blocked?):', err);
      this.isPlayingAudio = false;
      this.notifyStateChange();
      this.processQueue();
    }
  }
`;

const fetchReplacement = `
  private async fetchTTSAudio(text: string): Promise<string | null> {
    try {
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          voiceId: this.voiceId,
          modelId: this.modelId
        })
      });
      
      if (!res.ok) {
        console.error('TTS API Error:', res.statusText);
        return null;
      }
      
      const blob = await res.blob();
      // Use Data URI to avoid blob: URL issues on Safari/iOS
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Failed to fetch TTS:', err);
      return null;
    }
  }
`;

// Replace stop and processQueue
code = code.replace(/public stop\(\) \{[\s\S]*?private async processQueue\(\) \{[\s\S]*?private async fetchTTSAudio/m, 
  processQueueReplacement.trim() + '\n\n  private async fetchTTSAudio');

// Replace fetchTTSAudio
code = code.replace(/private async fetchTTSAudio\([\s\S]*?\}\n\}/m, 
  fetchReplacement.trim() + '\n}');

fs.writeFileSync('src/services/tts/elevenLabsTTSService.ts', code);
