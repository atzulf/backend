// Vercel entry point. Forwards every request to the compiled NestJS app in dist/.
// dist/ is produced by the `vercel-build` script during deployment.
export default async function handler(req, res) {
  try {
    const { default: app } = await import('../dist/main.js');
    return await app(req, res);
  } catch (err) {
    // Surface the real startup error instead of Vercel's generic 500 page.
    console.error('Startup error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Startup error', message: String(err?.message ?? err) }));
  }
}
