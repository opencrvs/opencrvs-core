{{/*
minio.backup_enabled
---
CAUTION: This helper returns string value (not boolean)

Check backup is enabled or not
*/}}
{{- define "minio.backup_enabled" -}}
{{- if or 
    .Values.backup.enabled
    .Values.minio.backup.enabled 
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
minio.restore_enabled
---
CAUTION: This helper returns string value (not boolean)

Check restore is enabled or not
*/}}
{{- define "minio.restore_enabled" -}}
{{- if or 
    .Values.restore.enabled
    .Values.minio.restore.enabled 
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
minio.use_rsync
---
CAUTION: This helper returns string value (not boolean)

Render differential backup properties
*/}}
{{- define "minio.use_rsync" -}}
  {{- if and
      (or
        (eq .Values.minio.backup.type "differential")
        (eq .Values.minio.restore.type "differential")
      )
      (or
        (eq (include "minio.backup_enabled" .) "true")
        (eq (include "minio.restore_enabled" .) "true")
      )
  }}true{{- else }}false{{- end }}
{{- end }}
