import { onRequestGet, onRequestPost } from '../functions/api/scores.js';

// Netlify proxies /api/scores to this Worker; both hosts share the D1 handlers.
export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/api/scores') {
      return Response.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    const context = { request, env };
    if (request.method === 'GET') return onRequestGet(context);
    if (request.method === 'POST') return onRequestPost(context);
    return Response.json({ success: false, error: 'Method not allowed' }, {
      status: 405, headers: { Allow: 'GET, POST' }
    });
  }
};
