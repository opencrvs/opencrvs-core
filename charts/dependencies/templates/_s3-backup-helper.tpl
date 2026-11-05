{{/*
s3.endpoint
---
URL of the S3 API of RustFS, for the backup and restore scripts
*/}}
{{- define "s3.endpoint" -}}
{{- printf "http://rustfs:%v" .Values.rustfs.port }}
{{- end }}

{{/*
s3.backup_enabled
---
CAUTION: This helper returns string value (not boolean)

Check backup is enabled or not
*/}}
{{- define "s3.backup_enabled" -}}
{{- $s3 := .Values.rustfs }}
{{- if or
    .Values.backup.enabled
    $s3.backup.enabled
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
s3.restore_enabled
---
CAUTION: This helper returns string value (not boolean)

Check restore is enabled or not
*/}}
{{- define "s3.restore_enabled" -}}
{{- $s3 := .Values.rustfs }}
{{- if or
    .Values.restore.enabled
    $s3.restore.enabled
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
s3.use_rsync
---
CAUTION: This helper returns string value (not boolean)

Render differential backup properties
*/}}
{{- define "s3.use_rsync" -}}
  {{- $s3 := .Values.rustfs }}
  {{- if and
      (or
        (eq $s3.backup.type "differential")
        (eq $s3.restore.type "differential")
      )
      (or
        (eq (include "s3.backup_enabled" .) "true")
        (eq (include "s3.restore_enabled" .) "true")
      )
  }}true{{- else }}false{{- end }}
{{- end }}

{{/*
s3.rsync_container
---
The sidecar of the store pod that the differential backup and restore jobs
run rsync in with kubectl exec. Include it in the containers of the StatefulSet
with nindent.

It runs as root, where the pod of RustFS runs as another user.
The kubelet adds the group of the pod (fsGroup) to the mode of the files of a
secret, so the key is copied before ssh sees it: ssh refuses a private key that
the group can read.
*/}}
{{- define "s3.rsync_container" -}}
{{- $s3 := .Values.rustfs }}
{{- /* Restore enabled -> use values for restore, backup otherwise */}}
{{- $mode := ternary "restore" "backup" (eq (include "s3.restore_enabled" .) "true") }}
{{- $global := index .Values $mode }}
{{- $local := index $s3 $mode }}
- image: {{ include "opencrvs.imageReference" .Values.utilities }}
  name: rsync
  command:
    - sh
    - -c
    - mkdir -p /root/.ssh && cp /ssh/ssh_key /root/.ssh/id_rsa && chmod 600 /root/.ssh/id_rsa && exec sleep infinity
  securityContext:
    runAsUser: 0
  env:
    - name: BACKUP_USER
      valueFrom:
        secretKeyRef:
          name: {{ default $global.backup_server_secret $local.server_secret }}
          key: user
    - name: BACKUP_HOST
      value: {{ default $global.host $local.host }}
    - name: BACKUP_REMOTE_DIR
      value: {{ default $global.backup_server_dir $local.server_dir }}
  volumeMounts:
    - mountPath: /data
      name: rustfs
    - name: backup-ssh-key
      mountPath: /ssh
      readOnly: true
{{- end }}

{{/*
s3.rsync_volume
---
The volume of the SSH key of the backup server, for s3.rsync_container. Include
it in the volumes of the StatefulSet with nindent.
*/}}
{{- define "s3.rsync_volume" -}}
{{- $s3 := .Values.rustfs }}
{{- /* Restore enabled -> use key for restore, backup otherwise */}}
{{- $mode := ternary "restore" "backup" (eq (include "s3.restore_enabled" .) "true") }}
- name: backup-ssh-key
  secret:
    secretName: {{ default (index .Values $mode).backup_server_secret (index $s3 $mode).server_secret }}
    defaultMode: 0400
    items:
      - key: ssh_key
        path: ssh_key
{{- end }}
