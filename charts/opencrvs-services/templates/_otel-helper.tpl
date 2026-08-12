
{{- define "render-nginx-otel-env-vars" -}}
  {{- $otel := .Values.otel | default dict }}
  {{- $globalEnv := .Values.env | default dict }}
  {{- $deployment_environment := $otel.deployment_environment | default ($globalEnv.NODE_ENV | default "production") }}
  {{- $service_namespace := .Release.Namespace }}
  {{- $endpoint := $otel.exporter_otlp_endpoint | default "127.0.0.1:4317" }}
  {{- $grpc_endpoint := trimPrefix "https://" (trimPrefix "http://" $endpoint) }}
            - name: OTEL_NGINX_TRACE
              value: {{ ternary "on" "off" ($otel.enabled | default false) | quote }}
            - name: OTEL_NGINX_EXPORTER_ENDPOINT
              value: {{ $grpc_endpoint | quote }}
            - name: OTEL_NGINX_SERVICE_NAME
              value: {{ .service_name | quote }}
            - name: OTEL_NGINX_SERVICE_NAMESPACE
              value: {{ $service_namespace | quote }}
            - name: OTEL_NGINX_DEPLOYMENT_ENVIRONMENT
              value: {{ $deployment_environment | quote }}
{{- end }}

{{- define "render-otel-env-vars" -}}
  {{- $otel := .Values.otel | default dict }}
  {{- if $otel.enabled }}
  {{- $globalEnv := .Values.env | default dict }}
  {{- $deployment_environment := $otel.deployment_environment | default ($globalEnv.NODE_ENV | default "production") }}
  {{- $service_version := .Values.platform.tag | default "unknown" | toString | trimPrefix "v" }}
  {{- $service_namespace := .Release.Namespace }}
  {{- $endpoint := required "otel.exporter_otlp_endpoint is required when otel.enabled=true" $otel.exporter_otlp_endpoint }}
  {{- $otlp_endpoint := $endpoint }}
  {{- if not (or (hasPrefix "http://" $endpoint) (hasPrefix "https://" $endpoint)) }}
    {{- $otlp_endpoint = printf "http://%s" $endpoint }}
  {{- end }}
  {{- if not (hasKey $globalEnv "NODE_ENV") }}
            - name: NODE_ENV
              value: {{ $deployment_environment | quote }}
  {{- end }}
            - name: OTEL_DEPLOYMENT_ENVIRONMENT
              value: {{ $deployment_environment | quote }}
            - name: OTEL_TRACES_EXPORTER
              value: "otlp"
            - name: OTEL_METRICS_EXPORTER
              value: "otlp"
            - name: OTEL_LOGS_EXPORTER
              value: "none"
            - name: OTEL_EXPORTER_OTLP_ENDPOINT
              value: {{ $otlp_endpoint | quote }}
            - name: OTEL_EXPORTER_OTLP_PROTOCOL
              value: {{ $otel.exporter_otlp_protocol | default "grpc" | quote }}
            - name: OTEL_RESOURCE_ATTRIBUTES
              value: >-
                service.version={{ $service_version }},
                deployment.environment.name={{ $deployment_environment }},
                service.namespace={{ $service_namespace }}
            - name: OTEL_NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
  {{- end }}
{{- end }}
