
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
strategy-helper
---
Renders the Deployment's `.spec.strategy` block for one of the MOSIP
services. Global default lives under `strategy:`, overridable per-service
under <service>.strategy (e.g. mosip_api.strategy.type).

Parameters:
- .service_name: The name of the microservice (e.g. "mosip-api"), used to
  key into per-service overrides.
- .Values: The top-level Values object for the Helm chart.
*/}}
{{- define "strategy-helper" -}}
{{- $service_name := .service_name }}
{{- $service_key_name := ( $service_name | replace "-" "_" ) }}
{{- $global := .Values.strategy | default dict }}
{{- $service_values := index .Values $service_key_name | default dict }}
{{- $service_strategy := $service_values.strategy | default dict }}
{{- $type := $service_strategy.type | default $global.type | default "RollingUpdate" }}
strategy:
  type: {{ $type }}
{{- end }}
