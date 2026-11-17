{{/*

render-env-vars
---
This is a helper template that dynamically generates environment variables and secret references for Kubernetes Deployments.
It accounts for both global and service-specific environment variables and secrets.

Parameters:
- .ServiceName: The name of the microservice, which is used to access service-specific values.
- .Values: The top-level Values object for the Helm chart.
*/}}
{{- define "render-env-vars" -}}
  {{- $service_name := .service_name -}}
  {{/* Loop through and generate global environment variables */}}
  {{- range $k, $v := .Values.env }}
            - name: {{ $k }}
              value: {{ $v | quote }}
  {{- end -}}
  {{/* Access the service-specific values using the service name */}}
  {{- with index .Values $service_name -}}
    {{/* Loop through and generate service-specific environment variables */}}
    {{- range $k, $v := .env }}
            - name: {{ $k }}
              value: {{ $v | quote }}
    {{- end -}}
    {{/* Loop through and generate secret references for service-specific secrets */}}
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
