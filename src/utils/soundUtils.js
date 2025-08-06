// Sound effects utility using Web Audio API
class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.initialized = false;
    this.volume = 0.3; // Default volume
  }

  // Initialize audio context (must be called after user interaction)
  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Set master volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  // Create a beep sound
  beep(frequency = 440, duration = 0.2, type = 'sine') {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play a coin/point collection sound
  coin() {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.1);
    oscillator.type = 'square';
    
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // Play a power-up sound
  powerUp() {
    if (!this.initialized) return;
    
    const frequencies = [262, 330, 392, 523, 659];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'triangle';
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
      }, index * 50);
    });
  }

  // Play a game over sound
  gameOver() {
    if (!this.initialized) return;
    
    const frequencies = [523, 494, 466, 440, 415, 392, 370, 349];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sawtooth';
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
      }, index * 100);
    });
  }

  // Play a victory/level complete sound
  victory() {
    if (!this.initialized) return;
    
    const melody = [262, 330, 392, 523, 392, 523, 659];
    melody.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'triangle';
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
      }, index * 150);
    });
  }

  // Play a blip sound (for movement, button press)
  blip(frequency = 800, duration = 0.1) {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Play a hit/collision sound
  hit() {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
    oscillator.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // Play a shoot sound
  shoot() {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
    oscillator.type = 'square';
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Play a bounce sound (for Pong)
  bounce() {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.frequency.value = 300;
    oscillator.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Play Pac-Man waka sound
  waka() {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime + 0.1);
    oscillator.type = 'square';
    
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0, this.audioContext.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // Play Tetris line clear sound
  lineClear() {
    if (!this.initialized) return;
    
    const frequencies = [523, 659, 784, 1047];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'triangle';
        
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
      }, index * 80);
    });
  }

  // Play a place/drop sound (for Tetris)
  drop() {
    if (!this.initialized) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.15);
    oscillator.type = 'square';
    
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }
}

// Create a singleton instance
const soundGenerator = new SoundGenerator();

// Auto-initialize on first user interaction
let autoInitialized = false;
const autoInit = () => {
  if (!autoInitialized) {
    soundGenerator.init();
    autoInitialized = true;
    document.removeEventListener('click', autoInit);
    document.removeEventListener('keydown', autoInit);
    document.removeEventListener('touchstart', autoInit);
  }
};

document.addEventListener('click', autoInit);
document.addEventListener('keydown', autoInit);
document.addEventListener('touchstart', autoInit);

export default soundGenerator;