import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * lovable-oauth-shim
 *
 * On *.lovable.app the managed OAuth broker is edge-fronted at `/~oauth/initiate`.
 * A local dev server knows nothing about that path, so the request falls through
 * to the SPA and renders the app's 404 — and `signInWithOAuth` reports success
 * because "the browser navigated". This middleware forwards the same path to the
 * real broker so Continue with Google/Apple reaches the provider in local dev.
 *
 * Inert unless LOVABLE_PROJECT_ID is set (see .env.example).
 */
function lovableOAuthShim(projectId?: string): Plugin {
  return {
    name: "lovable-oauth-shim",
    configureServer(server) {
      if (!projectId) return;
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const [pathname, query = ""] = req.url.split("?");
        if (pathname !== "/~oauth/initiate") return next();
        res.statusCode = 302;
        res.setHeader(
          "Location",
          `https://oauth.lovable.app/initiate${query ? `?${query}` : ""}`,
        );
        res.end();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const projectId = env.LOVABLE_PROJECT_ID;

  return {
    server: {
      host: "127.0.0.1",
      port: 8080,
      strictPort: true,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      lovableOAuthShim(projectId),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
