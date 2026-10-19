// Copies static assets next to the standalone server so `.next/standalone` can be
// uploaded and run on its own (node server.js).
import fs from "node:fs";

if (fs.existsSync(".next/standalone")) {
  fs.cpSync("public", ".next/standalone/public", { recursive: true });
  fs.cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
  console.log("Standalone build ready in .next/standalone (run: node server.js)");
}
