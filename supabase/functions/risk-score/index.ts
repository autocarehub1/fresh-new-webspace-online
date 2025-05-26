import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RiskFactors {
  ipAddress: string;
  userAgent: string;
  userId?: string;
  email?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    if (req.method === 'POST') {
      const { ipAddress, userAgent, userId, email }: RiskFactors = await req.json();

      // Initialize risk score
      let riskScore = 0;
      let challengeRequired = false;

      // Check for recent failed attempts
      const { data: recentAttempts } = await supabaseClient
        .from('login_attempts')
        .select('*')
        .eq('ip_address', ipAddress)
        .eq('success', false)
        .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Last 15 minutes

      if (recentAttempts && recentAttempts.length > 0) {
        riskScore += recentAttempts.length * 10;
        if (recentAttempts.length >= 3) {
          challengeRequired = true;
        }
      }

      // Check for known IP
      const { data: knownIPs } = await supabaseClient
        .from('login_attempts')
        .select('ip_address')
        .eq('user_id', userId)
        .eq('success', true)
        .limit(1);

      if (!knownIPs || knownIPs.length === 0) {
        riskScore += 20; // New IP
      }

      // Check for suspicious user agent
      const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /headless/i,
        /phantom/i,
        /selenium/i,
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        riskScore += 30;
        challengeRequired = true;
      }

      // Check for high-risk countries (example)
      const highRiskCountries = ['XX', 'YY', 'ZZ']; // Replace with actual country codes
      const ipCountry = await getCountryFromIP(ipAddress);
      if (highRiskCountries.includes(ipCountry)) {
        riskScore += 25;
        challengeRequired = true;
      }

      // Check for time-based anomalies
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentHour = new Date().getHours();
      if (currentHour < 6 || currentHour > 22) {
        riskScore += 15;
      }

      // Store the attempt
      await supabaseClient.from('login_attempts').insert({
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: false,
        risk_score: riskScore,
        challenge_required: challengeRequired,
      });

      // Log the risk assessment
      if (userId) {
        await supabaseClient.from('auth_audit_logs').insert({
          user_id: userId,
          action: 'risk_assessment',
          ip_address: ipAddress,
          user_agent: userAgent,
          metadata: {
            risk_score: riskScore,
            challenge_required: challengeRequired,
            factors: {
              recent_failed_attempts: recentAttempts?.length || 0,
              known_ip: knownIPs?.length > 0,
              suspicious_user_agent: suspiciousPatterns.some(pattern => pattern.test(userAgent)),
              high_risk_country: highRiskCountries.includes(ipCountry),
              unusual_time: currentHour < 6 || currentHour > 22,
            },
          },
        });
      }

      return new Response(
        JSON.stringify({
          riskScore,
          challengeRequired,
          factors: {
            recentFailedAttempts: recentAttempts?.length || 0,
            knownIP: knownIPs?.length > 0,
            suspiciousUserAgent: suspiciousPatterns.some(pattern => pattern.test(userAgent)),
            highRiskCountry: highRiskCountries.includes(ipCountry),
            unusualTime: currentHour < 6 || currentHour > 22,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Method not allowed');
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

// Helper function to get country from IP (implement with your preferred IP geolocation service)
async function getCountryFromIP(ip: string): Promise<string> {
  // Implement IP geolocation logic here
  // For example, using a free IP geolocation API
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return data.country_code;
  } catch (error) {
    console.error('Error getting country from IP:', error);
    return 'UNKNOWN';
  }
} 