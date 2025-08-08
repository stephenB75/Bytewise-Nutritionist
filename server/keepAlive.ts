// Server Keep-Alive Monitor
// Ensures the backend service stays running and responsive

export class KeepAliveMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly checkInterval = 60000; // Check every minute

  constructor(private port: number = 5000) {}

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        // Self-ping to keep server active
        const response = await fetch(`http://localhost:${this.port}/api/health`);
        const data = await response.json();
        
        if (data.status === 'healthy') {
          // Server is responsive
        } else {
          console.warn('⚠️ Server health check returned unhealthy status');
        }
      } catch (error) {
        console.error('❌ Server health check failed:', error);
      }
    }, this.checkInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Global instance
export const keepAliveMonitor = new KeepAliveMonitor();