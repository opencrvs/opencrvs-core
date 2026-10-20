{{/*
URL that the services use to reach the S3 object store.

Usage:
S3_ENDPOINT: {{ include "s3-endpoint" . }}
*/}}
{{- define "s3-endpoint" -}}
{{- printf "%s://%s:%v" .Values.s3.protocol .Values.s3.host .Values.s3.port -}}
{{- end -}}

{{/*
URL that browsers use to reach the S3 object store. Presigned document URLs are
signed for it.

`s3.public_endpoint` wins. Without it, the address is the `minio` subdomain of
`hostname`, where the dependencies chart exposes its object store, so it follows
`subdomain_separator` and `ingress.ssl_enabled` the same way that chart does.

Usage:
S3_PUBLIC_ENDPOINT: {{ include "s3-public-endpoint" . }}
*/}}
{{- define "s3-public-endpoint" -}}
{{- .Values.s3.public_endpoint | default (include "render-external-url" (dict "service_name" "minio" "Values" .Values)) -}}
{{- end -}}
