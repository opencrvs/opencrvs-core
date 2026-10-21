{{/*
seaweedfs.backup_enabled
---
CAUTION: This helper returns string value (not boolean)

Check backup is enabled or not
*/}}
{{- define "seaweedfs.backup_enabled" -}}
{{- if or
    .Values.backup.enabled
    .Values.seaweedfs.backup.enabled
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
seaweedfs.restore_enabled
---
CAUTION: This helper returns string value (not boolean)

Check restore is enabled or not
*/}}
{{- define "seaweedfs.restore_enabled" -}}
{{- if or
    .Values.restore.enabled
    .Values.seaweedfs.restore.enabled
}}true{{- else }}false{{- end }}
{{- end }}

{{/*
seaweedfs.rclone_env
---
Environment of a backup or restore job. The scripts in files/seaweedfs read it:

- the remote `store` is SeaweedFS, which is entered with the credentials that the object
  stores share (see seaweedfs.admin_credentials_env)
- the remote `sftp` is the backup server. Its host key is not checked, as for the other
  backup jobs, unless `known_hosts` lists it, see seaweedfs.rclone_job_volumes.
- ENCRYPT_PASS encrypts the backups, BACKUP_REMOTE_DIR is where they are kept

Usage:
env:
  {{- include "seaweedfs.rclone_env" (dict "root" . "type" "backup") | nindent 14 }}

`type` is backup or restore: the settings of that section of the values are used, and
those of SeaweedFS in that section win over the global ones.
*/}}
{{- define "seaweedfs.rclone_env" -}}
{{- $root := .root }}
{{- $global := index $root.Values .type }}
{{- $own := index $root.Values.seaweedfs .type }}
{{- include "seaweedfs.admin_credentials_env" $root }}
- name: RCLONE_CONFIG_STORE_TYPE
  value: s3
- name: RCLONE_CONFIG_STORE_PROVIDER
  value: SeaweedFS
- name: RCLONE_CONFIG_STORE_ENV_AUTH
  value: "false"
- name: RCLONE_CONFIG_STORE_ENDPOINT
  value: {{ printf "http://seaweedfs-0.seaweedfs.%s.svc.cluster.local:%v" $root.Release.Namespace $root.Values.seaweedfs.port }}
- name: RCLONE_CONFIG_STORE_FORCE_PATH_STYLE
  value: "true"
- name: RCLONE_CONFIG_STORE_ACCESS_KEY_ID
  value: $(S3_ADMIN_ACCESS_KEY)
- name: RCLONE_CONFIG_STORE_SECRET_ACCESS_KEY
  value: $(S3_ADMIN_SECRET_KEY)
- name: ENCRYPT_PASS
  valueFrom:
    secretKeyRef:
      name: {{ default $global.backup_encryption_secret $own.encryption_secret }}
      key: backup_encryption_key
- name: BACKUP_USER
  valueFrom:
    secretKeyRef:
      name: {{ default $global.backup_server_secret $own.server_secret }}
      key: user
- name: BACKUP_HOST
  value: {{ default $global.host $own.host | quote }}
- name: BACKUP_REMOTE_DIR
  value: {{ default $global.backup_server_dir $own.server_dir | quote }}
- name: RCLONE_CONFIG_SFTP_TYPE
  value: sftp
- name: RCLONE_CONFIG_SFTP_HOST
  value: $(BACKUP_HOST)
- name: RCLONE_CONFIG_SFTP_USER
  value: $(BACKUP_USER)
- name: RCLONE_CONFIG_SFTP_KEY_FILE
  value: /ssh/ssh_key
# "none" is the setting for no check of the host key, and silences the warning about it
- name: RCLONE_CONFIG_SFTP_KNOWN_HOSTS_FILE
  value: {{ if $own.known_hosts }}/known-hosts/known_hosts{{ else }}none{{ end }}
- name: RCLONE_LOG_LEVEL
  value: NOTICE
{{- end }}

{{/*
seaweedfs.rclone_job_volumes
---
The volumes of a backup or restore job: the scripts, the SSH key of the backup server, and the
known_hosts file of it when `known_hosts` is set.
Usage: volumes:
  {{- include "seaweedfs.rclone_job_volumes" (dict "root" . "type" "backup") | nindent 12 }}
*/}}
{{- define "seaweedfs.rclone_job_volumes" -}}
{{- $global := index .root.Values .type }}
{{- $own := index .root.Values.seaweedfs .type }}
- name: backup-ssh-key
  secret:
    secretName: {{ default $global.backup_server_secret $own.server_secret }}
    defaultMode: 0400
    items:
      - key: ssh_key
        path: ssh_key
- name: seaweedfs-scripts
  configMap:
    name: seaweedfs-scripts
    defaultMode: 0755
{{- if $own.known_hosts }}
- name: known-hosts
  configMap:
    name: seaweedfs-known-hosts
    items:
      - key: {{ .type }}
        path: known_hosts
{{- end }}
{{- end }}

{{/*
seaweedfs.rclone_job_volume_mounts
---
The mounts of the volumes above.
Usage: volumeMounts:
  {{- include "seaweedfs.rclone_job_volume_mounts" (dict "root" . "type" "backup") | nindent 16 }}
*/}}
{{- define "seaweedfs.rclone_job_volume_mounts" -}}
{{- $own := index .root.Values.seaweedfs .type }}
- name: backup-ssh-key
  mountPath: /ssh
  readOnly: true
- name: seaweedfs-scripts
  mountPath: /scripts
{{- if $own.known_hosts }}
- name: known-hosts
  mountPath: /known-hosts
  readOnly: true
{{- end }}
{{- end }}
