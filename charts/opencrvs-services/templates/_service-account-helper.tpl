{{- define "service-account-helper" -}}
{{- $service_name := .service_name -}}
{{- $service_key_name := ($service_name | replace "-" "_") -}}
{{- $service_values := index .Values $service_key_name | default dict -}}
{{- $permissions := index $service_values "service_account_permissions" | default list }}
{{- $annotations := index $service_values "service_account_annotations" | default dict }}

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ $service_name }}
  {{- with $annotations }}
  annotations:
{{ toYaml . | nindent 4 }}
  {{- end }}

{{- if $permissions }}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: {{ $service_name }}
rules:
{{ toYaml $permissions | nindent 2 }}

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: {{ $service_name }}
subjects:
  - kind: ServiceAccount
    name: {{ $service_name }}
roleRef:
  kind: Role
  name: {{ $service_name }}
  apiGroup: rbac.authorization.k8s.io
{{- end }}
{{- end }}