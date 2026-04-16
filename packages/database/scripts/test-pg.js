const { Client } = require('pg');

const pass = 'zJZXidNHzMQ0roNE';
const projectRef = 'hvpesmplwfkobnbsswpb';

const configs = [
  { name: 'aws-1 pooler 5432 proj-ref', connectionString: `postgresql://postgres.${projectRef}:${pass}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres` },
  { name: 'aws-1 pooler 5432 plain', connectionString: `postgresql://postgres:${pass}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres` },
  { name: 'aws-0 pooler 5432 proj-ref', connectionString: `postgresql://postgres.${projectRef}:${pass}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres` },
  { name: 'aws-0 pooler 5432 plain', connectionString: `postgresql://postgres:${pass}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres` },
];

(async () => {
  for (const cfg of configs) {
    const client = new Client(cfg);
    try {
      await client.connect();
      const res = await client.query('SELECT 1');
      console.log(`✅ ${cfg.name}: OK (rows=${res.rowCount})`);
      await client.end();
      break;
    } catch (err) {
      console.log(`❌ ${cfg.name}: ${err.message}`);
      await client.end().catch(() => {});
    }
  }
  process.exit(0);
})();
