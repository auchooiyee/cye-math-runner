import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { onRequestGet, onRequestPost } from '../functions/api/scores.js';

function createDb() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../migrations/0001_scores.sql', import.meta.url), 'utf8'));
  return {
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        bind(...params) {
          return {
            async all() { return { results: statement.all(...params) }; },
            async run() { return { meta: { changes: statement.run(...params).changes } }; }
          };
        }
      };
    }
  };
}

const playerId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const entry = { playerId, name: 'Student_1', score: 1200, distance: 300, accuracy: 75, mode: 'endless', grade: null };
const context = (db, method = 'GET', body, limit = 10) => ({
  env: db ? { DB: db } : {},
  request: new Request(`https://example.com/api/scores?limit=${limit}`, {
    method,
    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
    body: method === 'POST' ? JSON.stringify(body) : undefined
  })
});

test('real leaderboard starts empty and accepts a score', async () => {
  const db = createDb();
  assert.deepEqual((await (await onRequestGet(context(db))).json()).scores, []);
  const posted = await onRequestPost(context(db, 'POST', entry));
  assert.equal(posted.status, 201);
  assert.equal((await posted.json()).improved, true);
  const rows = (await (await onRequestGet(context(db))).json()).scores;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Student_1');
  assert.equal(rows[0].score, 1200);
  assert.equal('player_id' in rows[0], false);
});

test('only the best score per browser is ranked, ordered by score', async () => {
  const db = createDb();
  await onRequestPost(context(db, 'POST', entry));
  const lower = await onRequestPost(context(db, 'POST', { ...entry, score: 900 }));
  assert.equal((await lower.json()).improved, false);
  await onRequestPost(context(db, 'POST', { ...entry, playerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'Student_2', score: 1500 }));
  let rows = (await (await onRequestGet(context(db))).json()).scores;
  assert.deepEqual(rows.map(row => row.score), [1500, 1200]);
  await onRequestPost(context(db, 'POST', { ...entry, score: 1800 }));
  rows = (await (await onRequestGet(context(db, 'GET', null, 1))).json()).scores;
  assert.deepEqual(rows.map(row => row.score), [1800]);
});

test('invalid submissions and missing database never create sample scores', async () => {
  const db = createDb();
  assert.equal((await onRequestPost(context(db, 'POST', { ...entry, name: '<script>' }))).status, 400);
  assert.equal((await onRequestPost(context(db, 'POST', { ...entry, score: -1 }))).status, 400);
  assert.equal((await onRequestPost(context(db, 'POST', { ...entry, accuracy: 105 }))).status, 400);
  assert.equal((await onRequestGet(context(null))).status, 503);
  assert.deepEqual((await (await onRequestGet(context(db))).json()).scores, []);
});
