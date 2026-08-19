{{/*

render-env-vars
---
This is a helper template that dynamically generates environment variables
and secret references for the container. Env vars come from `.env` (plain
key/value); secret-backed env vars come from `.secrets`, keyed by the
Secret's name, each value a "KEY" or "KEY:ENV_VAR_NAME" string (the latter
lets the env var name differ from the key in the Secret).

Parameters:
- .: The top-level Values object for the Helm chart.
*/}}
{{- define "render-env-vars" -}}
  {{- range $k, $v := .env }}
            - name: {{ $k }}
              value: {{ $v | quote }}
  {{- end -}}
  {{- range $secret_name, $secret_values := .secrets -}}
    {{- range $secret_value := $secret_values }}
      {{- $secret := split ":" $secret_value }}
            - name: {{ $secret._1 | default $secret._0 }}
              valueFrom:
                secretKeyRef:
                  name: {{ $secret_name }}
                  key: {{ $secret._0 | quote}}
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
{{- $global := .probes }}
{{- $port := .service.container_port }}
livenessProbe:
  failureThreshold: 5
  httpGet:
    path: {{ $global.liveness.path }}
    port: {{ $port }}
    scheme: HTTP
  periodSeconds: {{ $global.liveness.periodSeconds }}
  successThreshold: 1
  timeoutSeconds: {{ $global.liveness.timeoutSeconds }}
readinessProbe:
  failureThreshold: 5
  httpGet:
    path: {{ $global.readiness.path }}
    port: {{ $port }}
    scheme: HTTP
  periodSeconds: {{ $global.readiness.periodSeconds }}
  successThreshold: 1
  timeoutSeconds: {{ $global.readiness.timeoutSeconds }}
startupProbe:
  failureThreshold: 30
  httpGet:
    path: {{ $global.startup.path }}
    port: {{ $port }}
    scheme: HTTP
  periodSeconds: {{ $global.startup.periodSeconds }}
  successThreshold: 1
  timeoutSeconds: {{ $global.startup.timeoutSeconds }}
{{- end }}
{{- end }}
