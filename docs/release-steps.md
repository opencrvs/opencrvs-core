# Technical Releasing

Run the phases in order: **Prerequisites** → **opencrvs-core -repo** → **infrastructure -repo**. Within each phase, complete the steps top to bottom.

In opencrvs-core, each release line has one branch, `release/X.Y.x`. All the patch releases of the line, for example `X.Y.0` and `X.Y.1`, are made on that branch.

## 1. Prerequisites — both repos

1. Verify no open PRs are pending for the release.
2. Confirm that X.Y.Z is started. The [`init-release` workflow](https://github.com/opencrvs/opencrvs-core/actions/workflows/init-release.yml) starts it when the previous release of the line is published. For the first release of a line, X.Y.0, dispatch the workflow by hand from `release/X.Y.x`, with `version: X.Y.0`. The workflow does these steps:
   - It bumps the `version` fields in the `package.json` files and adds a `## X.Y.Z` section to `CHANGELOG.md` on `release/X.Y.x`. If the section is already there, it does not add it again.
   - It triggers the companion `init-release` in **infrastructure**. That workflow makes the same changes on `release/X.Y.x` in infrastructure, and creates the branch if it does not exist.
   - It creates `release/X.Y.x` in the **e2e** repo if that branch does not exist.
   - It creates a draft release `vX.Y.Z`.
3. CI is passing on all PRs.
4. `CHANGELOG.md` and `package.json` on `release/X.Y.x` show the release version, in both repos.
5. countryconfig is already using the latest pre-release toolkit version.

## 2. opencrvs-core -repo

1. Verify `CHANGELOG.md` and `package.json` match the release version.
2. Dispatch [`publish-toolkit-to-npm` workflow](https://github.com/opencrvs/opencrvs-core/actions/workflows/publish-toolkit-to-npm.yml) — `ref: release/X.Y.x`, `version: X.Y.Z`.
3. Approve the run in the `npm-publish` environment (any `@opencrvs/developers` member).
4. Wait for the run's `pin-template` job. It commits `chore: pin @opencrvs/toolkit X.Y.Z in countryconfig-template` to `release/X.Y.x`, which sets both `version` and `@opencrvs/toolkit` in `packages/countryconfig-template/package.json` to `X.Y.Z` and updates its lockfile.
   > If the job fails, use "Re-run failed jobs": it re-runs only the pin, without publishing or asking for approval again.
5. Tag the commit named in the run summary:
   ```bash
   git fetch origin release/X.Y.x
   git tag vX.Y.Z <sha from the run summary>
   git push origin tag vX.Y.Z
   ```
   > ⚠️ Tag as soon as the pin is committed — from step 2 until this tag exists, `create-countryconfig@X.Y.Z` scaffolds from the previous release tag.
6. The [`build-images-from-branch` pipeline](https://github.com/opencrvs/opencrvs-core/actions/workflows/build-images-from-branch.yml) triggers automatically. Ensure it succeeds.
7. Verify the docker images published — compare sizes against the previous release with `compare-image-sizes.sh` (in the repo root) and report unusual increases:
   ```bash
   ./compare-image-sizes.sh v<previous> vX.Y.Z   # e.g. ./compare-image-sizes.sh v2.1.0 v2.2.0
   ```
   Requires `crane` and `jq`.
8. Publish the draft release on GitHub [here](https://github.com/opencrvs/opencrvs-core/releases). This starts `init-release` for the next patch, X.Y.(Z+1).

## 3. infrastructure -repo

1. Bump `@opencrvs/toolkit` to `X.Y.Z` in `package.json` (repo root) on `release/X.Y.x`, then commit.
2. Tag the release on `release/X.Y.x`:
   ```bash
   git tag vX.Y.Z
   git push origin tag vX.Y.Z
   ```
3. Create the release on GitHub [here](https://github.com/opencrvs/infrastructure/releases)

## 4. Finalize — sync the newer branches

Once both releases are published:

1. In **opencrvs-core**, there is no merge-back PR. Each push to `release/X.Y.x` starts the [forward-merge workflow](https://github.com/opencrvs/opencrvs-core/actions/workflows/forward-merge-release-lines.yml). It opens a PR from `release/X.Y.x` into the next release line, or into `develop` from the newest line. Merge these PRs in order, until the changes reach `develop`.
2. Upgrade the demo environment — [opencrvs-farajaland](https://github.com/opencrvs/opencrvs-farajaland) — to the newly released version, if it should track this release.

Finally, send a release message to Slack!

## Links

- Copy items notebook: https://gist.github.com/rikukissa/9415b88016c0acfc0e0d4e00add45993
- init-release workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/init-release.yml
- Forward-merge workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/forward-merge-release-lines.yml
- Publish toolkit to NPM registry workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/publish-toolkit-to-npm.yml
