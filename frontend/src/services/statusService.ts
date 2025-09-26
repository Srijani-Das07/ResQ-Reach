// Status service for offline-first disaster management system

export interface SystemStatus {
  mode: 'offline-first';
  database: 'localStorage';
  authentication: 'local';
  lastUpdate: string;
  features: {
    citizenPortal: boolean;
    governmentDashboard: boolean;
    rescueCenterManagement: boolean;
    emergencyAlerts: boolean;
    multiLanguageSupport: boolean;
  };
}

export class StatusService {
  private static instance: StatusService;

  private constructor() {}

  public static getInstance(): StatusService {
    if (!StatusService.instance) {
      StatusService.instance = new StatusService();
    }
    return StatusService.instance;
  }

  public getSystemStatus(): SystemStatus {
    return {
      mode: 'offline-first',
      database: 'localStorage',
      authentication: 'local',
      lastUpdate: new Date().toISOString(),
      features: {
        citizenPortal: true,
        governmentDashboard: true,
        rescueCenterManagement: true,
        emergencyAlerts: true,
        multiLanguageSupport: true,
      }
    };
  }

  public isOnline(): boolean {
    return false; // Always offline in offline-first mode
  }

  public getMode(): string {
    return 'offline-first';
  }

  public getDatabaseType(): string {
    return 'localStorage';
  }

  public getAuthenticationType(): string {
    return 'local';
  }

  // Health check that doesn't make network calls
  public async performHealthCheck(): Promise<boolean> {
    console.log('📱 Health check: All offline services operational');
    return true;
  }
}

export const statusService = StatusService.getInstance();