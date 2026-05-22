
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
