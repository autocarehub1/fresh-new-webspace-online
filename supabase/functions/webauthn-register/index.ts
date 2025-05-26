import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from 'https://esm.sh/@simplewebauthn/server@7.3.0';
import { isoBase64URL } from 'https://esm.sh/@simplewebauthn/server/helpers@7.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get the user from the JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      throw new Error('Invalid user');
    }

    if (req.method === 'POST') {
      const { deviceName } = await req.json();

      // Generate registration options
      const options = await generateRegistrationOptions({
        rpName: 'Express Med Dispatch',
        rpID: new URL(Deno.env.get('SUPABASE_URL') ?? '').hostname,
        userID: user.id,
        userName: user.email ?? '',
        attestationType: 'none',
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
          authenticatorAttachment: 'platform',
        },
        supportedAlgorithmIDs: [-7, -257], // ES256, RS256
      });

      // Store the challenge in the user's session
      await supabaseClient
        .from('mfa_settings')
        .upsert({
          user_id: user.id,
          webauthn_enabled: false,
          totp_enabled: false,
        })
        .select();

      return new Response(
        JSON.stringify({
          options,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (req.method === 'PUT') {
      const { credential } = await req.json();

      // Verify the registration response
      const verification = await verifyRegistrationResponse({
        credential,
        expectedChallenge: credential.challenge,
        expectedOrigin: Deno.env.get('SUPABASE_URL') ?? '',
        expectedRPID: new URL(Deno.env.get('SUPABASE_URL') ?? '').hostname,
        requireUserVerification: true,
      });

      if (verification.verified && verification.registrationInfo) {
        const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

        // Store the credential
        await supabaseClient.from('webauthn_credentials').insert({
          user_id: user.id,
          credential_id: isoBase64URL.fromBuffer(credentialID),
          public_key: isoBase64URL.fromBuffer(credentialPublicKey),
          counter,
          device_name: credential.deviceName,
          device_type: credential.deviceType,
        });

        // Update MFA settings
        await supabaseClient
          .from('mfa_settings')
          .update({ webauthn_enabled: true })
          .eq('user_id', user.id);

        // Log the registration
        await supabaseClient.from('auth_audit_logs').insert({
          user_id: user.id,
          action: 'webauthn_register',
          metadata: {
            device_name: credential.deviceName,
            device_type: credential.deviceType,
          },
        });

        return new Response(
          JSON.stringify({
            verified: true,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      throw new Error('Verification failed');
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