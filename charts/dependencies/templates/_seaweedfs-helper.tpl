{{/*
seaweedfs.admin_credentials_env
---
Environment variables S3_ADMIN_ACCESS_KEY and S3_ADMIN_SECRET_KEY of a SeaweedFS
container: the credentials of the only identity of the store, which is also the
login of its console.

SeaweedFS has the credentials of MinIO: the same switch,
minio.use_default_credentials, and the same secret, s3-opencrvs-users, so that
both stores accept the same keys. Without generated credentials these are the
defaults of the OpenCRVS services, which the documents service uses when it is
given no credentials. Unlike MinIO, SeaweedFS answers every request without a
signature when it has no identity, so the defaults are set explicitly.
*/}}
{{- define "seaweedfs.admin_credentials_env" -}}
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
