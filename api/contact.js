export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const payload = req.body;

  if (!payload?.name || !payload?.email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  console.log('New contact form submission:', payload);

  return res.status(200).json({ message: 'Submission received' });
}
