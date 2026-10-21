{{/*
Public host[:port] that browsers use to reach the S3 object store. Presigned
document URLs are signed for it.

`s3.external_url` wins. Without it, the host is the `s3.external_subdomain`
(`minio` by default, where the dependencies chart exposes MinIO) of the hostname,
so it follows `subdomain_separator` the same way that chart does. SeaweedFS is
exposed on the `seaweedfs` subdomain, so set `s3.external_subdomain` or
`s3.external_url` when `s3.host` points at it.

Usage:
S3_PUBLIC_URL: {{ include "s3-external-url" . }}
*/}}
{{- define "s3-external-url" -}}
{{- .Values.s3.external_url | default (include "render-external-subdomain" (dict "service_name" (.Values.s3.external_subdomain | default "minio") "Values" .Values)) -}}
{{- end -}}
