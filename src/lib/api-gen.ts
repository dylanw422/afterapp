// src/scripts/route-generator.ts
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import chokidar from "chokidar";

const API_ROUTES_DIR = path.resolve(process.cwd(), "src/app/api");
const TEMPLATE = `import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

/**
 * @route GET /api{{routePath}}
 * @desc Get data from this endpoint
 */
router.get("/", (req: Request, res: Response) => {
  res.json({ 
    message: "Route {{routeName}} is working!",
    query: req.query
  });
});

/**
 * @route POST /api{{routePath}}
 * @desc Create new data
 */
router.post("/", (req: Request, res: Response) => {
  res.status(201).json({ 
    message: "Resource created successfully",
    body: req.body
  });
});

export default router;
`;

// Ensure API routes directory exists
async function ensureDirectoryExists() {
  try {
    await fs.mkdir(API_ROUTES_DIR, { recursive: true });
    console.log(`✓ API routes directory exists: ${API_ROUTES_DIR}`);
  } catch (error) {
    console.error("Error creating API routes directory:", error);
    process.exit(1);
  }
}

// Generate template for a new route file
async function generateRouteTemplate(filePath: string) {
  try {
    // Only process .ts files
    if (!filePath.endsWith(".ts")) return;

    // Check if file is empty or doesn't exist
    let fileContent;
    try {
      fileContent = await fs.readFile(filePath, "utf8");
    } catch (error) {
      // File doesn't exist yet, that's fine
    }

    // If file has content, don't overwrite it
    if (fileContent && fileContent.trim().length > 0) {
      return;
    }

    // Calculate route path from file path
    const relativePath = path.relative(API_ROUTES_DIR, filePath);
    const routePath = "/" + relativePath.replace(/\.ts$/, "");
    const routeName = path.basename(relativePath, ".ts");

    // Generate content from template
    const content = TEMPLATE.replace(/{{routePath}}/g, routePath).replace(
      /{{routeName}}/g,
      routeName
    );

    // Write template to file
    await fs.writeFile(filePath, content);
    console.log(`✅ Generated route template: ${filePath}`);

    // Run linter to format file (if eslint is configured in your project)
    exec(`npx eslint --fix ${filePath}`, (error) => {
      if (error) {
        // It's fine if linting fails, the template is still created
        console.log(`ℹ️ Note: Couldn't run linter on new file.`);
      }
    });
  } catch (error) {
    console.error(`Error generating route template for ${filePath}:`, error);
  }
}

// Watch for changes in the API routes directory
async function watchApiRoutes() {
  const watcher = chokidar.watch(`${API_ROUTES_DIR}/**/*.ts`, {
    persistent: true,
    ignoreInitial: false,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  console.log(`🔍 Watching for changes in ${API_ROUTES_DIR}...`);

  watcher
    .on("add", (filePath) => {
      console.log(`File added: ${filePath}`);
      generateRouteTemplate(filePath);
    })
    .on("error", (error) => {
      console.error(`Watcher error: ${error}`);
    });
}

// Main function
async function main() {
  await ensureDirectoryExists();
  await watchApiRoutes();
}

main().catch(console.error);
