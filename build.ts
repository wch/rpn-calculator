import chokidar from "chokidar";
import * as esbuild from "esbuild";
import tailwindPlugin from "esbuild-plugin-tailwindcss";
import { existsSync, mkdirSync, copyFileSync, cpSync } from "node:fs";
import { join } from "node:path";

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");
const metafile = process.argv.includes("--metafile");

// Copy PWA assets to dist
function copyPWAAssets() {
  console.log("Copying PWA assets...");
  
  // Copy PWA files from public directory
  const pwaFiles = [
    'manifest.json',
    'browserconfig.xml'
  ];
  
  pwaFiles.forEach(file => {
    if (existsSync(join('public', file))) {
      copyFileSync(join('public', file), join('dist', file));
      console.log(`✓ Copied ${file}`);
    }
  });
  
  // Copy icons directory
  if (existsSync('public/icons')) {
    if (!existsSync('dist/icons')) {
      mkdirSync('dist/icons');
    }
    cpSync('public/icons', 'dist/icons', { recursive: true });
    console.log('✓ Copied icons directory');
  }
}

async function main() {
  const buildmap: Record<string, Promise<esbuild.BuildContext>> = {};

  // Ensure dist directory exists
  if (!existsSync("dist")) {
    mkdirSync("dist");
  }

  buildmap.standalone = esbuild.context({
    entryPoints: ["srcts/main.tsx"],
    outfile: "dist/main.js",
    bundle: true,
    format: "esm",
    minify: production,
    sourcemap: production ? undefined : "linked",
    sourcesContent: true,
    logLevel: "info",
    metafile: metafile,
    plugins: [tailwindPlugin()],
  });

  // Build service worker separately (no plugins needed)
  buildmap.serviceworker = esbuild.context({
    entryPoints: ["srcts/sw.ts"],
    outfile: "dist/sw.js",
    bundle: true,
    format: "esm",
    minify: production,
    sourcemap: production ? undefined : "linked",
    sourcesContent: true,
    logLevel: "info",
    metafile: metafile,
  });

  if (watch) {
    // Use chokidar for watching instead of esbuild's watch, because esbuild's
    // watch mode constantly consumes 15-25% CPU due to polling.
    // https://github.com/evanw/esbuild/issues/1527
    const contexts = await Promise.all(Object.values(buildmap));

    // Initial build
    await Promise.all(contexts.map((context) => context.rebuild()));

    // Copy HTML for standalone builds
    console.log("Copying HTML file...");
    copyFileSync("index.html", "dist/index.html");
    
    // Copy PWA assets
    copyPWAAssets();

    const watchPaths = ["srcts/", "tailwind.config.js", "index.html", "public/"];

    const watcher = chokidar.watch(watchPaths, {
      persistent: true,
      ignoreInitial: true,
    });

    let rebuildTimeout: NodeJS.Timeout;

    watcher.on("all", (eventName, path) => {
      console.log(`${eventName}: ${path}`);

      // Debounce rebuilds to avoid rapid successive builds
      clearTimeout(rebuildTimeout);
      rebuildTimeout = setTimeout(async () => {
        try {
          await Promise.all(contexts.map((context) => context.rebuild()));

          // Copy HTML file if it changed
          if (path === "index.html") {
            console.log("Copying updated HTML file...");
            copyFileSync("index.html", "dist/index.html");
          }
          
          // Copy PWA assets if they changed
          if (path.startsWith("public/")) {
            console.log("Copying updated PWA assets...");
            copyPWAAssets();
          }
        } catch (error) {
          console.error("Rebuild failed:", error);
        }
      }, 100);
    });

    watcher.on("error", (error) => {
      console.error("Watcher error:", error);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\nShutting down...");

      // Close file watcher
      await watcher.close();

      // Dispose esbuild contexts
      await Promise.all(contexts.map((context) => context.dispose()));

      process.exit(0);
    });
  } else {
    // Non-watch build
    Object.entries(buildmap).forEach(([target, build]) =>
      build
        .then(async (context: esbuild.BuildContext) => {
          console.log(`Building .js bundle for ${target} target...`);
          await context.rebuild();

          console.log("Copying HTML file...");
          copyFileSync("index.html", "dist/index.html");
          
          // Copy PWA assets
          copyPWAAssets();
          
          console.log(`✓ Successfully built standalone PWA in dist/`);

          await context.dispose();
        })
        .catch((e) => {
          console.error(`Build failed for ${target} target:`, e);
          process.exit(1);
        })
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
