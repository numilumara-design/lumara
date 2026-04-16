const { PrismaClient } = require('@prisma/client');

const pass = 'zJZXidNHzMQ0roNE';
const projectRef = 'hvpesmplwfkobnbsswpb';

const urls = [
  `postgresql://postgres.${projectRef}:${pass}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres:${pass}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${projectRef}:${pass}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`,
];

(async () => {
  for (const u of urls) {
    const p = new PrismaClient({ datasources: { db: { url: u } } });
    try {
      await p.$queryRawUnsafe('SELECT 1');
      console.log('OK');
    } catch (e) {
      console.log('ERR: ' + e.message.split('\n')[0]);
    } finally {
      await p.$disconnect().catch(() => {});
    }
  }
})();
