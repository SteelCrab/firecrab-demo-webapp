// Integration test. Runs only when DATABASE_URL points at a PostgreSQL database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { createDb } from '../lib/db.js';

const databaseUrl = process.env.DATABASE_URL;

test('API lists questions in arrival order', { skip: !databaseUrl && 'DATABASE_URL is not set' }, async (t) => {
  const db = createDb(databaseUrl);
  await db.init();
  await db.clear();
  const server = createApp(db);
  await new Promise(resolve => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    server.close();
    await db.close();
  });

  const post = (body) => fetch(`${base}/api/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  assert.equal((await post({ name: '', question: 'x' })).status, 400);
  assert.equal((await post({ name: '민수', question: '첫 질문' })).status, 201);
  assert.equal((await post({ name: '지영', question: '둘째 질문' })).status, 201);

  const res = await fetch(`${base}/api/questions`);
  assert.equal(res.status, 200);
  const { questions } = await res.json();
  assert.deepEqual(questions.map(q => q.question), ['첫 질문', '둘째 질문']);

  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /학생 질문 게시판/);
});
