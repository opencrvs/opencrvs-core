{{/*
s3.admin_credentials_env
---
Environment variables S3_ADMIN_ACCESS_KEY and S3_ADMIN_SECRET_KEY of a container
that works with the object stores: the credentials of the only identity of
SeaweedFS, which is also the login of its console, and of the root user of MinIO.

MinIO and SeaweedFS have the same credentials: the same switch,
minio.use_default_credentials, and the same secret, s3-opencrvs-users, so that
both stores accept the same keys. Without generated credentials these are the
defaults of the OpenCRVS services, which the documents service uses when it is
given no credentials. Unlike MinIO, SeaweedFS answers every request without a
signature when it has no identity, so the defaults are set explicitly.
*/}}
{{- define "s3.admin_credentials_env" -}}
{{- if .Values.minio.use_default_credentials }}
- name: S3_ADMIN_ACCESS_KEY
  value: minioadmin
- name: S3_ADMIN_SECRET_KEY
  value: minioadmin
{{- else }}
- name: S3_ADMIN_ACCESS_KEY
  valueFrom:
    secretKeyRef:
      name: s3-opencrvs-users
      key: S3_ADMIN_ACCESS_KEY
- name: S3_ADMIN_SECRET_KEY
  valueFrom:
    secretKeyRef:
      name: s3-opencrvs-users
      key: S3_ADMIN_SECRET_KEY
{{- end }}
{{- end }}
