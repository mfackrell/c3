const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanField = (value, maxLength) =>
  String(value || '').trim().slice(0, maxLength);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ message: 'Invalid submission' });
  }

  const payload = {
    name: cleanField(body.name, 100),
    email: cleanField(body.email, 254).toLowerCase(),
    company: cleanField(body.company, 200),
    reason: cleanField(body.reason, 5000),
    context: cleanField(body.context, 1000)
  };

  if (!payload.name) {
    return res.status(400).json({ message: 'Please enter your name' });
  }

  if (!EMAIL_PATTERN.test(payload.email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('[api/contact] Missing ZAPIER_WEBHOOK_URL');
    return res.status(500).json({ message: 'Contact delivery is not configured' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const zapierResponse = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });

    if (!zapierResponse.ok) {
      console.error('[api/contact] Zapier returned status', zapierResponse.status);
      return res.status(502).json({ message: 'We could not send your inquiry' });
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    console.error('[api/contact] Delivery error:', timedOut ? 'timeout' : error?.message);
    return res.status(timedOut ? 504 : 502).json({ message: 'We could not send your inquiry' });
  } finally {
    clearTimeout(timeout);
  }
}
