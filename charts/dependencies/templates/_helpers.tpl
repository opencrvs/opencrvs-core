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
{{- printf "%s://%s%s%s" $http_scheme $service_name ( .Values.subdomain_separator | default ".") .Values.hostname }}
{{- end }}

{{- define "resources-helper" -}}
{{- $service_name := .service_name }}
{{- $service_key_name := ( $service_name | replace "-" "_" ) }}
{{- $global := .Values.resources }}
{{- $service_values := index .Values $service_key_name | default dict }}
{{- $service := $service_values.resources | default dict }}
resources:
  requests:
    memory: {{ $service.memoryRequest | default $global.memoryRequest | quote }}
    cpu: {{ $service.cpuRequest | default $global.cpuRequest | quote }}
  limits:
    memory: {{ $service.memoryLimit | default $global.memoryLimit | quote }}
    cpu: {{ $service.cpuLimit | default $global.cpuLimit | quote }}
{{- end }}
