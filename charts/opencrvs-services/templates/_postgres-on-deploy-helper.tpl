{{- define "postgres-on-deploy.containerSpec" -}}
- name: postgres-on-deploy
  command: ["bash", "-c", "/scripts/on-deploy.sh"]
  image: {{ .Values.postgres.image }}
  volumeMounts:
    - mountPath: /scripts
      name: postgres-on-deploy-script
  env:
    - name: POSTGRES_HOST
      value: {{ .Values.postgres.host }}
    - name: POSTGRES_PORT
      value: "5432"
    {{- if eq .Values.postgres.auth_mode "disabled" }}
    - name: POSTGRES_USER
      value: postgres
    - name: POSTGRES_PASSWORD
      value: postgres
    {{- else }}
    - name: POSTGRES_USER
      valueFrom:
        secretKeyRef:
          name: {{ .Values.postgres.admin_user_secret_name }}
          key: POSTGRES_USER
    - name: POSTGRES_PASSWORD
      valueFrom:
        secretKeyRef:
          name: {{ .Values.postgres.admin_user_secret_name }}
          key: POSTGRES_PASSWORD
    {{- end }}
    - name: EVENTS_APP_ROLE
      valueFrom:
        secretKeyRef:
          name: {{ .Values.postgres.users_secret }}
          key: EVENTS_APP_POSTGRES_USER
    - name: EVENTS_APP_POSTGRES_PASSWORD
      valueFrom:
        secretKeyRef:
          name: {{ .Values.postgres.users_secret }}
          key: EVENTS_APP_POSTGRES_PASSWORD
    - name: EVENTS_MIGRATOR_ROLE
      valueFrom:
        secretKeyRef:
          name: {{ .Values.postgres.users_secret }}
          key: EVENTS_MIGRATOR_POSTGRES_USER
    - name: EVENTS_MIGRATOR_POSTGRES_PASSWORD
      valueFrom:
        secretKeyRef:
          name: {{ .Values.postgres.users_secret }}
          key: EVENTS_MIGRATOR_POSTGRES_PASSWORD
    - name: ANALYTICS_POSTGRES_USER
      valueFrom:
        secretKeyRef:
          name: {{ .Values.postgres.users_secret }}
          key: EVENTS_ANALYTICS_POSTGRES_USER
    - name: ANALYTICS_POSTGRES_PASSWORD
      valueFrom:
        secretKeyRef:
          name: {{ .Values.postgres.users_secret }}
          key: EVENTS_ANALYTICS_POSTGRES_PASSWORD
{{- end }}
{{- define "postgres-on-deploy.volumes" -}}
- name: postgres-on-deploy-script
  configMap:
    name: postgres-on-deploy-script
    defaultMode: 0755
{{- end }}