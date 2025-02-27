import express from "express";
import path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url";
import chalk from "chalk";
import fs from "fs"; // Import Node.js file system module

type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "delete"
  | "patch"
  | "options"
  | "head";

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for better security in production
if (isProduction) {
  // Add security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
  });
}

app.use((_req, res, next) => {
  res.set("Connection", "keep-alive");
  next();
});

// Get the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate the project root directory based on the server location
// When compiled, server files will be in dist-server/server/
// We need to go up to the project root
const projectRoot = path.resolve(__dirname, "../../../");
const distPath = path.join(projectRoot, "dist");

// Automatically load all route files from the /api directory
const callExpressMethod = (
  app: express.Application,
  method: HttpMethod,
  path: string,
  handler: express.RequestHandler
) => {
  app[method](path, handler);
};

const loadApiRoutes = async (app: express.Application) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const apiDir = path.join(__dirname, "../../src/app/api");
  const isProduction = process.env.NODE_ENV === "production";
  const extension = isProduction ? "js" : "ts";

  try {
    const apiFiles = await glob(`${apiDir}/**/*.${extension}`);

    for (const file of apiFiles) {
      const filePath = file.replace(apiDir, "").replace(`.${extension}`, "");
      // Convert [param] syntax to :param for Express routes
      const routePath = filePath.replace(/\[([^\]]+)\]/g, ":$1");
      const endpoint = `/api${routePath}`;

      try {
        // Import the route module
        const routeModule = await import(file);

        // Check if it exports a default function (simplest case)
        if (typeof routeModule.default === "function") {
          app.get(endpoint, routeModule.default);
          // console.log(`Loaded default GET handler for ${endpoint}`);
          continue; // Skip to next file
        }

        // Check if it exports an object with method handlers
        if (routeModule.default && typeof routeModule.default === "object") {
          const handler = routeModule.default;
          const methods: HttpMethod[] = [
            "get",
            "post",
            "put",
            "delete",
            "patch",
            "options",
            "head",
          ];

          let methodFound = false;
          for (const method of methods) {
            if (typeof handler[method] === "function") {
              callExpressMethod(app, method, endpoint, handler[method]);
              // console.log(
              //   `Loaded ${method.toUpperCase()} handler for ${endpoint}`
              // );
              methodFound = true;
            }
          }

          // If we found methods, continue to next file
          if (methodFound) continue;

          // Check if it's an Express Router
          if (typeof handler.use === "function") {
            app.use(endpoint, handler);
            console.log(`Loaded Express Router for ${endpoint}`);
            continue;
          }
        }

        // Check for named exports matching HTTP methods
        const upperMethods = [
          "GET",
          "POST",
          "PUT",
          "DELETE",
          "PATCH",
          "OPTIONS",
          "HEAD",
        ];
        let namedExportFound = false;

        for (const upperMethod of upperMethods) {
          if (typeof routeModule[upperMethod] === "function") {
            const method = upperMethod.toLowerCase() as HttpMethod;
            callExpressMethod(app, method, endpoint, routeModule[upperMethod]);
            // console.log(`Loaded ${upperMethod} handler for ${endpoint}`);
            namedExportFound = true;
          }
        }

        // If no handlers were found, log a warning
        if (!namedExportFound) {
          console.warn(`No handlers found for ${endpoint}`);
        }
      } catch (err) {
        console.error(`Error loading route ${endpoint}:`, err);
      }
    }
  } catch (err) {
    console.error("Error finding API files:", err);
  }
};

const startServer = async () => {
  try {
    await loadApiRoutes(app);

    // Serve static files from the dist directory in production
    if (isProduction) {
      console.log(`Serving static files from: ${distPath}`);

      if (!fs.existsSync(distPath)) {
        console.error(
          `Error: The build directory (${distPath}) does not exist.`
        );
        console.error(
          "Did you run 'npm run build' before starting the server?"
        );
        process.exit(1);
      }

      app.use(express.static(distPath));

      // Always return index.html for any route not matched by static files or API
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(port, () => {
      console.log(
        chalk.green(
          `App is running in ${isProduction ? "production" : "development"} mode!`
        )
      );
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
