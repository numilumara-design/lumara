const fs = require('fs');
const readline = require('readline');

const projectRef = 'hvpesmplwfkobnbsswpb';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter your new PostgreSQL password: ', (password) => {
  const databaseUrl = `postgresql://postgres.${projectRef}:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  const directUrl = `postgresql://postgres.${projectRef}:${password}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`;

  const files = ['apps/web/.env.local', 'packages/database/.env'];

  files.forEach((file) => {
    if (!fs.existsSync(file)) {
      console.log(`Warning: file not found ${file}`);
      return;
    }

    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/^(DATABASE_URL=).*$/m, `DATABASE_URL="${databaseUrl}"`);
    content = content.replace(/^(DIRECT_URL=).*$/m, `DIRECT_URL="${directUrl}"`);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
  });

  console.log('\nDone! Now run: node packages/database/scripts/check-secrets.cjs');
  rl.close();
});
