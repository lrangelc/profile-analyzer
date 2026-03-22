import dotenv from "dotenv";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", "..", ".env") });

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { analyze } from "./routes/analyze.js";
import { existsSync, readFileSync } from "node:fs";

const rootDir = join(__dirname, "..", "..");

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.route("/api", analyze);
app.get("/api/health", (c) => c.json({ ok: true }));

if (process.env.NODE_ENV === "production") {
  const distPath = join(rootDir, "frontend", "dist");
  if (existsSync(distPath)) {
    const indexHtml = readFileSync(join(distPath, "index.html"), "utf-8");
    app.use(
      "/*",
      serveStatic({
        root: distPath,
        onNotFound: (_path, c) => c.html(indexHtml),
      })
    );
  }
}

const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});
