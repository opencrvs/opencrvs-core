# Development of @opencrvs/toolkit

This file is for the maintainers of the toolkit. For the user documentation, see [README.md](./README.md).

## File structure

```
src/
  api/                # typed tRPC client for the OpenCRVS events API
  application-config/ # re-exports the application config from commons
  authentication/     # re-exports the token helpers from commons
  conditionals/       # re-exports the conditionals from commons
  environment/        # `opencrvs environment` commands and their templates
  events/             # re-exports the events module (and events/deduplication) from commons
  migrations/         # codemods that `opencrvs upgrade` runs
  notification/       # re-exports the user notifications from commons
  request-signing/    # re-exports the request signing from commons
  roles/              # re-exports the user roles from commons
  scopes/             # re-exports the scopes from commons
  telemetry/          # sends telemetry reports to the OpenCRVS status service
  translations/       # reads the translations of the country config template
  verify/             # `opencrvs verify-endpoints` command
  cli.ts              # entry point of the `opencrvs` command
```

For the upgrade codemods, see [src/migrations/README.md](./src/migrations/README.md).

## Development using yarn link

```
# tsconfig.json references commons. When `tsc --build` runs, it builds both.
> pnpm build:all
# If you do not do this step, you can have problems with the types.
> cd dist
> yarn link
```

## Internal dependencies

When you add an internal package as a dependency, know that:

- Internal packages cannot be direct dependencies. The toolkit is published to npm, and npm cannot resolve the dependency.
- Some packages have dependencies that must be installed in a strict order. Make sure that the pipeline and the scripts install them in the correct order.

### @opencrvs/events

The toolkit re-exports the tRPC router, so that clients can call the API easily.

### @opencrvs/commons

The toolkit re-exports common definitions (for example events and conditionals) and makes them available through npm.

## Publishing

Publish with the [Publish toolkit to NPM registry](https://github.com/opencrvs/opencrvs-core/actions/workflows/publish-toolkit-to-npm.yml) workflow. The same workflow also publishes `@opencrvs/create-countryconfig` from `create-countryconfig/`.

npm shows `README.md` on the package page. Use only absolute URLs in `README.md`, because npm does not resolve relative links.

## Gotchas, good to know

- All dependencies of the functions and modules that the toolkit uses from `packages/commons` **must** also be in the `package.json` of the toolkit. If they are not, users who install the package get errors.
- The package is published. Users must be able to use it without knowledge of the rest of the monorepo.
- The package exposes each entry point in the `exports` map of `package.json`. For each entry point, `build.sh` bundles the JavaScript and copies the `.d.ts` files from `packages/commons`. Other parts of commons are not exposed.
- If an exposed directory has subdirectories, the types of the subdirectories are not exposed by default. The compiled JavaScript is available through `esbuild`. See `build.sh` for how to expose subdirectories:

```sh
# Build common events
npx esbuild src/events/index.ts --bundle --format=cjs --outdir=./dist/events --allow-overwrite --packages=external
mkdir -p ./dist/commons/events
cp -r ../commons/build/dist/common/events/*.d.ts ./dist/commons/events
mkdir -p ./dist/commons/events/state # <-- create the subdirectory
cp -r ../commons/build/dist/common/events/state/*.d.ts ./dist/commons/events/state # <-- copy the types over
```
