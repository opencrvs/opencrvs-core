{{/*
Public host[:port] that browsers use to reach the S3 object store. Presigned
document URLs are signed for it.

`s3.external_url` wins. Without it, the host is the `minio` subdomain where the
dependencies chart exposes MinIO, so it follows `subdomain_separator` the same
way that chart does. SeaweedFS is exposed on the `seaweedfs` subdomain instead,
so `s3.external_url` must be set when `s3.host` points at it.

Usage:
S3_PUBLIC_URL: {{ include "s3-external-url" . }}
*/}}
{{- define "s3-external-url" -}}
{{- .Values.s3.external_url | default (include "render-external-subdomain" (dict "service_name" "minio" "Values" .Values)) -}}
{{- end -}}
