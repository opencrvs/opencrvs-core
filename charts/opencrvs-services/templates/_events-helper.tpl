{{/*
The events Deployment and the Elasticsearch reindex job run the same image.
They share the environment and secrets, so the reindex job reads the same
Postgres, Elasticsearch and country config as the running service.
*/}}
{{- define "events.env" -}}
{{- /* The shared env helpers indent their output for a Deployment. Remove that indent, so the caller can set it. */}}
{{- $otel := regexReplaceAll "(?m)^ {12}" (include "render-otel-env-vars" (dict "Values" .Values "Release" .Release)) "" | trim }}
{{- $serviceEnv := regexReplaceAll "(?m)^ {12}" (include "render-env-vars" (dict "service_name" "events" "Values" .Values)) "" | trim }}
{{- with $otel }}{{ . }}{{ "\n" }}{{ end -}}
- name: AUTH_URL
  value: "http://auth.{{ .Release.Namespace }}.svc.cluster.local:4040"
- name: CERT_PUBLIC_KEY_PATH
  value: /secrets/public-key.pem
- name: CORE_REQUEST_SIGNING_KEY_PATH
  value: /secrets/core-request-signing-key.pem
- name: COUNTRY_CONFIG_URL
  value: "http://countryconfig.{{ .Release.Namespace }}.svc.cluster.local:3040"
- name: DOCUMENTS_URL
  value: "http://documents.{{ .Release.Namespace }}.svc.cluster.local:9050"
- name: ES_URL
  valueFrom:
    secretKeyRef:
      key: SEARCH_ELASTIC_URL
      name: {{ .Values.elasticsearch.urls_secret }}
- name: EVENTS_POSTGRES_URL
  valueFrom:
    secretKeyRef:
      key: events_app_db_url
      name: {{ .Values.postgres.urls_secret }}
{{- with $serviceEnv }}
{{ . }}
{{- end }}
{{- end }}

{{- define "events.volumeMounts" -}}
- mountPath: /secrets/public-key.pem
  name: public-key
  subPath: public-key.pem
- mountPath: /secrets/core-request-signing-key.pem
  name: core-request-signing-key
  subPath: core-request-signing-key.pem
{{- end }}

{{- define "events.volumes" -}}
- name: public-key
  configMap:
    name: {{ .Release.Name }}-cert-tls
    items:
      - key: public-key.pem
        path: public-key.pem
- name: core-request-signing-key
  secret:
    secretName: opencrvs-core-request-signing-key
{{- end }}

{{- define "elasticsearch-reindex.containerSpec" -}}
- name: elasticsearch-reindex
  image: {{ include "opencrvs.image" (dict "root" . "service" .Values.events) }}
  imagePullPolicy: {{ .Values.events.image.pullPolicy | default .Values.platform.imagePullPolicy }}
  command: ["pnpm", "reindex:prod"]
  env:
    {{- include "events.env" . | nindent 4 }}
  volumeMounts:
    {{- include "events.volumeMounts" . | nindent 4 }}
{{- end }}
