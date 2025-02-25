import express from "express";
import path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url";
import fs from "fs"; // Import Node.js file system module
const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
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
const projectRoot = path.resolve(__dirname, "../../");
const distPath = path.join(projectRoot, "dist");
// Automatically load all route files from the /api directory
const loadApiRoutes = async () => {
    const apiDir = path.join(__dirname, "../app/api");
    // In production, we need to look for .js files, not .ts files
    const extension = isProduction ? "js" : "ts";
    const apiFiles = await glob(`${apiDir}/**/*.${extension}`);
    for (const file of apiFiles) {
        const routePath = file.replace(apiDir, "").replace(`.${extension}`, ""); // Use the correct extension
        try {
            const routeModule = await import(file);
            const route = routeModule.default;
            app.use(`/api${routePath}`, route);
            console.log(`Loaded route: /api${routePath}`);
        }
        catch (err) {
            console.error(`Error loading route ${routePath}:`, err);
        }
    }
};
const startServer = async () => {
    try {
        await loadApiRoutes();
        // Serve static files from the dist directory in production
        if (isProduction) {
            console.log(`Serving static files from: ${distPath}`);
            if (!fs.existsSync(distPath)) {
                console.error(`Error: The build directory (${distPath}) does not exist.`);
                console.error("Did you run 'npm run build' before starting the server?");
                process.exit(1);
            }
            app.use(express.static(distPath));
            // Always return index.html for any route not matched by static files or API
            app.get("*", (_req, res) => {
                res.sendFile(path.join(distPath, "index.html"));
            });
        }
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port} in ${isProduction ? "production" : "development"} mode`);
        });
    }
    catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};
startServer();
