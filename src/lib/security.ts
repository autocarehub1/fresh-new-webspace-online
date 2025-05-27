
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export class SecurityService {
  
  // Enhanced authentication with device fingerprinting
  static async enhancedSignIn(email: string, password: string) {
    try {
      // Get device fingerprint
      const deviceInfo = await this.getDeviceFingerprint();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          data: {
            device_fingerprint: deviceInfo.fingerprint,
            login_ip: deviceInfo.ip,
            user_agent: deviceInfo.userAgent,
            timezone: deviceInfo.timezone
          }
        }
      });

      if (error) throw error;

      // Log security event
      await this.logSecurityEvent('login_success', {
        user_id: data.user?.id,
        device_info: deviceInfo
      });

      return data;
    } catch (error) {
      // Log failed attempt
      await this.logSecurityEvent('login_failed', {
        email,
        error: error.message,
        device_info: await this.getDeviceFingerprint()
      });
      throw error;
    }
  }

  // Two-factor authentication setup
  static async setupTwoFactor(userId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: { userId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('2FA setup failed:', error);
      toast.error('Failed to setup two-factor authentication');
      throw error;
    }
  }

  // Verify two-factor authentication
  static async verifyTwoFactor(userId: string, code: string) {
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: { userId, code }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('2FA verification failed:', error);
      toast.error('Invalid verification code');
      throw error;
    }
  }

  // Session monitoring and anomaly detection
  static async monitorSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const currentDeviceInfo = await this.getDeviceFingerprint();
      
      // Check for session anomalies
      const { data, error } = await supabase.functions.invoke('monitor-session', {
        body: {
          session_id: session.access_token,
          device_info: currentDeviceInfo
        }
      });

      if (error) throw error;
      
      if (data?.anomaly_detected) {
        toast.error('Suspicious activity detected. Please verify your identity.');
        return data;
      }

      return data;
    } catch (error) {
      console.error('Session monitoring failed:', error);
    }
  }

  // Secure file upload with virus scanning
  static async secureFileUpload(file: File, path: string) {
    try {
      // Check file type and size
      if (!this.isAllowedFileType(file)) {
        throw new Error('File type not allowed');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size too large');
      }

      // Upload with virus scan
      const { data, error } = await supabase.functions.invoke('secure-upload', {
        body: {
          file: await this.fileToBase64(file),
          path,
          filename: file.name,
          mime_type: file.type
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Secure upload failed:', error);
      toast.error('File upload failed security check');
      throw error;
    }
  }

  // Get device fingerprint for security
  private static async getDeviceFingerprint() {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screen = `${window.screen.width}x${window.screen.height}`;
    
    // Get IP address (simplified)
    let ip = 'unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ip = data.ip;
    } catch (error) {
      console.warn('Could not get IP address');
    }

    const fingerprint = btoa(`${userAgent}|${language}|${timezone}|${screen}`);
    
    return {
      fingerprint,
      ip,
      userAgent,
      language,
      timezone,
      screen
    };
  }

  // Log security events
  private static async logSecurityEvent(event_type: string, metadata: any) {
    try {
      await supabase.from('security_logs').insert({
        event_type,
        metadata,
        timestamp: new Date().toISOString(),
        ip_address: metadata.device_info?.ip || 'unknown'
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Check allowed file types
  private static isAllowedFileType(file: File): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'application/pdf',
      'text/plain'
    ];
    return allowedTypes.includes(file.type);
  }

  // Convert file to base64
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}
