{{- define "render-env-vars" -}}
  {{- $service_key_name := (.service_name | replace "-" "_") }}
  {{- $svc := get .Values $service_key_name | default dict }}

  {{- $globalEnv := .Values.env | default dict }}
  {{- $serviceEnv := $svc.env | default dict }}

  {{- $secrets := dict }}
  {{- range $secret_name, $secret_values := ($svc.secrets | default dict) }}
    {{- range $secret_value := $secret_values }}
      {{- $secret := split ":" $secret_value }}
      {{- $envName := $secret._1 | default $secret._0 }}
      {{- $_ := set $secrets $envName (dict "secret" $secret_name "key" $secret._0) }}
    {{- end }}
  {{- end }}

  {{- $result := mergeOverwrite (deepCopy $globalEnv) $serviceEnv $secrets }}

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

{{- define "render-otel-env-vars" -}}
  {{- $otel := .Values.otel | default dict }}
  {{- if $otel.enabled }}
  {{- $globalEnv := .Values.env | default dict }}
  {{- $deployment_environment := $otel.deployment_environment | default ($globalEnv.NODE_ENV | default "production") }}
  {{- $service_version := .Values.platform.tag | default "unknown" | toString | trimPrefix "v" }}
  {{- $service_namespace := .Release.Namespace }}
  {{- $endpoint := required "otel.exporter_otlp_endpoint is required when otel.enabled=true" $otel.exporter_otlp_endpoint }}
  {{- $traces_endpoint := $otel.exporter_otlp_traces_endpoint | default (printf "%s/v1/traces" $endpoint) }}
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
              value: {{ $endpoint | quote }}
            - name: OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
              value: {{ $traces_endpoint | quote }}
            - name: OTEL_EXPORTER_OTLP_PROTOCOL
              value: {{ $otel.exporter_otlp_protocol | default "http/protobuf" | quote }}
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
