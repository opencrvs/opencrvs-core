{{/*
postgres.backup_enabled
---
CAUTION: This helper returns string value (not boolean)

Check backup is enabled or not
*/}}
{{- define "postgres.backup_enabled" -}}
{{- if or 
    .Values.backup.enabled
    .Values.postgres.backup.enabled 
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
postgres.restore_enabled
---
CAUTION: This helper returns string value (not boolean)

Check restore is enabled or not
*/}}
{{- define "postgres.restore_enabled" -}}
{{- if or 
    .Values.restore.enabled
    .Values.postgres.restore.enabled 
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
postgres.use_pgBackRest
---
CAUTION: This helper returns string value (not boolean)

Render differential backup properties
*/}}
{{- define "postgres.use_pgBackRest" -}}
  {{- if and
      (or
        (eq .Values.postgres.backup.type "differential")
        (eq .Values.postgres.restore.type "differential")
      )
      (or
        (eq (include "postgres.backup_enabled" .) "true")
        (eq (include "postgres.restore_enabled" .) "true")
      )
  }}true{{- else }}false{{- end }}
{{- end }}
