
{{/*
mosip.image
---
Renders "<repository>:<tag>" for one of the three MOSIP services.

The tag is resolved in this order:
  1. <service>.image.tag  — pins a single service
  2. .Values.platform.tag    — pins all three, e.g. --set platform.tag=<commit sha>
  3. .Chart.AppVersion    — the core release these images are built from

Usage: {{ include "mosip.image" (dict "root" . "service" .Values.mosip_api) }}
*/}}
{{- define "mosip.image" -}}
{{- $root := .root -}}
{{- $svc := .service -}}
{{- $tag := $svc.image.tag | default $root.Values.platform.tag | default $root.Chart.AppVersion -}}
{{- printf "%s:%s" $svc.image.repository ($tag | toString | trim) -}}
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
