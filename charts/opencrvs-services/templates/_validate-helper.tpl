{{- define "opencrvs-validate.containerSpec" -}}
{{- $root := .root -}}
{{- $mode := .mode -}}
- name: opencrvs-validate-{{ $mode }}
  # NOTE: sleep was added to allow logs be captured before failure
  command:
    - bash
    - -c
    - >-
      sleep 10 && opencrvs-validate.sh {{ $mode }}{{ if ne $mode "preflight" }} --domain "$DOMAIN"{{ end }}
  image: {{ include "opencrvs.image" (dict "root" $root "service" $root.Values.utilities) }}
  imagePullPolicy: {{ $root.Values.utilities.image.pullPolicy | default $root.Values.platform.imagePullPolicy }}
  env:
    - name: DOMAIN
      value: {{ $root.Values.hostname | quote }}
    - name: CERT_ENDPOINT
      value: {{ $root.Values.validation.cert_endpoint | quote }}
    - name: MONITORING_ENABLED
      value: {{ $root.Values.validation.monitoring_enabled | quote }}
    - name: ALLOW_INSECURE_HTTPS
      value: {{ $root.Values.validation.allow_insecure_https | quote }}
    - name: TIMEOUT_SECONDS
      value: {{ $root.Values.validation.timeout_seconds | quote }}
    - name: POSTGRES_HOST
      value: {{ $root.Values.postgres.host | quote }}
    - name: POSTGRES_PORT
      value: {{ $root.Values.postgres.port | default 5432 | quote }}
    - name: ELASTICSEARCH_HOST
      value: {{ $root.Values.elasticsearch.host | quote }}
    - name: ELASTICSEARCH_PORT
      value: {{ $root.Values.elasticsearch.port | default 9200 | quote }}
    - name: MINIO_HOST
      value: {{ $root.Values.minio.host | quote }}
    - name: MINIO_PORT
      value: {{ $root.Values.minio.port | default 9000 | quote }}
    - name: MINIO_URL
      value: {{ $root.Values.minio.external_url  | default (printf "minio.%s" $root.Values.hostname) }}
    - name: REDIS_HOST
      value: {{ $root.Values.redis.host | quote }}
    - name: REDIS_PORT
      value: {{ $root.Values.redis.port | default 6379 | quote }}
    - name: TWO_FA_ENABLED
      value: {{ $root.Values.auth.env.TWO_FA_ENABLED | default false | quote }}
    - name: SMTP_HOST
      valueFrom:
        secretKeyRef:
          name: {{ $root.Values.validation.smtp_secret_name | quote }}
          key: SMTP_HOST
          optional: true
    - name: SMTP_PORT
      valueFrom:
        secretKeyRef:
          name: {{ $root.Values.validation.smtp_secret_name | quote }}
          key: SMTP_PORT
          optional: true
    - name: SENDER_EMAIL_ADDRESS
      valueFrom:
        secretKeyRef:
          name: {{ $root.Values.validation.smtp_secret_name | quote }}
          key: SENDER_EMAIL_ADDRESS
          optional: true
    - name: ALERT_EMAIL
      valueFrom:
        secretKeyRef:
          name: {{ $root.Values.validation.smtp_secret_name | quote }}
          key: ALERT_EMAIL
          optional: true
{{- end }}
