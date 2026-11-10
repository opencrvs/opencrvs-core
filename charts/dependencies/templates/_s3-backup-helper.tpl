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

{{/*
rustfs.backup_dir
---
Name of the directory of the differential backup, below the backup server directory.

It is `minio` when RustFS uses the data of a MinIO: `rustfs.host_data_path` ends with `/minio`
(host_path storage), or `rustfs.pvc.name` is `minio` (pvc storage). Then the backups of the MinIO
versions of the chart, which are in `minio`, are found. In all other cases it is `rustfs`.
*/}}
{{- define "rustfs.backup_dir" -}}
{{- $storageType := default .Values.storage_type .Values.rustfs.storage_type | default "pvc" -}}
{{- if eq $storageType "host_path" -}}
{{- if eq (base .Values.rustfs.host_data_path) "minio" }}minio{{ else }}rustfs{{ end -}}
{{- else -}}
{{- if eq .Values.rustfs.pvc.name "minio" }}minio{{ else }}rustfs{{ end -}}
{{- end -}}
{{- end }}
