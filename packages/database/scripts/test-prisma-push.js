const { execSync } = require('child_process');
const fs = require('fs');

const projectRef = 'hvpesmplwfkobnbsswpb';

// Витягуємо пароль з поточного .env
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
if (!dbUrlMatch) {
  console.error('Cannot find DATABASE_URL in .env');
  process.exit(1);
}
const passwordMatch = dbUrlMatch[1].match(/:(.*)@/);
const password = passwordMatch ? passwordMatch[1] : null;
if (!password) {
  console.error('Cannot extract password from DATABASE_URL');
  process.exit(1);
}

const variants = [
  { name: 'pooler plain postgres 6543', url: `postgresql://postgres:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },
  { name: 'pooler plain postgres 5432', url: `postgresql://postgres:${password}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres` },
  { name: 'pooler ref username 6543', url: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` },
  { name: 'pooler ref username 5432', url: `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres` },
];

const original = fs.readFileSync('.env', 'utf8');

for (const v of variants) {
  console.log(`\n--- Testing: ${v.name} ---`);
  let modified = original.replace(/^(DIRECT_URL=).*$/m, `DIRECT_URL="${v.url}"`);
  fs.writeFileSync('.env', modified, 'utf8');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe', cwd: __dirname + '/..' });
    console.log(`✅ SUCCESS: ${v.name}`);
    fs.writeFileSync('.env', original, 'utf8');
    process.exit(0);
  } catch (e) {
    const stderr = e.stderr ? e.stderr.toString() : e.message;
    console.log(`❌ FAILED: ${stderr.split('\n').slice(0, 3).join('\n')}`);
  }
}

fs.writeFileSync('.env', original, 'utf8');
console.log('\nRestored original .env');
console.log('All variants failed. Most likely the password has not synced to the pooler yet,');
console.log('or this Supabase project uses a different connection method.');
