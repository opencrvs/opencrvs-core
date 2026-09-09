# Technical Releasing

```mermaid
flowchart TD
    subgraph PRE["Prerequisites — both repos"]
        P1[Verify no open PRs pending for release]
        P2["release/X.Y.Z branch exists in Core + CountryConfig\nPR'd to master and develop"]
        P3[CI passing on all PRs]
        P4["CHANGELOG.md + package.json reflect release version\n(committed at branch creation)"]
        P5[CountryConfig already using latest pre-release toolkit version]
        P1 --> P2 --> P3 --> P4 --> P5
    end

    subgraph CORE["Core"]
        C1["Verify CHANGELOG.md + package.json match release version"]
        C2["Dispatch 'Publish toolkit to NPM registry'\nref: release/X.Y.Z, version: X.Y.Z"]
        C3["Approve the run in the npm-publish environment\nany @opencrvs/developers member, including you"]
        C4[Verify toolkit version visible on npm]
        C5["Bump @opencrvs/toolkit to X.Y.Z in\npackages/countryconfig-template/package.json\n⚠️ pnpm i --ignore-workspace to update its lockfile"]
        C6[Commit the pin bump]
        C7["git tag vX.Y.Z\ngit push origin tag vX.Y.Z\n⚠️ Tag as soon as C6 is committed — from C2 until\nthis tag exists, create-countryconfig@X.Y.Z\nscaffolds from the previous release tag"]
        C8["⚡ Pipeline triggered automatically\n(docker images)"]
        C9["Verify docker images published\nCompare size vs previous — report unusual increases"]
        C10[Create draft release]
        C11[Paste CHANGELOG.md to GitHub release]
        C12["Paste copy items to release notes\n(generate with notebook)"]
        C13[Publish GitHub release]
        C1 --> C2 --> C3 --> C4 --> C5 --> C6 --> C7 --> C8 --> C9 --> C10 --> C11 --> C12 --> C13
    end

    subgraph CC["CountryConfig — after Core visible on npm"]
        CC1["Bump @opencrvs/toolkit to vX.Y.Z on release branch\n⚠️ Run yarn install to update lockfile"]
        CC2["git tag vX.Y.Z\ngit push origin tag vX.Y.Z"]
        CC3[Create draft release]
        CC4[Paste CHANGELOG.md to GitHub release]
        CC5["Paste copy items to release notes\n(generate with notebook)"]
        CC6[Publish GitHub release]
        CC1 --> CC2 --> CC3 --> CC4 --> CC5 --> CC6
    end

    subgraph HC["Helm Charts"]
        HC1["Bump helm chart `version` and `appVersion`"]
        HC2["git tag vX.Y.Z\ngit push origin tag vX.Y.Z"]
        HC3[Create draft release]
        HC4[Paste CHANGELOG.md to GitHub release]
        HC5["Paste copy items to release notes\n(generate with notebook)"]
        HC6[Publish GitHub release]
        HC1 --> HC2 --> HC3 --> HC4 --> HC5 --> HC6
    end

    subgraph IF["Infrastructure"]
        IF1["Update reference to helm chart `version` in workflows"]
        IF2["git tag vX.Y.Z\ngit push origin tag vX.Y.Z"]
        IF3[Create draft release]
        IF4[Paste CHANGELOG.md to GitHub release]
        IF5["Paste copy items to release notes\n(generate with notebook)"]
        IF6[Publish GitHub release]
        IF1 --> IF2 --> IF3 --> IF4 --> IF5 --> IF6
    end

    subgraph POST["Post-release"]
        POST1[Merge both release branches into master + develop simultaneously]
        POST2["Create release/X.Y.Z+1 from release/X.Y.Z in both repos"]
        POST3["Commit version bump on new release branches"]
        POST4["PR new branches into master + develop in both repos\n⚠️ init-release.yml may help with POST2–POST4 (unverified)"]
        POST1 --> POST2 --> POST3 --> POST4
    end

    PRE --> CORE
    CORE --> CC
    CC --> HC
    HC --> IF
    IF --> POST
```

## Links

- Copy items notebook: https://gist.github.com/rikukissa/9415b88016c0acfc0e0d4e00add45993
- init-release workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/init-release.yml
- Publish toolkit to NPM registry workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/publish-toolkit-to-npm.yml
