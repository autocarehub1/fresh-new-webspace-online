
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();

    // Generate TOTP secret
    const secret = generateTOTPSecret();
    const qrCodeUrl = `otpauth://totp/Express%20Med%20Dispatch:${userId}?secret=${secret}&issuer=Express%20Med%20Dispatch`;

    // Store the secret
    const { error } = await supabaseClient
      .from('user_2fa_secrets')
      .upsert({
        user_id: userId,
        secret_key: secret,
        is_verified: false,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        secret,
        qrCodeUrl,
        manualEntryKey: secret
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}
