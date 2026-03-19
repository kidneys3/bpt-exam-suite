// Anthropic API proxy — runs server-side, no CORS issues
// Accessible at /.netlify/functions/claude (default Netlify path, always works)

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
  if (!apiKey || apiKey === 'PLACEHOLDER_SET_IN_NETLIFY_DASHBOARD') {
    return new Response(JSON.stringify({
      error: { message: 'ANTHROPIC_API_KEY not configured. Go to Netlify dashboard → bpt-exam-suite → Site configuration → Environment variables → set ANTHROPIC_API_KEY → redeploy.' }
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: { message: 'Invalid JSON body' } }), { status: 400 }); }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: 'Proxy fetch failed: ' + e.message } }), {
      status: 502, headers: { 'Content-Type': 'application/json' }
    });
  }
};
// No path config — uses default /.netlify/functions/claude
