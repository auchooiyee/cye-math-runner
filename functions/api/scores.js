const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

const columns = 'name, score, distance, accuracy, mode, grade, date';

function database(context) {
  return context.env?.DB || null;
}

export async function onRequestGet(context) {
  const db = database(context);
  if (!db) return json({ success: false, error: 'Leaderboard database is not configured' }, 503);

  const requested = Number(new URL(context.request.url).searchParams.get('limit'));
  const limit = Number.isInteger(requested) && requested > 0 ? Math.min(requested, 50) : 10;
  try {
    const result = await db.prepare(`SELECT ${columns} FROM scores ORDER BY score DESC, updated_at ASC LIMIT ?`)
      .bind(limit).all();
    return json({ success: true, scores: result.results || [] });
  } catch (error) {
    console.error('Could not load leaderboard', error);
    return json({ success: false, error: 'Leaderboard is temporarily unavailable' }, 503);
  }
}

export async function onRequestPost(context) {
  const db = database(context);
  if (!db) return json({ success: false, error: 'Leaderboard database is not configured' }, 503);
  if (!context.request.headers.get('content-type')?.includes('application/json')) {
    return json({ success: false, error: 'JSON required' }, 415);
  }
  if (Number(context.request.headers.get('content-length') || 0) > 2048) {
    return json({ success: false, error: 'Payload too large' }, 413);
  }

  let data;
  try {
    data = await context.request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }
  const playerId = data?.playerId;
  const name = typeof data?.name === 'string' ? data.name.trim() : '';
  const score = data?.score;
  const distance = data?.distance;
  const accuracy = data?.accuracy;
  const mode = data?.mode;
  const grade = data?.grade == null ? null : data.grade;
  const valid = typeof playerId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(playerId)
    && Array.from(name).length <= 20 && /^[\p{L}\p{N}_ -]+$/u.test(name)
    && Number.isSafeInteger(score) && score > 0 && score <= 10000000
    && Number.isSafeInteger(distance) && distance >= 0 && distance <= 10000000
    && typeof accuracy === 'number' && Number.isFinite(accuracy) && accuracy >= 0 && accuracy <= 100
    && (mode === 'sprint' || mode === 'endless')
    && (grade === null || (typeof grade === 'string' && /^(?:A[+-]?|B\+?|C\+?|D|E|G)$/.test(grade)));
  if (!valid) return json({ success: false, error: 'Invalid score' }, 400);

  try {
    const result = await db.prepare(`
      INSERT INTO scores (player_id, name, score, distance, accuracy, mode, grade)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(player_id) DO UPDATE SET
        name = excluded.name, score = excluded.score, distance = excluded.distance,
        accuracy = excluded.accuracy, mode = excluded.mode, grade = excluded.grade,
        date = date('now'), updated_at = datetime('now')
      WHERE excluded.score > scores.score
    `).bind(playerId, name, score, distance, accuracy, mode, grade).run();
    return json({ success: true, improved: (result.meta?.changes || 0) > 0 }, 201);
  } catch (error) {
    console.error('Could not save leaderboard score', error);
    return json({ success: false, error: 'Score could not be saved' }, 503);
  }
}
