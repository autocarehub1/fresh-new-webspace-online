import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Tesseract from 'https://esm.sh/tesseract.js@4.1.1';
import { createWorker } from 'https://esm.sh/tesseract.js@4.1.1';

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
      const { documentId } = await req.json();

      // Get the document details
      const { data: document, error: documentError } = await supabaseClient
        .from('kyc_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (documentError || !document) {
        throw new Error('Document not found');
      }

      // Download the document from storage
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('kyc-documents')
        .download(document.document_url);

      if (downloadError || !fileData) {
        throw new Error('Failed to download document');
      }

      // Convert the file to base64
      const base64Data = await fileData.arrayBuffer();
      const base64String = btoa(String.fromCharCode(...new Uint8Array(base64Data)));

      // Initialize Tesseract worker
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      // Perform OCR
      const { data: ocrResult } = await worker.recognize(base64String);
      await worker.terminate();

      // Extract relevant information based on document type
      const extractedData = extractDocumentData(document.document_type, ocrResult.text);

      // Update the document with OCR results
      const { error: updateError } = await supabaseClient
        .from('kyc_documents')
        .update({
          ocr_data: {
            raw_text: ocrResult.text,
            extracted_data: extractedData,
            confidence: ocrResult.confidence,
          },
        })
        .eq('id', documentId);

      if (updateError) {
        throw new Error('Failed to update document with OCR results');
      }

      // Log the OCR processing
      await supabaseClient.from('auth_audit_logs').insert({
        user_id: document.user_id,
        action: 'kyc_document_ocr',
        metadata: {
          document_id: documentId,
          document_type: document.document_type,
          confidence: ocrResult.confidence,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          extractedData,
          confidence: ocrResult.confidence,
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

function extractDocumentData(documentType: string, text: string): Record<string, string> {
  const extractedData: Record<string, string> = {};

  switch (documentType) {
    case 'license':
      // Extract driver's license information
      const licenseRegex = {
        name: /Name:?\s*([A-Za-z\s]+)/i,
        licenseNumber: /License:?\s*([A-Z0-9]+)/i,
        expiryDate: /Expiry:?\s*(\d{2}\/\d{2}\/\d{4})/i,
        dateOfBirth: /DOB:?\s*(\d{2}\/\d{2}\/\d{4})/i,
        address: /Address:?\s*([A-Za-z0-9\s,]+)/i,
      };

      for (const [key, regex] of Object.entries(licenseRegex)) {
        const match = text.match(regex);
        if (match) {
          extractedData[key] = match[1].trim();
        }
      }
      break;

    case 'id_card':
      // Extract ID card information
      const idCardRegex = {
        name: /Name:?\s*([A-Za-z\s]+)/i,
        idNumber: /ID:?\s*([A-Z0-9]+)/i,
        dateOfBirth: /DOB:?\s*(\d{2}\/\d{2}\/\d{4})/i,
        address: /Address:?\s*([A-Za-z0-9\s,]+)/i,
      };

      for (const [key, regex] of Object.entries(idCardRegex)) {
        const match = text.match(regex);
        if (match) {
          extractedData[key] = match[1].trim();
        }
      }
      break;

    case 'passport':
      // Extract passport information
      const passportRegex = {
        name: /Name:?\s*([A-Za-z\s]+)/i,
        passportNumber: /Passport:?\s*([A-Z0-9]+)/i,
        nationality: /Nationality:?\s*([A-Za-z\s]+)/i,
        dateOfBirth: /DOB:?\s*(\d{2}\/\d{2}\/\d{4})/i,
        expiryDate: /Expiry:?\s*(\d{2}\/\d{2}\/\d{4})/i,
      };

      for (const [key, regex] of Object.entries(passportRegex)) {
        const match = text.match(regex);
        if (match) {
          extractedData[key] = match[1].trim();
        }
      }
      break;
  }

  return extractedData;
} 