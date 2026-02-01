export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email, company, role, context } = req.body;

  if (!name || !email || !context) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Replace with your real email or automation logic
  console.log('New contact form submission:', {
    name,
    email,
    company,
    role,
    context
  });

  // Optional: send to email via SendGrid/Mailgun/etc or save to Airtable, Notion, Google Sheets...

  return res.status(200).json({ message: 'Submission received' });
}
