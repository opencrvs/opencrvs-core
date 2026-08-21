{{/*

render-env-vars
---
Same idea as the render-env-vars in charts/opencrvs-services, minus the
per-service overlay (this chart deploys a single container, so there's no
service name to key by). Env vars come from `.env` (plain key/value);
secret-backed env vars come from `.secrets`, keyed by the Secret's name,
each value a "KEY" or "KEY:ENV_VAR_NAME" string (the latter lets the env
var name differ from the key in the Secret). Merging through one map
(rather than emitting each source as its own loop) means a key defined in
both `.env` and `.secrets` only ever produces a single `- name:` entry.

Parameters:
- .: The top-level Values object for the Helm chart.
*/}}
{{- define "render-env-vars" -}}
  {{- $env := .env | default dict }}

  {{- $secrets := dict }}
  {{- range $secret_name, $secret_values := (.secrets | default dict) }}
    {{- range $secret_value := $secret_values }}
      {{- $secret := split ":" $secret_value }}
      {{- $envName := $secret._1 | default $secret._0 }}
      {{- $_ := set $secrets $envName (dict "secret" $secret_name "key" $secret._0) }}
    {{- end }}
  {{- end }}

  {{- $result := mergeOverwrite (deepCopy $env) $secrets }}

  {{- range $k, $v := $result }}
            - name: {{ $k }}
    {{- if and (kindIs "map" $v) (hasKey $v "secret") }}
              valueFrom:
                secretKeyRef:
                  name: {{ $v.secret }}
                  key: {{ $v.key | quote }}
    {{- else }}
              value: {{ $v | quote }}
    {{- end }}
  {{- end }}
{{- end }}

{{- define "http-scheme" -}}
{{- if .Values.ingress.ssl_enabled }}
{{- printf "https" }}
{{- else }}
{{- printf "http" }}
{{- end }}
{{- end }}

{{- define "render-external-url" -}}
{{- $service_name := .service_name }}
{{- $http_scheme := include "http-scheme" . }}
{{- printf "%s://%s.%s" $http_scheme $service_name .Values.hostname }}
{{- end }}

{{/*

probes-helper
---
Kubernetes HTTP liveness/readiness/startup probes, same shape as the
probes-helper in charts/opencrvs-services. Renders nothing when
probes.enabled is false, since not every app served by this chart exposes
an HTTP health endpoint.

Parameters:
- .: The top-level Values object for the Helm chart.
*/}}
{{- define "probes-helper" -}}
{{- if .probes.enabled }}
{{- $probes := .probes }}
{{- $port := .service.container_port }}
livenessProbe:
  failureThreshold: 5
  httpGet:
    path: {{ $probes.liveness.path }}
    port: {{ $port }}
    scheme: HTTP
  periodSeconds: {{ $probes.liveness.periodSeconds }}
  successThreshold: 1
  timeoutSeconds: {{ $probes.liveness.timeoutSeconds }}
readinessProbe:
  failureThreshold: 5
  httpGet:
    path: {{ $probes.readiness.path }}
    port: {{ $port }}
    scheme: HTTP
  periodSeconds: {{ $probes.readiness.periodSeconds }}
  successThreshold: 1
  timeoutSeconds: {{ $probes.readiness.timeoutSeconds }}
startupProbe:
  failureThreshold: 30
  httpGet:
    path: {{ $probes.startup.path }}
    port: {{ $port }}
    scheme: HTTP
  periodSeconds: {{ $probes.startup.periodSeconds }}
  successThreshold: 1
  timeoutSeconds: {{ $probes.startup.timeoutSeconds }}
{{- end }}
{{- end }}
