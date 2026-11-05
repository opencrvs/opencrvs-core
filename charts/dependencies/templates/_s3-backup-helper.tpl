{{/*
rustfs.backup_enabled
---
CAUTION: This helper returns string value (not boolean)

Check backup is enabled or not
*/}}
{{- define "rustfs.backup_enabled" -}}
{{- if or
    .Values.backup.enabled
    .Values.rustfs.backup.enabled
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
rustfs.restore_enabled
---
CAUTION: This helper returns string value (not boolean)

Check restore is enabled or not
*/}}
{{- define "rustfs.restore_enabled" -}}
{{- if or
    .Values.restore.enabled
    .Values.rustfs.restore.enabled
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
rustfs.use_rsync
---
CAUTION: This helper returns string value (not boolean)

Render differential backup properties
*/}}
{{- define "rustfs.use_rsync" -}}
  {{- if and
      (or
        (eq .Values.rustfs.backup.type "differential")
        (eq .Values.rustfs.restore.type "differential")
      )
      (or
        (eq (include "rustfs.backup_enabled" .) "true")
        (eq (include "rustfs.restore_enabled" .) "true")
      )
  }}true{{- else }}false{{- end }}
{{- end }}
