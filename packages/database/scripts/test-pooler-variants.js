const { PrismaClient } = require('@prisma/client');

const pass = 'HjYr8acNKio51Sdl';
const urls = [
  'postgresql://postgres:' + pass + '@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  'postgresql://postgres:' + pass + '@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
];

(async () => {
  for (const u of urls) {
    const p = new PrismaClient({ datasources: { db: { url: u } } });
    try {
      await p.$queryRawUnsafe('SELECT 1');
      console.log('OK: ' + u.replace(pass, '***'));
    } catch(e) {
      console.log('FAIL: ' + e.message.split('\n')[0]);
    } finally {
      await p.$disconnect().catch(() => {});
    }
  }
})();
