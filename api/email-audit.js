const MAX_RESULT_LENGTH = 50000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const webhookUrl = process.env.AUDIT_ZAPIER_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('[api/email-audit] Missing AUDIT_ZAPIER_WEBHOOK_URL');
    return res.status(500).json({ message: 'Email delivery is not configured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  const email = String(body.email || '').trim().toLowerCase();
  const result = String(body.result || '').trim();

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return res.status(400).json({ message: 'Enter a valid email address' });
  }

  if (!result || result.length > MAX_RESULT_LENGTH) {
    return res.status(400).json({ message: 'Invalid audit result' });
  }

  try {
    const parsedWebhook = new URL(webhookUrl);
    if (parsedWebhook.protocol !== 'https:' || parsedWebhook.hostname !== 'hooks.zapier.com') {
      throw new Error('AUDIT_ZAPIER_WEBHOOK_URL must be a Zapier HTTPS URL');
    }
  } catch (error) {
    console.error('[api/email-audit] Invalid webhook configuration:', error.message);
    return res.status(500).json({ message: 'Email delivery is not configured' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const zapierResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        result,
        source: 'CEO Bottleneck Audit'
      }),
      signal: controller.signal
    });

    if (!zapierResponse.ok) {
      console.error('[api/email-audit] Zapier returned status', zapierResponse.status);
      return res.status(502).json({ message: 'Email delivery failed' });
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    console.error('[api/email-audit] Delivery error:', timedOut ? 'timeout' : error?.message);
    return res.status(timedOut ? 504 : 502).json({ message: 'Email delivery failed' });
  } finally {
    clearTimeout(timeout);
  }
}
