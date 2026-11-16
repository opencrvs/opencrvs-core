{{/*
Value of a key in a Secret that lookup returned, decoded. Returns `default` when the Secret or the key is missing.

Usage:
{{ include "opencrvs.secretValue" (dict "secret" $secret "key" "POSTGRES_USER" "default" "postgres") }}
*/}}
{{- define "opencrvs.secretValue" -}}
{{- $value := "" -}}
{{- if and .secret .secret.data -}}
{{- $value = index .secret.data .key | default "" | b64dec -}}
{{- end -}}
{{- $value | default .default -}}
{{- end -}}

{{/*
Returns "true" when the chart can read the cluster. `helm template` cannot, so it cannot tell a missing secret from one
that it does not see. Every namespace has the ConfigMap kube-root-ca.crt, which shows that the cluster is readable.

Usage:
{{- if include "opencrvs.clusterReadable" . }}
*/}}
{{- define "opencrvs.clusterReadable" -}}
{{- if lookup "v1" "ConfigMap" .Release.Namespace "kube-root-ca.crt" -}}true{{- end -}}
{{- end -}}
