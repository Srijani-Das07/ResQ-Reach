// Client-side buzzer and notification handler
class OfflineBuzzer {
  constructor() {
    this.isVibrationSupported = 'vibrate' in navigator;
    this.audioContext = null;
    this.patterns = {
      emergency: [200, 100, 200, 100, 200, 100, 500],
      warning: [100, 50, 100, 50, 100],
      info: [50, 25, 50]
    };
  }

  // Initialize audio context for sound generation
  initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Trigger buzzer for notifications
  async triggerBuzzer(config) {
    const {
      vibration = true,
      sound = true,
      duration = 5000,
      pattern = 'emergency'
    } = config;

    try {
      // Vibration
      if (vibration && this.isVibrationSupported) {
        const vibPattern = this.patterns[pattern] || this.patterns.emergency;
        navigator.vibrate(vibPattern);
      }

      // Sound
      if (sound) {
        await this.playEmergencySound(pattern, duration);
      }

      return { success: true };

    } catch (error) {
      console.error('Buzzer error:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate emergency sound
  async playEmergencySound(pattern, duration) {
    if (!this.audioContext) {
      this.initAudio();
    }

    const frequencies = {
      emergency: [800, 1000, 800, 1000],
      warning: [600, 800],
      info: [400]
    };

    const freq = frequencies[pattern] || frequencies.emergency;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(freq[0], this.audioContext.currentTime);
    oscillator.type = 'square';
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

    oscillator.start();

    // Create beeping pattern
    let time = this.audioContext.currentTime;
    freq.forEach((f, index) => {
      time += 0.2;
      oscillator.frequency.setValueAtTime(f, time);
    });

    // Stop after duration
    setTimeout(() => {
      oscillator.stop();
    }, duration);
  }

  // Show visual notification
  showVisualAlert(notification) {
    // Request notification permission if needed
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const notif = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/emergency-icon.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'Critical'
      });

      notif.onclick = () => {
        // Handle notification click
        window.focus();
        notif.close();
      };

      // Auto-close after delay for non-critical notifications
      if (notification.priority !== 'Critical') {
        setTimeout(() => notif.close(), 10000);
      }
    }
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.OfflineBuzzer = OfflineBuzzer;
}