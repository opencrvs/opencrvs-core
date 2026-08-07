Run everything from the repo root (/home/ashikul/opencrvs/opencrvs-core) — that's where pnpm-workspace.yaml and the root pnpm-lock.yaml live, and pnpm needs to be invoked from the
workspace root so it re-resolves and links every package's node_modules consistently. Don't run these from inside packages/testland.

# from opencrvs-core repo root

git pull origin develop

# wipe node_modules everywhere in the workspace (root + every package)

rm -rf node_modules
find packages -maxdepth 3 -type d -name node_modules -prune -exec rm -rf {} +

# Build toolkit

$ cd ../toolkit/
bash build.sh

# reinstall against pnpm-workspace.yaml overrides + committed pnpm-lock.yaml

pnpm install

# Build toolkit

$ cd ../toolkit/
bash build.sh

# reinstall Playwright browser binaries for the e2e package

pnpm --filter @opencrvs/testland exec playwright install

# run e2e

cd packages/testland && pnpm e2e
