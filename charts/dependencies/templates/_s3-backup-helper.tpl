{{/*
s3.store
---
Name of the S3 store that backup and restore work on, one at a time: rustfs when
RustFS is enabled, also when MinIO is enabled, minio otherwise. It is the name of
the StatefulSet, the Service and the app label of the store.
*/}}
{{- define "s3.store" -}}
{{- if .Values.rustfs.enabled }}rustfs{{- else }}minio{{- end }}
{{- end }}

{{/*
s3.endpoint
---
URL of the S3 API of the store, for the backup and restore scripts
*/}}
{{- define "s3.endpoint" -}}
{{- $store := include "s3.store" . }}
{{- printf "http://%s:%v" $store (ternary .Values.rustfs.port 3535 (eq $store "rustfs")) }}
{{- end }}

{{/*
s3.backup_enabled
---
CAUTION: This helper returns string value (not boolean)

Check backup is enabled or not
*/}}
{{- define "s3.backup_enabled" -}}
{{- $s3 := index .Values (include "s3.store" .) }}
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
{{- $s3 := index .Values (include "s3.store" .) }}
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
  {{- $s3 := index .Values (include "s3.store" .) }}
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

It runs as root, also in the pod of RustFS, where the pod runs as another user.
The kubelet adds the group of the pod (fsGroup) to the mode of the files of a
secret, so the key is copied before ssh sees it: ssh refuses a private key that
the group can read.
*/}}
{{- define "s3.rsync_container" -}}
{{- $store := include "s3.store" . }}
{{- $s3 := index .Values (include "s3.store" .) }}
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
        {{- if (eq (include "s3.backup_enabled" .) "true") }}
          name: {{ default .Values.backup.backup_server_secret $s3.backup.server_secret }}
        {{- else }}
          name: {{ default .Values.restore.backup_server_secret $s3.restore.server_secret }}
        {{- end }}
          key: user
    - name: BACKUP_HOST
      {{- if (eq (include "s3.backup_enabled" .) "true") }}
      value: {{ default .Values.backup.host $s3.backup.host }}
      {{- else }}
      value: {{ default .Values.restore.host $s3.restore.host }}
      {{- end }}
    - name: BACKUP_REMOTE_DIR
      {{- if (eq (include "s3.backup_enabled" .) "true") }}
      value: {{ default .Values.backup.backup_server_dir $s3.backup.server_dir }}
      {{- else }}
      value: {{ default .Values.restore.backup_server_dir $s3.restore.server_dir }}
      {{- end }}
  volumeMounts:
    - mountPath: /data
      name: {{ $store }}
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
{{- $s3 := index .Values (include "s3.store" .) }}
{{- /* If backup or restore enabled -> Define key for backup */}}
{{- $ssh_secret := default .Values.backup.backup_server_secret $s3.backup.server_secret }}
{{- /* If restore enabled -> use key for restore */}}
{{- if (eq (include "s3.restore_enabled" .) "true") }}
{{- $ssh_secret = default .Values.restore.backup_server_secret $s3.restore.server_secret }}
{{- end }}
- name: backup-ssh-key
  secret:
    secretName: {{ $ssh_secret }}
    defaultMode: 0400
    items:
      - key: ssh_key
        path: ssh_key
{{- end }}
