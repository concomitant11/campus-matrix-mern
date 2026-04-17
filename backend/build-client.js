import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "..", "frontend");
const clientPath = path.join(__dirname, "client");

try {
  console.log("Installing frontend dependencies...");
  execSync("npm install", { cwd: frontendPath, stdio: "inherit" });

  console.log("Building frontend...");
  execSync("npm run build", { cwd: frontendPath, stdio: "inherit" });

  console.log("Clearing old client directory...");
  if (fs.existsSync(clientPath)) {
    fs.rmSync(clientPath, { recursive: true, force: true });
  }

  console.log("Copying build to backend/client...");
  const distPath = path.join(frontendPath, "dist");
  if (fs.existsSync(distPath)) {
    fs.cpSync(distPath, clientPath, { recursive: true });
    console.log("Frontend built and successfully copied to backend/client!");
  } else {
    console.error("Build directory 'dist' not found. Compilation failed.");
    process.exit(1);
  }
} catch (error) {
  console.error("An error occurred during the build process:", error);
  process.exit(1);
}
