/* eslint-disable no-undef */
/* eslint-disable no-console */
// const execa = require("execa");
import { exec } from 'child_process';
import fs from "fs";

(async () => {
  try {
    await exec("git", ["checkout", "--orphan", "gh-pages"]);
    // eslint-disable-next-line no-console
    console.log("Building started...");
    await exec("npm", ["run", "gallery:build"]);
    // Understand if it's dist or build folder
    const folderName = fs.existsSync("dist") ? "dist" : "build";
    await exec("git", ["--work-tree", folderName, "add", "--all", "."]);
    await exec("git", ["--work-tree", folderName, "commit", "-m", "deployment"]);
    console.log("Pushing to deployment...");
    await exec("git", ["push", "origin", "HEAD:deployment", "--force"]);
    await exec("rm", ["-r", folderName]);
    await exec("git", ["checkout", "-f", "main"]);
    await exec("git", ["branch", "-D", "deployment"]);
    console.log("Successfully deployed, check your settings");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    process.exit(1);
  }
})();