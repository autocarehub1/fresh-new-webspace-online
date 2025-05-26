import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    if (req.method === 'POST') {
      // Get documents expiring in the next 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringDocuments, error: queryError } = await supabaseClient
        .from('kyc_documents')
        .select(`
          *,
          users:user_id (
            email,
            raw_user_meta_data->name
          )
        `)
        .lt('expires_at', thirtyDaysFromNow.toISOString())
        .gt('expires_at', new Date().toISOString())
        .eq('verification_status', 'verified');

      if (queryError) {
        throw new Error('Failed to query expiring documents');
      }

      // Group documents by user
      const userDocuments = expiringDocuments.reduce((acc, doc) => {
        if (!acc[doc.user_id]) {
          acc[doc.user_id] = {
            user: doc.users,
            documents: [],
          };
        }
        acc[doc.user_id].documents.push(doc);
        return acc;
      }, {});

      // Send email notifications
      for (const [userId, data] of Object.entries(userDocuments)) {
        const { user, documents } = data;

        // Prepare email content
        const documentList = documents
          .map(doc => `- ${doc.document_type.toUpperCase()}: Expires on ${new Date(doc.expires_at).toLocaleDateString()}`)
          .join('\n');

        const emailContent = `
          Dear ${user.raw_user_meta_data.name},

          This is a reminder that the following documents will expire soon:

          ${documentList}

          Please update these documents to maintain your active status on Express Med Dispatch.

          Best regards,
          Express Med Dispatch Team
        `;

        // Send email using Supabase Edge Function
        const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
          body: {
            to: user.email,
            subject: 'Document Expiration Reminder',
            text: emailContent,
          },
        });

        if (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
          continue;
        }

        // Log the reminder
        await supabaseClient.from('auth_audit_logs').insert({
          user_id: userId,
          action: 'document_expiration_reminder',
          metadata: {
            documents: documents.map(doc => ({
              id: doc.id,
              type: doc.document_type,
              expires_at: doc.expires_at,
            })),
          },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          processedUsers: Object.keys(userDocuments).length,
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