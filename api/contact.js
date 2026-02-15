export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const payload = req.body;

  // 1. THE GATEKEEPER: Stop blank requests here
  if (!payload?.name || !payload?.email || payload.name.trim() === "") {
    console.log('Blocked a blank/bot submission.');
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 2. THE SECRET CALL: Use the hidden environment variable
    const zapierResponse = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    if (zapierResponse.ok) {
      return res.status(200).json({ message: 'Success' });
    } else {
      throw new Error('Zapier failed');
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
