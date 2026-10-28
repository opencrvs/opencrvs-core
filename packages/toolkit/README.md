# OpenCRVS toolkit

OpenCRVS toolkit for building country configurations.

## File structure

```
src/
  events/ # re-exports events module from commons package
  scopes/ # re-exports scopes module from commons package
  conditionals/ # provides tools for easily formulating complex conditionals and deduplication rules
  api/ # provides an API wrapper for OpenCRVS APIs with strict typing and validation
```

## Getting started

### Manage GitHub environments

All commands should be executed within infrastructure repository.

Run `opencrvs environment init` from the root of a infrastructure
repository to create new GitHub environment. Command requires valid GitHub token.

Other environment operations are available as separate commands:

```sh
opencrvs environment update-workflows
opencrvs environment upgrade
opencrvs environment users
opencrvs environment swarm-to-k8s
```

### Development using yarn link

```
> yarn build:all
# If you miss this part you might face issues with types.
> cd dist
> yarn link
```

### Internal dependencies

When adding internal package as dependency, understand that:

- Internal packages cannot be direct dependencies. Toolkit is published through npm, and dependency cannot be resolved.
- Packages may have dependencies that require strict order of installation. Ensure installations are run in proper order in pipeline and scripts.

#### @opencrvs/events

Toolkit "re-exports" TRPC router to allow for easy client interaction.

#### @opencrvs/commons

Toolkit "re-exports" common definitions (e.g. events, conditionals) and make them available through npm.

### Publishing

Publish via [Publish toolkit to NPM registry](https://github.com/opencrvs/opencrvs-core/actions/workflows/publish-toolkit-to-npm.yml).

#### Gotchas, good to know

- All dependencies of the functions and moduless used from `packages/commons` **must** be also defined in the package.json of the toolkit. Otherwise someone installing the package will get errors.
- Package is published and should be used without knowledge of rest of the monorepo
- Each subpath in `exports` has one entry module under `src/`. `build.sh` bundles its JavaScript with esbuild, and `rolldown.dts.config.mjs` emits its declarations from source, inlining the types it uses from `packages/commons` and `packages/events`. A new subpath needs all three.
- Every package the declarations import must be a dependency of the toolkit. The declaration build fails otherwise.
