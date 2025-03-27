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

### Development using yarn link

```
# tsconfig.json references commons. when `tsc --build` is run, both are built.
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

### Releasing and buiding

#### While developing

1. Update version number in `package.json`
2. `yarn build:all`
3. `npm publish`

#### Through version control

1. Update version number in `package.json`
2. Create a pull request
3. Once merged, github action will get triggered.

#### Gotchas, good to know

- All dependencies of the functions and moduless used from `packages/commons` **must** be also defined in the package.json of the toolkit. Otherwise someone installing the package will get errors.
- Package is published and should be used without knowledge of rest of the monorepo
- Package exposes `/events, /scopes` directory, with types, from `packages/commons` through the library, others are excluded.
