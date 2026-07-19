import { cp, mkdir, rename, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hide = [
  ["app/api", "app/_api_hid"],
  ["app/icon.tsx", "app/_icon.tsx.hid"],
  ["app/apple-icon.tsx", "app/_apple-icon.tsx.hid"],
];

async function hideForExport() {
  for (const [from, to] of hide) {
    try {
      await rename(path.join(root, from), path.join(root, to));
    } catch (e) {
      if (e && e.code !== "ENOENT") throw e;
    }
  }
}

async function restore() {
  for (const [from, to] of hide) {
    try {
      await rename(path.join(root, to), path.join(root, from));
    } catch (e) {
      if (e && e.code !== "ENOENT") throw e;
    }
  }
}

await hideForExport();
try {
  const env = { ...process.env, ASTAR_EXPORT: "1" };
  const result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const dist = path.join(root, "astar-dist");
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  // With basePath, Next writes into out/before-you-click/ — upload that folder's contents
  const outSub = path.join(root, "out", "before-you-click");
  const outRoot = path.join(root, "out");
  const source = await exists(outSub) ? outSub : outRoot;
  await cp(source, dist, { recursive: true });

  // Tiny static .htaccess (no proxy — HostPapa-safe)
  await cp(path.join(root, "astar", ".htaccess"), path.join(dist, ".htaccess"));
  console.log(`\n✅ Static build ready: ${dist}`);
  console.log("Upload EVERYTHING inside astar-dist/ to public_html/before-you-click/\n");
} finally {
  await restore();
}

async function exists(p) {
  try {
    const { access } = await import("node:fs/promises");
    await access(p);
    return true;
  } catch {
    return false;
  }
}
