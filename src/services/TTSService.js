import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class TTSService {
  static bestVoice = null;
  static isInitialized = false;
  static sound = null;

  static async init() {
    if (this.isInitialized) return;
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const premiumVoices = voices.filter(v => 
        (v.name && (v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('enhanced') || v.name.toLowerCase().includes('network') || v.name.toLowerCase().includes('siri'))) || 
        (v.identifier && (v.identifier.toLowerCase().includes('premium') || v.identifier.toLowerCase().includes('siri') || v.identifier.toLowerCase().includes('network')))
      );
      const englishPremium = premiumVoices.filter(v => v.language && v.language.includes('en'));
      
      if (englishPremium.length > 0) {
        this.bestVoice = englishPremium[0].identifier;
      } else {
        const englishVoices = voices.filter(v => v.language && v.language.includes('en'));
        if (englishVoices.length > 0) this.bestVoice = englishVoices[0].identifier;
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('[TTSService] Voice init failed:', error);
    }
  }

  static async speak(text, options = {}) {
    await this.init();
    
    const openAiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    // If OpenAI key is present, use ultra-premium AI voice
    if (openAiKey) {
      try {
        await this.stop(); 

        const fileUri = FileSystem.documentDirectory + 'temp_tts.mp3';
        
        console.log('[TTSService] Downloading OpenAI TTS...');
        const { uri } = await FileSystem.downloadAsync(
          'https://api.openai.com/v1/audio/speech',
          fileUri,
          {
            headers: {
              'Authorization': `Bearer ${openAiKey}`,
              'Content-Type': 'application/json'
            },
            httpMethod: 'POST',
            body: JSON.stringify({
              model: 'tts-1',
              input: text,
              voice: 'nova', 
            })
          }
        );

        await this.playAudioFile(uri, options);
        return;

      } catch (err) {
        console.error('[TTSService] OpenAI TTS Failed:', err);
      }
    } else {
      /* 
      // FREE CLOUD TTS FALLBACK: StreamElements (Amazon Polly)
      // Commented out to restore instant 0-latency playback using local HD voices.
      try {
        await this.stop();
        const voice = 'Joanna'; // High-quality US Female Amazon Polly voice
        const encodedText = encodeURIComponent(text);
        const streamUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodedText}`;
        
        console.log('[TTSService] Streaming Free Cloud TTS (Amazon Polly)...');
        
        // Directly stream from URL
        await this.playAudioFile(streamUrl, options);
        return;
      } catch(err) {
        console.warn('[TTSService] Free Cloud TTS failed. Falling back to local device voice.', err);
      }
      */
    }

    // Fallback: Use the highest quality local voice we discovered
    const defaultOptions = {
      pitch: 1.1,  
      rate: 0.85, 
      voice: this.bestVoice,
      ...options
    };
    Speech.speak(text, defaultOptions);
  }

  static async playAudioFile(uri, options) {
    if (Platform.OS === 'web') {
      return new Promise((resolve, reject) => {
        const audio = new window.Audio(uri);
        this.sound = audio; // Provide an object with stopAsync / unloadAsync
        
        // Mock expo-av methods for our custom audio object
        this.sound.stopAsync = async () => { audio.pause(); };
        this.sound.unloadAsync = async () => { audio.pause(); audio.src = ''; };

        audio.onended = () => {
          this.sound = null;
          if (options.onDone) options.onDone();
          resolve();
        };
        
        audio.onerror = (e) => {
          reject(new Error('HTML5 Audio Error on Web'));
        };

        audio.play().catch(reject);
      });
    } else {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      this.sound = sound;
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          this.sound = null;
          if (options.onDone) options.onDone();
        }
      });
    }
  }

  static async stop() {
    Speech.stop();
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch(e) {}
      this.sound = null;
    }
  }
}

export default TTSService;
