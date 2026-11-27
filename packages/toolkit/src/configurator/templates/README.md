# Vendored templates

Copies of the templates of `opencrvs environment init` (`../../environment/templates`),
so the configurator keeps working when that command is removed.

Two files differ from the CLI's, because questions of the form feed them:
`charts-values/opencrvs-services/values.yaml` has `otel.enabled: {{otel_enabled}}` (the CLI uses
`monitoring_enabled`, so OpenTelemetry could not be switched off on its own), the OpenTelemetry
Collector endpoint is `{{exporter_otlp_endpoint}}`, and the hosts of Elasticsearch, S3, Redis and
Postgres are `{{elasticsearch_host}}`, `{{s3_host}}`, `{{redis_host}}` and `{{postgres_host}}`
instead of the fixed in-cluster addresses (see `ui/plan/dependencyHosts.ts`).
`charts-values/traefik/values.yaml` has the same collector endpoint as `{{otel_collector_endpoint}}`
in its tracing block.
Carry these changes over when copying the templates again.

`../forms/bindings.yml` says which of these files are read back, and `../scripts/check-bindings.ts`
walks this folder to find where each template variable ends up in the rendered file.
When the CLI templates change, copy them again and run `pnpm configurator:bindings` from `packages/toolkit`.
