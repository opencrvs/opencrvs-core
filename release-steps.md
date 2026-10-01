# Technical Releasing

```mermaid
flowchart TD
    subgraph PRE["Prerequisites — both repos"]
        P1[Verify no open PRs pending for release]
        P2["Run init-release workflow\nhttps://github.com/opencrvs/opencrvs-core/actions/workflows/init-release.yml"]
        P3["release/X.Y.Z branch exists in opencrvs-core + infrastructure\nPR'd to develop"]
        P4[CI passing on all PRs]
        P5["CHANGELOG.md + package.json reflect release version\n(committed at branch creation)"]
        P6[countryconfig already using latest pre-release toolkit version]
        P1 --> P2 --> P3 --> P4 --> P5 --> P6
    end

    subgraph CORE["opencrvs-core"]
        C1["Verify CHANGELOG.md + package.json match release version"]
        C2["Dispatch 'Publish toolkit to NPM registry'\nref: release/X.Y.Z, version: X.Y.Z"]
        C3["Approve the run in the npm-publish environment\nany @opencrvs/developers member, including you"]
        C4[Verify toolkit version visible on npm]
        C5["Bump @opencrvs/toolkit to X.Y.Z in\npackages/countryconfig-template/package.json\n⚠️ pnpm i --ignore-workspace to update its lockfile"]
        C6[Commit the version bump]
        C7["git tag vX.Y.Z\ngit push origin tag vX.Y.Z\n⚠️ Tag as soon as C6 is committed — from C2 until\nthis tag exists, create-countryconfig@X.Y.Z\nscaffolds from the previous release tag"]
        C8["⚡ Pipeline triggered automatically\n(docker images)"]
        C9["Verify docker images published\nCompare size vs previous — report unusual increases"]
        C10[Create draft release in GitHub]
        C11[Paste CHANGELOG.md to GitHub release]
        C12["Paste copy items to release notes\n(generate with notebook)"]
        C13[Publish GitHub release]
        C1 --> C2 --> C3 --> C4 --> C5 --> C6 --> C7 --> C8 --> C9 --> C10 --> C11 --> C12 --> C13
    end

    subgraph IF["Infrastructure"]
        IF1["git tag vX.Y.Z\ngit push origin tag vX.Y.Z"]
        IF2[Create draft release]
        IF3[Paste CHANGELOG.md to GitHub release]
        IF4["Paste copy items to release notes\n(generate with notebook)"]
        IF5[Publish GitHub release]
        IF1 --> IF2 --> IF3 --> IF4 --> IF5
    end

    PRE --> CORE
    CORE --> IF
```

## Links

- Copy items notebook: https://gist.github.com/rikukissa/9415b88016c0acfc0e0d4e00add45993
- init-release workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/init-release.yml
- Publish toolkit to NPM registry workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/publish-toolkit-to-npm.yml
