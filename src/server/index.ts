import express from "express";
import path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url"; // Needed to get __dirname in ES module

const app = express();
const port = 3000;

app.use((_req, res, next) => {
  res.set("Connection", "keep-alive");
  next();
});

// Get the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically load all route files from the /api directory
const loadApiRoutes = async () => {
  const apiDir = path.join(__dirname, "../app/api");
  const apiFiles = await glob(`${apiDir}/**/*.ts`); // Use await for glob

  for (const file of apiFiles) {
    const routePath = file.replace(apiDir, "").replace(".ts", "");
    try {
      const routeModule = await import(file);
      const route = routeModule.default;
      app.use(`/api${routePath}`, route);
      console.log(`Loaded route: /api${routePath}`);
    } catch (err) {
      console.error(`Error loading route ${routePath}:`, err);
    }
  }
};

const startServer = async () => {
  try {
    loadApiRoutes();

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();

//app.use(express.static(path.join(__dirname, "../../main.tsx")));
