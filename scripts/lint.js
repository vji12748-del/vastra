// lint.js — lightweight quality gate for the MERN codebase
import { execSync } from "child_process";
console.log("[lint] MERN project — running syntax check on server files...");
try {
  execSync("node --check server/index.js", { stdio: "inherit" });
  console.log("[lint] OK — no syntax errors found");
} catch (e) {
  console.error("[lint] FAILED");
  process.exit(1);
}
