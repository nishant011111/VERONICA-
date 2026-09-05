import { cleanTextForSpeech } from '../ai/mathCleaner';

interface TTSQueueItem {
  text: string;
  msgId?: string;
}

export type TTSStateCallback = (isPlaying: boolean, msgId: string | null) => void;

class ElevenLabsTTSService {
  private onStateChange: TTSStateCallback | null = null;

  public setOnStateChange(cb: TTSStateCallback) {
    this.onStateChange = cb;
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.isPlayingAudio || this.queue.length > 0, this.currentMsgId);
    }
  }
  private queue: TTSQueueItem[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private isPlayingAudio = false;
  private currentMsgId: string | null = null;
  private paused = false;
  
  // Settings
  private voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default female voice
  private modelId = 'eleven_turbo_v2_5';
  
  public setVoiceId(id: string) {
    this.voiceId = id;
  }
  
  public setModelId(id: string) {
    this.modelId = id;
  }

  // Pre-process text (Markdown stripping, chunking for paragraphs)
  private prepareChunks(text: string): string[] {
    const cleaned = cleanTextForSpeech(text);
    // Split by paragraphs (double newlines) or large sentence blocks if needed
    // The previous implementation used splitTextIntoSentenceChunks(text, 160)
    // We can just chunk by paragraphs to reduce API calls but keep it continuous
    
    // Split by double newline first
    const blocks = cleaned.split(/\n\s*\n/);
    const chunks: string[] = [];
    
    for (const block of blocks) {
      let currentChunk = block.trim();
      if (!currentChunk) continue;
      
      // If a single paragraph is still extremely long (e.g. > 1500 chars), we could split by sentence.
      // But ElevenLabs turbo v2.5 can handle long text up to a few thousand characters easily.
      // We'll chunk to a maximum safe limit (e.g., 2000 chars) by sentences just in case.
      if (currentChunk.length > 2000) {
         // rough sentence split
         const sentences = currentChunk.split(/(?<=[.!?])\s+/);
         let temp = "";
         for (const s of sentences) {
           if (temp.length + s.length > 2000) {
             if (temp) chunks.push(temp.trim());
             temp = s;
           } else {
             temp += (temp ? " " : "") + s;
           }
         }
         if (temp) chunks.push(temp.trim());
      } else {
         chunks.push(currentChunk);
      }
    }
    return chunks;
  }

  public speak(text: string, msgId?: string) {
    // If asking to speak the exact same message that's currently speaking/queued, we replay or do nothing?
    // The prompt says "Play Starts reading the current complete AI response."
    
    this.stop();
    this.currentMsgId = msgId || null;
    this.paused = false;

    const chunks = this.prepareChunks(text);
    
    this.queue = chunks.map(c => ({
      text: c,
      msgId: this.currentMsgId || undefined
    }));
    
    this.processQueue();
  }
  
  public pause() {
    if (this.currentAudio && this.isPlayingAudio) {
      this.currentAudio.pause();
      this.paused = true;
      this.notifyStateChange();
    }
  }
  
  public resume() {
    if (this.currentAudio && this.paused) {
      this.currentAudio.play();
      this.paused = false;
    } else if (this.queue.length > 0 && !this.isPlayingAudio) {
      this.processQueue();
    }
  }
  
  public stop() {
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
  
  public replay(text: string, msgId?: string) {
    this.speak(text, msgId);
  }

  public isPlaying(msgId?: string): boolean {
    if (msgId) {
       return this.currentMsgId === msgId && (this.isPlayingAudio || this.queue.length > 0);
    }
    return this.isPlayingAudio || this.queue.length > 0;
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

    try {
      const audioUrl = await this.fetchTTSAudio(item.text);
      if (!audioUrl) {
        // failed, just move to next chunk
        this.isPlayingAudio = false;
      this.notifyStateChange();
      this.processQueue();
        return;
      }
      
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        this.isPlayingAudio = false;
      this.notifyStateChange();
      this.processQueue();
      };
      
      audio.onerror = () => {
        console.error('Audio playback error');
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        this.isPlayingAudio = false;
      this.notifyStateChange();
      this.processQueue();
      };

      await audio.play();
      
    } catch (err) {
      console.error('Error processing TTS queue:', err);
      this.isPlayingAudio = false;
      this.notifyStateChange();
      this.processQueue();
    }
  }

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
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Failed to fetch TTS:', err);
      return null;
    }
  }
}

export const ttsService = new ElevenLabsTTSService();
