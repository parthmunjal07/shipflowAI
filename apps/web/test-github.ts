import { App } from "octokit";
import fs from "fs";

async function main() {
  const envFile = fs.readFileSync(".env", "utf8");
  const appId = envFile.match(/GITHUB_APP_ID="(.*)"/)?.[1];
  const privateKey = envFile.match(/GITHUB_PRIVATE_KEY="(.*)"/)?.[1];

  if (!appId || !privateKey) {
    console.error("Missing appId or privateKey");
    return;
  }

  const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
  const app = new App({
    appId: appId,
    privateKey: formattedPrivateKey,
  });

  try {
    const { data: installationData } = await app.octokit.request("GET /app/installations");
    console.log("Installations:", installationData);
    
    if (installationData.length > 0) {
      const octokit = await app.getInstallationOctokit(installationData[0].id);
      const { data: reposData } = await octokit.request("GET /installation/repositories");
      console.log("Repositories:", reposData.repositories.map((r: any) => r.full_name));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
main();
