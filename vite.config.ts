// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The browser talks to the owner's own Supabase project. These are public values
// (project URL + publishable key); they are pinned here because the generated .env
// is rewritten with the built-in project's values.
const OWNER_SUPABASE_URL = "https://srqnyhwknkpqrajefwjs.supabase.co";
const OWNER_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fjSs-jThuB_rEiAJgIddTw_ZMkTFPhz";
const OWNER_SUPABASE_PROJECT_ID = "srqnyhwknkpqrajefwjs";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(OWNER_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        OWNER_SUPABASE_PUBLISHABLE_KEY,
      ),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(OWNER_SUPABASE_PUBLISHABLE_KEY),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(OWNER_SUPABASE_PROJECT_ID),
    },
  },
});
