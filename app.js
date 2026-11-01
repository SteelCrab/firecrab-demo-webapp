import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { normalizeQuestion } from './lib/questions.js';

const INDEX_HTML = new URL('./public/index.html', import.meta.url);

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 10_000) throw new Error('body too large');
  }
  return raw ? JSON.parse(raw) : {};
}

export function createApp(db) {
  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/') {
        const html = await readFile(INDEX_HTML);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
        return res.end(html);
      }
      if (req.method === 'GET' && url.pathname === '/healthz') {
        return sendJson(res, 200, { ok: true });
      }
      if (req.method === 'GET' && url.pathname === '/api/questions') {
        return sendJson(res, 200, { questions: await db.listQuestions() });
      }
      if (req.method === 'POST' && url.pathname === '/api/questions') {
        const body = await readJson(req);
        const { error, value } = normalizeQuestion(body);
        if (error) return sendJson(res, 400, { error });
        return sendJson(res, 201, { question: await db.addQuestion(value) });
      }
      sendJson(res, 404, { error: 'not found' });
    } catch (err) {
      console.error(err);
      sendJson(res, 500, { error: '서버 오류가 발생했다.' });
    }
  });
}
