import { createApp } from './app.js';
import { createDb } from './lib/db.js';

const port = Number(process.env.PORT ?? 3000);
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const db = createDb(databaseUrl);
await db.init();
createApp(db).listen(port, () => console.log(`student-board listening on ${port}`));
