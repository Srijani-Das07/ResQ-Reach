// Client-side emergency calling system
class EmergencyCallSystem {
  constructor() {
    this.callQueue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
    this.waitTime = 30000; // 30 seconds between attempts
  }

  // Initialize emergency call flow
  async initiateEmergencyCall(contacts, location, message) {
    try {
      console.log('Initiating emergency call sequence...');
      
      const callFlow = [
        {
          step: 1,
          contact: 'primary',
          phone: contacts.primary.phone,
          name: contacts.primary.name,
          waitTime: this.waitTime
        },
        {
          step: 2,
          contact: 'secondary',
          phone: contacts.secondary.phone,
          name: contacts.secondary.name,
          waitTime: this.waitTime
        },
        {
          step: 3,
          contact: 'emergency_services',
          phone: '108',
          name: 'Emergency Services',
          waitTime: 0
        }
      ];

      // If online, try Twilio/VoIP first
      if (navigator.onLine) {
        const onlineResult = await this.tryOnlineCall(contacts, message, location);
        if (onlineResult.success) {
          return onlineResult;
        }
      }

      // Fallback to device dialer (offline-safe)
      return await this.processOfflineCallFlow(callFlow, message, location);

    } catch (error) {
      console.error('Emergency call initiation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Try online call through server/Twilio
  async tryOnlineCall(contacts, message, location) {
    try {
      const response = await fetch('/api/emergency/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          primaryContact: contacts.primary.phone,
          secondaryContact: contacts.secondary.phone,
          message,
          location
        })
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, method: 'online', ...result };
      }

      throw new Error('Online call failed');

    } catch (error) {
      console.error('Online call error:', error);
      return { success: false, method: 'online', error: error.message };
    }
  }

  // Process offline call flow using device dialer
  async processOfflineCallFlow(callFlow, message, location) {
    for (const call of callFlow) {
      try {
        console.log(`Attempting call to ${call.name} (${call.phone})`);
        
        // Show user prompt
        const shouldCall = await this.showCallPrompt(call, message);
        
        if (shouldCall) {
          // Use device dialer
          const callResult = await this.makeDeviceCall(call.phone, call.name);
          
          if (callResult.success) {
            // Wait for user confirmation or timeout
            const callStatus = await this.waitForCallCompletion(call);
            
            if (callStatus === 'completed') {
              return {
                success: true,
                method: 'offline',
                contactReached: call.contact,
                phone: call.phone
              };
            }
          }
        }

        // Wait before trying next contact (except for last one)
        if (call.waitTime > 0) {
          await this.delay(call.waitTime);
        }

      } catch (error) {
        console.error(`Call attempt ${call.step} failed:`, error);
        continue;
      }
    }

    return {
      success: false,
      method: 'offline',
      error: 'All emergency contacts attempted'
    };
  }

  // Make call using device dialer
  async makeDeviceCall(phoneNumber, contactName) {
    try {
      // Clean phone number
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      
      // Use tel: URI to trigger device dialer
      const telUri = `tel:${cleanNumber}`;
      
      // Create temporary link and click it
      const link = document.createElement('a');
      link.href = telUri;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log the call attempt
      await this.logCallAttempt(phoneNumber, contactName, 'initiated');

      return { success: true };

    } catch (error) {
      console.error('Device call error:', error);
      return { success: false, error: error.message };
    }
  }

  // Show call prompt to user
  async showCallPrompt(call, message) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'emergency-call-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <h3>🚨 Emergency Call</h3>
          <p>Calling <strong>${call.name}</strong></p>
          <p>Phone: <strong>${call.phone}</strong></p>
          <p>Message: "${message}"</p>
          <div class="modal-buttons">
            <button id="call-now" class="btn-emergency">📞 Call Now</button>
            <button id="skip-call" class="btn-secondary">Skip</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('call-now').onclick = () => {
        document.body.removeChild(modal);
        resolve(true);
      };

      document.getElementById('skip-call').onclick = () => {
        document.body.removeChild(modal);
        resolve(false);
      };

      // Auto-call after 10 seconds for critical situations
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
          resolve(true);
        }
      }, 10000);
    });
  }

  // Wait for call completion confirmation
  async waitForCallCompletion(call) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'call-status-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <h3>📞 Call in Progress</h3>
          <p>Calling <strong>${call.name}</strong></p>
          <p>Did someone answer?</p>
          <div class="modal-buttons">
            <button id="call-answered" class="btn-success">✅ Call Answered</button>
            <button id="call-failed" class="btn-danger">❌ No Answer / Busy</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      document.getElementById('call-answered').onclick = () => {
        document.body.removeChild(modal);
        resolve('completed');
      };

      document.getElementById('call-failed').onclick = () => {
        document.body.removeChild(modal);
        resolve('failed');
      };

      // Auto-timeout after wait time
      setTimeout(() => {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
          resolve('timeout');
        }
      }, call.waitTime);
    });
  }

  // Log call attempt for sync when online
  async logCallAttempt(phoneNumber, contactName, status) {
    try {
      const logData = {
        phoneNumber,
        contactName,
        status,
        timestamp: new Date().toISOString(),
        location: await this.getCurrentLocation()
      };

      // Store locally first
      const callLogs = JSON.parse(localStorage.getItem('emergency_call_logs') || '[]');
      callLogs.push(logData);
      localStorage.setItem('emergency_call_logs', JSON.stringify(callLogs));

      // Try to sync if online
      if (navigator.onLine) {
        await this.syncCallLog(logData);
      }

    } catch (error) {
      console.error('Log call attempt error:', error);
    }
  }

  // Sync call log with server
  async syncCallLog(logData) {
    try {
      await fetch('/api/emergency/call/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(logData)
      });
    } catch (error) {
      console.error('Sync call log error:', error);
    }
  }

  // Get current location for emergency
  async getCurrentLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ error: 'Geolocation not supported' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          resolve({ error: error.message });
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.EmergencyCallSystem = EmergencyCallSystem;
}