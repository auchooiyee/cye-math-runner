// Pre-seeded high scores from top Malaysian SPM MathVerse runners
let globalScores = [
  { name: 'Aiman_SPM', score: 18450, distance: 8400, accuracy: 96.5, mode: 'sprint', grade: 'A+', date: '2026-09-15' },
  { name: 'Wei_Kang99', score: 16920, distance: 7950, accuracy: 92.0, mode: 'sprint', grade: 'A+', date: '2026-09-15' },
  { name: 'Priya_Maths', score: 15400, distance: 11200, accuracy: 88.5, mode: 'endless', grade: null, date: '2026-09-14' },
  { name: 'Siti_Nur', score: 14280, distance: 6800, accuracy: 86.0, mode: 'sprint', grade: 'A', date: '2026-09-14' },
  { name: 'Hariz_KBAT', score: 13150, distance: 6200, accuracy: 84.0, mode: 'sprint', grade: 'A', date: '2026-09-13' },
  { name: 'Mei_Ling', score: 12500, distance: 9400, accuracy: 81.5, mode: 'endless', grade: null, date: '2026-09-13' },
  { name: 'Danial_Run', score: 11800, distance: 5900, accuracy: 78.0, mode: 'sprint', grade: 'A-', date: '2026-09-12' },
  { name: 'Kavitha_R', score: 10600, distance: 8100, accuracy: 75.0, mode: 'endless', grade: null, date: '2026-09-12' },
  { name: 'Zul_Fighter', score: 9800, distance: 5200, accuracy: 71.5, mode: 'sprint', grade: 'A-', date: '2026-09-11' },
  { name: 'Farah_Form5', score: 9200, distance: 7500, accuracy: 68.0, mode: 'endless', grade: null, date: '2026-09-10' }
];

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // GET: Return top global scores
  if (event.httpMethod === 'GET') {
    const limit = parseInt(event.queryStringParameters?.limit || '20', 10);
    const sorted = [...globalScores].sort((a, b) => b.score - a.score).slice(0, limit);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: sorted.length,
        scores: sorted
      })
    };
  }

  // POST: Submit new score
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body || '{}');

      const rawName = (data.name || 'Anonymous').toString().trim().replace(/[^a-zA-Z0-9_\- ]/g, '');
      const name = (rawName.length > 0 ? rawName : 'Runner').substring(0, 15);
      const score = Math.max(0, parseInt(data.score, 10) || 0);
      const distance = Math.max(0, parseInt(data.distance, 10) || 0);
      const accuracy = Math.min(100, Math.max(0, parseFloat(data.accuracy) || 0));
      const mode = data.mode === 'sprint' ? 'sprint' : 'endless';
      const grade = data.grade || null;
      const date = new Date().toISOString().split('T')[0];

      const entry = { name, score, distance, accuracy, mode, grade, date };

      globalScores.push(entry);
      globalScores.sort((a, b) => b.score - a.score);
      if (globalScores.length > 50) {
        globalScores = globalScores.slice(0, 50);
      }

      const rank = globalScores.findIndex(s => s === entry) + 1;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          rank: rank > 0 ? rank : null,
          entry
        })
      };
    } catch (err) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid payload' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' })
  };
}
