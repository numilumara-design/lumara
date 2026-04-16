const { PrismaClient } = require('@prisma/client');

const pass = 'zJZXidNHzMQ0roNE';
const projectRef = 'hvpesmplwfkobnbsswpb';

const variants = [
  { name: 'pooler proj-ref 6543', url: `postgresql://postgres.${projectRef}:${pass}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },
  { name: 'pooler plain 6543', url: `postgresql://postgres:${pass}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },
  { name: 'pooler proj-ref 5432', url: `postgresql://postgres.${projectRef}:${pass}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres` },
  { name: 'pooler plain 5432', url: `postgresql://postgres:${pass}@aws-1-eu-west-1.pooler.supabase.com:5432/postgres` },
  { name: 'direct db host 5432', url: `postgresql://postgres:${pass}@db.${projectRef}.supabase.co:5432/postgres` },
];

(async () => {
  for (const v of variants) {
    const p = new PrismaClient({ datasources: { db: { url: v.url } } });
    try {
      await p.$queryRawUnsafe('SELECT 1');
      console.log('✅ ' + v.name);
    } catch (e) {
      console.log('❌ ' + v.name + ': ' + e.message.split('\n')[0]);
    } finally {
      await p.$disconnect().catch(() => {});
    }
  }
})();
