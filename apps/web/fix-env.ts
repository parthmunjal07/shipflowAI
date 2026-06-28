import fs from 'fs';

function fixEnv() {
  const pemPath = 'c:\\Users\\chand\\Downloads\\the-wharf-local.2026-06-26.private-key.pem';
  const envPath = 'c:\\Users\\chand\\OneDrive\\Desktop\\Coding\\Web Dev\\Projects\\Cohort\\shipflowAI\\apps\\web\\.env';

  const pem = fs.readFileSync(pemPath, 'utf8');
  // Replace actual newlines with literal \n
  const pemSingleLine = pem.trim().split('\n').join('\\n');

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the GITHUB_PRIVATE_KEY value
  envContent = envContent.replace(
    /GITHUB_PRIVATE_KEY=".*"/,
    `GITHUB_PRIVATE_KEY="${pemSingleLine}"`
  );

  fs.writeFileSync(envPath, envContent);
  console.log("Updated .env with correctly formatted PEM key.");
}

fixEnv();
