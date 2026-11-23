{{- define "render-external-subdomain" -}}
{{- $service_name := .service_name }}
{{- $http_scheme := include "http-scheme" . }}
{{- printf "%s%s%s" $service_name ( .Values.subdomain_separator | default ".") .Values.hostname }}
{{- end }}