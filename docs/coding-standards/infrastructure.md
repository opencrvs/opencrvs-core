# Infrastructure

Read this page when a change touches `charts/`, `.github/workflows/` or a dependency. [Coding standards](README.md) has the rules for all code.

## Helm charts

Put default values in `values.yaml` instead of `| default` or helper logic in templates. Then the operator can see what the final Kubernetes manifest will be.

## CI

- Run tasks with `nx`.
- Use only GitHub Actions that we maintain or audit.
- Give each token in a workflow the least privilege that it needs.
- Keep the configuration of a tool in one place, for example in `pnpm-workspace.yaml`.

## Dependencies

- Before you add a library, check that the platform and the libraries in the repository cannot do the job. Give the reason for a new library in the PR.
- When a security update arrives for a dependency, first check if the code uses the dependency. Remove it if you can.
