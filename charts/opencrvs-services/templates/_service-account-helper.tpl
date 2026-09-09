{{/*
Renders the service account name for a workload.
*/}}
{{- define "service-account-name" -}}
{{- $service_name := .service_name -}}
{{- $service_key_name := ( $service_name | replace "-" "_" ) -}}
{{- $service_values := index .Values $service_key_name | default dict -}}
{{- $service_account := $service_values.service_account | default dict -}}
{{- $service_account.name | default $service_name -}}
{{- end }}

{{/*
Renders service account fields for a Pod spec.
*/}}
{{- define "pod-service-account-values-helper" -}}
{{- $service_name := .service_name -}}
{{- $service_key_name := ( $service_name | replace "-" "_" ) -}}
{{- $global := .Values.service_account | default dict -}}
{{- $service_values := index .Values $service_key_name | default dict -}}
{{- $service_account := $service_values.service_account | default dict }}
serviceAccountName: {{ include "service-account-name" . | quote }}
{{- if hasKey $service_account "automount_service_account_token" }}
automountServiceAccountToken: {{ index $service_account "automount_service_account_token" }}
{{- else if hasKey $global "automount_service_account_token" }}
automountServiceAccountToken: {{ index $global "automount_service_account_token" }}
{{- end }}
{{- end }}

{{/*
Renders a ServiceAccount resource for a workload.
*/}}
{{- define "service-account-helper" -}}
{{- $service_name := .service_name -}}
{{- $service_key_name := ( $service_name | replace "-" "_" ) -}}
{{- $global := .Values.service_account | default dict -}}
{{- $service_values := index .Values $service_key_name | default dict -}}
{{- $service_account := $service_values.service_account | default dict -}}
{{- $create := true -}}
{{- if hasKey $global "create" -}}
{{- $create = index $global "create" -}}
{{- end -}}
{{- if hasKey $service_account "create" -}}
{{- $create = index $service_account "create" -}}
{{- end -}}
{{- if $create }}
{{- $annotations := dict -}}
{{- if $global.annotations -}}
{{- $annotations = mergeOverwrite $annotations $global.annotations -}}
{{- end -}}
{{- if $service_account.annotations -}}
{{- $annotations = mergeOverwrite $annotations $service_account.annotations -}}
{{- end }}
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "service-account-name" . | quote }}
  {{- if $annotations }}
  annotations:
    {{- toYaml $annotations | nindent 4 }}
  {{- end }}
{{- if hasKey $service_account "automount_service_account_token" }}
automountServiceAccountToken: {{ index $service_account "automount_service_account_token" }}
{{- else if hasKey $global "automount_service_account_token" }}
automountServiceAccountToken: {{ index $global "automount_service_account_token" }}
{{- end }}
{{- end }}
{{- end }}
