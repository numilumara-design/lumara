const { PrismaClient } = require('@prisma/client');

const projectRef = 'hvpesmplwfkobnbsswpb';
const password = process.argv[2];

if (!password) {
  console.error('Usage: node test-db-variants.js <password>');
  process.exit(1);
}

const variants = [
  { name: 'pooler proj-ref username', url: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },
  { name: 'pooler plain postgres', url: `postgresql://postgres:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },
  { name: 'direct proj-ref username', url: `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres` },
  { name: 'direct plain postgres', url: `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres` },
];

async function test(variant) {
  const prisma = new PrismaClient({ datasources: { db: { url: variant.url } } });
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    console.log(`✅ ${variant.name}: OK`);
    return true;
  } catch (e) {
    console.log(`❌ ${variant.name}: ${e.message.split('\n')[0]}`);
    return false;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

(async () => {
  for (const v of variants) {
    await test(v);
  }
})();
