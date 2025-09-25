const twilio = require('twilio');
const config = require('../config/env');

class CallService {
  constructor() {
    // Initialize Twilio client if credentials are provided
    if (config.twilioAccountSid && config.twilioAuthToken) {
      this.twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken);
    }
  }

  // Make emergency call through Twilio (when online)
  async makeEmergencyCall(fromNumber, toNumber, message) {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    try {
      const call = await this.twilioClient.calls.create({
        from: config.twilioPhoneNumber,
        to: toNumber,
        twiml: `<Response>
          <Say voice="alice">Emergency call from ${fromNumber}. ${message}</Say>
          <Pause length="2"/>
          <Say voice="alice">This is an automated emergency notification. Please respond immediately.</Say>
        </Response>`
      });

      return {
        success: true,
        callSid: call.sid,
        status: call.status
      };

    } catch (error) {
      console.error('Twilio call error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get call status from Twilio
  async getCallStatus(callSid) {
    if (!this.twilioClient) {
      throw new Error('Twilio not configured');
    }

    try {
      const call = await this.twilioClient.calls(callSid).fetch();
      return {
        status: call.status,
        duration: call.duration,
        endTime: call.endTime
      };
    } catch (error) {
      console.error('Get call status error:', error);
      return null;
    }
  }

  // Generate offline call instructions for client
  generateOfflineCallInstructions(emergencyContacts, location) {
    return {
      callFlow: [
        {
          step: 1,
          contact: 'primary',
          phone: emergencyContacts.primary.phone,
          name: emergencyContacts.primary.name,
          waitTime: 30000 // 30 seconds
        },
        {
          step: 2,
          contact: 'secondary',
          phone: emergencyContacts.secondary.phone,
          name: emergencyContacts.secondary.name,
          waitTime: 30000
        },
        {
          step: 3,
          contact: 'emergency_services',
          phone: '108', // Default emergency number
          name: 'Emergency Services',
          waitTime: 0
        }
      ],
      message: `Emergency! I need help. My location is approximately ${location?.address || 'unknown location'}. Please respond immediately.`,
      fallbackNumbers: {
        police: '100',
        fire: '101',
        ambulance: '102',
        disaster: '108'
      }
    };
  }
}

module.exports = new CallService();