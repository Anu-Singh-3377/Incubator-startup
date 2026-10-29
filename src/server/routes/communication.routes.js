import express from 'express';
import { verifySupabaseAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * Check Resend configuration status
 */
router.get('/status', (req, res) => {
  const apiKey = process.env.RESEND_API_KEY;
  const isConfigured = Boolean(
    apiKey &&
    !apiKey.includes('your_api_key') &&
    apiKey.startsWith('re_')
  );

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'VentureBharat Incubation <onboarding@resend.dev>';

  res.status(200).json({
    configured: isConfigured,
    senderEmail: fromEmail,
    provider: 'Resend',
    helpMessage: isConfigured
      ? 'Resend API key is active and verified for broadcasts.'
      : 'Resend API Key is not configured in .env. Please configure RESEND_API_KEY (e.g. re_xxxx) and a verified sender domain to enable live email delivery.'
  });
});

/**
 * Send an email broadcast via Resend API
 */
router.post('/send', verifySupabaseAdmin, async (req, res) => {
  try {
    const { recipients, subject, htmlBody, audienceFilter, templateId, isTest } = req.body;

    if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Recipient address or audience list is required.'
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email subject line is required.'
      });
    }

    if (!htmlBody || !htmlBody.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email body content is required.'
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const isConfigured = Boolean(
      apiKey &&
      !apiKey.includes('your_api_key') &&
      apiKey.startsWith('re_')
    );

    // If Resend is NOT configured, report error clearly (never fake delivery!)
    if (!isConfigured) {
      return res.status(400).json({
        success: false,
        configured: false,
        message: 'Resend is not configured on this server. Please add your RESEND_API_KEY in the root .env file and restart the server to deliver live emails.',
        error: 'RESEND_API_KEY_MISSING'
      });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'VentureBharat Incubation <onboarding@resend.dev>';
    const toList = Array.isArray(recipients) ? recipients : [recipients];

    // Dispatch to Resend REST API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toList,
        subject,
        html: htmlBody
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[Resend API Error]:', resendData);
      return res.status(resendResponse.status).json({
        success: false,
        message: resendData.message || 'Resend provider error while sending message.',
        error: resendData
      });
    }

    return res.status(200).json({
      success: true,
      message: `Email broadcast successfully accepted by Resend for ${toList.length} recipient(s).`,
      providerMessageId: resendData.id,
      recipientCount: toList.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[Communication Send Exception]:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An unexpected error occurred while dispatching email.'
    });
  }
});

/**
 * Send a single test email
 */
router.post('/test', verifySupabaseAdmin, async (req, res) => {
  try {
    const { testEmail, subject, htmlBody } = req.body;

    if (!testEmail || !testEmail.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid test destination email address is required.'
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const isConfigured = Boolean(
      apiKey &&
      !apiKey.includes('your_api_key') &&
      apiKey.startsWith('re_')
    );

    if (!isConfigured) {
      return res.status(400).json({
        success: false,
        configured: false,
        message: 'Resend API key is not configured in .env. Test emails cannot be delivered until a valid RESEND_API_KEY is supplied.'
      });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'VentureBharat Incubation <onboarding@resend.dev>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [testEmail],
        subject: `[TEST PREVIEW] ${subject || 'Incubator Communication Preview'}`,
        html: htmlBody || '<p>This is a test preview message from VentureBharat Incubation Portal.</p>'
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return res.status(resendResponse.status).json({
        success: false,
        message: resendData.message || 'Resend test dispatch rejected.',
        error: resendData
      });
    }

    return res.status(200).json({
      success: true,
      message: `Test email successfully dispatched to ${testEmail}.`,
      providerMessageId: resendData.id
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to dispatch test email.'
    });
  }
});

export default router;

