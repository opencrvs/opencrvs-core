{{- define "elasticsearch-reindex.containerSpec" -}}
- name: elasticsearch-reindex
  command: ["sh", "-c", "apk add --no-cache curl jq && /data-assets/reindex.sh"]
  image: "alpine"
  env:
    - name: AUTH_URL
      value: "http://auth.{{ .Release.Namespace }}.svc.cluster.local:4040"
    - name: EVENTS_URL
      value: "http://events.{{ .Release.Namespace }}.svc.cluster.local:5555"
  volumeMounts:
    - mountPath: /data-assets
      name: elasticsearch-assets
{{- end }}
{{- define "elasticsearch-reindex.initContainerSpec" -}}
- name: copy-assets
  image: {{ include "opencrvs.image" (dict "root" . "service" .Values.countryconfig) }}-assets
  command:
    - sh
    - -c
    - >
      cp -R /assets/elasticsearch/* /data-assets/ && \
      chmod +x /data-assets/*.sh || true
  volumeMounts:
    - name: elasticsearch-assets
      mountPath: /data-assets
{{- end }}
{{- define "elasticsearch-reindex.volumes" -}}
- name: elasticsearch-assets
  emptyDir: {}
{{- end }}
