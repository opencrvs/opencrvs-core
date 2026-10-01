# Technical Releasing

Run the phases in order: **Prerequisites** → **opencrvs-core -repo** → **infrastructure -repo**. Within each phase, complete the steps top to bottom.

## 1. Prerequisites — both repos

1. Verify no open PRs are pending for the release.
2. Dispatch [`init-release` workflow](https://github.com/opencrvs/opencrvs-core/actions/workflows/init-release.yml). Dispatch it only in **opencrvs-core** — it automatically triggers the companion `init-release` in **infrastructure**, countryconfig and testland.
3. Confirm the `release/X.Y.Z` branch exists in **opencrvs-core** and **infrastructure**, and is PR'd to `develop`.
4. CI is passing on all PRs.
5. `CHANGELOG.md` and `package.json` reflect the release version (committed at branch creation).
6. countryconfig is already using the latest pre-release toolkit version.

## 2. opencrvs-core -repo

1. Verify `CHANGELOG.md` and `package.json` match the release version.
2. Dispatch [`publish-toolkit-to-npm` workflow](https://github.com/opencrvs/opencrvs-core/actions/workflows/publish-toolkit-to-npm.yml) — `ref: release/X.Y.Z`, `version: X.Y.Z`.
3. Approve the run in the `npm-publish` environment (any `@opencrvs/developers` member, including you).
4. Verify the toolkit version is visible on npm.
5. Bump `@opencrvs/toolkit` to `X.Y.Z` in `packages/countryconfig-template/package.json`.
   > ⚠️ Run `pnpm install` to update lockfile. Relies on the toolkit already being published to npm in section 2.
6. Commit the version bump.
7. Tag the release:
   ```bash
   git tag vX.Y.Z
   git push origin tag vX.Y.Z
   ```
   > ⚠️ Tag as soon as step 6 is committed — from step 2 until this tag exists, `create-countryconfig@X.Y.Z` scaffolds from the previous release tag.
8. The [`build-images-from-branch` pipeline](https://github.com/opencrvs/opencrvs-core/actions/workflows/build-images-from-branch.yml) triggers automatically. Ensure it succeeds.
9. Verify the docker images published — compare sizes against the previous release with `compare-image-sizes.sh` (in the repo root) and report unusual increases:
   ```bash
   ./compare-image-sizes.sh v<previous> vX.Y.Z   # e.g. ./compare-image-sizes.sh v2.1.0 v2.2.0
   ```
   Requires `crane` and `jq`.
10. Create the release on GitHub [here](https://github.com/opencrvs/opencrvs-core/releases)

## 3. infrastructure -repo

1. Bump `@opencrvs/toolkit` to `X.Y.Z` in `package.json` (repo root), then commit.
2. Tag the release:
   ```bash
   git tag vX.Y.Z
   git push origin tag vX.Y.Z
   ```
3. Create the release on GitHub [here](https://github.com/opencrvs/infrastructure/releases)

## 4. Finalize — sync develop

Once both releases are published, merge the merge-back PR that `init-release` opened in each repo (its branch is named `merge-back/…`, targeting `develop`).

1. Merge the merge-back PR into `develop` in **opencrvs-core**.
2. Merge the merge-back PR into `develop` in **infrastructure**.

Finally, send a message to Slack! [(example)](https://opencrvsworkspace.slack.com/archives/C06BERMKNH2/p1790763502585439)

## Links

- Copy items notebook: https://gist.github.com/rikukissa/9415b88016c0acfc0e0d4e00add45993
- init-release workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/init-release.yml
- Publish toolkit to NPM registry workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/publish-toolkit-to-npm.yml
