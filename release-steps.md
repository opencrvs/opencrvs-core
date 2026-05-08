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
        C2["git tag vX.Y.Z\ngit push origin tag vX.Y.Z"]
        C3["⚡ Pipeline + npm publish triggered automatically"]
        C4["Verify docker images published\nCompare size vs previous — report unusual increases"]
        C5[Create draft release]
        C6[Paste CHANGELOG.md to GitHub release]
        C7["Paste copy items to release notes\n(generate with notebook)"]
        C8[Publish GitHub release]
        C9[Verify toolkit version visible on npm]
        C1 --> C2 --> C3 --> C4 --> C5 --> C6 --> C7 --> C8 --> C9
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

    subgraph POST["Post-release"]
        POST1[Merge both release branches into master + develop simultaneously]
        POST2["Create release/X.Y.Z+1 from master in both repos"]
        POST3["Commit version bump on new release branches"]
        POST4["PR new branches into master + develop in both repos\n⚠️ init-release.yml may help with POST2–POST4 (unverified)"]
        POST1 --> POST2 --> POST3 --> POST4
    end

    PRE --> CORE
    CORE --> CC
    CC --> POST
```

## Links

- Copy items notebook: https://gist.github.com/rikukissa/9415b88016c0acfc0e0d4e00add45993
- init-release workflow: https://github.com/opencrvs/opencrvs-core/actions/workflows/init-release.yml
