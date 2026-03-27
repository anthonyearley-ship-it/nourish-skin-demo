export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body;
  if (body.type === 'send_email') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'Nourish Skin <clair@clairbeautyco.com>', to: body.email, subject: body.subject, html: body.html })
      });
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: body.model || 'claude-opus-4-5', max_tokens: body.max_tokens || 1200, system: body.system, messages: body.messages })
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
