/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
// Where each built-in component runs, inside the cluster: the address the chart templates used before the
// hosts became questions, by the question that asks for it. S3 is RustFS, because the installer has no
// question for MinIO. The OpenTelemetry Collector's is an endpoint, with its protocol, not just a host.
//
// This is the one place the addresses are written. Everything else reads it:
//
// - The form pre-fills each question with it (`defaultAddress(...)` in forms/wizard.yml, see src/form/functions.ts).
// - The host questions are only on screen while "Use built-in component" is unchecked. A hidden question
//   is not part of the answers, so for a built-in component nothing arrives to fill `host:` in the
//   services chart and the dependencies chart. Rendering gives every template variable that such a question
//   feeds this address when it has no answer (see `builtInValues` in templateValues.ts); without it `host:`
//   would be empty. A new entry here needs only its binding in forms/bindings.yml.
// - Reading an environment back from the services file, an address equal to its default means "built in",
//   and any other host is one the user entered (see inferToggles in src/form/infer.ts). A "Use built-in
//   component" flag stored in the dependencies chart takes precedence, so this is only a fallback.
// - The sample environments render with the same addresses as the form (scripts/fixtures.ts).
export const DEFAULT_HOSTS: Record<string, (environment: string) => string> = {
  ELASTICSEARCH_HOST: (environment) => `elasticsearch.opencrvs-deps-${environment}.svc.cluster.local`,
  S3_HOST: (environment) => `rustfs-0.rustfs.opencrvs-deps-${environment}.svc.cluster.local`,
  POSTGRES_HOST: (environment) => `postgres-0.postgres.opencrvs-deps-${environment}.svc.cluster.local`,
  REDIS_HOST: (environment) => `redis-0.redis.opencrvs-deps-${environment}.svc.cluster.local`,
  OTEL_COLLECTOR_ENDPOINT: (environment) => `http://opentelemetry-collector.opencrvs-deps-${environment}.svc.cluster.local:4317`
}
