{{- define "network-policy-rules" -}}
{{- if .Values.network_policy.enabled -}}
{{- $service_name := .service_name -}}
{{- $root := .Values -}}
{{- $service_key := .service_key | default ($service_name | replace "-" "_") -}}
{{- $service_values := index $root $service_key | default dict -}}
{{- $network_policy := $service_values.network_policy | default dict -}}
{{- $appLabel := $network_policy.app_label | default $service_name -}}
{{- $default_rules := $network_policy.rules | default list -}}
{{- $custom_rules := $network_policy.custom_rules | default list -}}
{{- $rules := concat $default_rules $custom_rules -}}

{{- $ingress_mode := $network_policy.ingress_mode | default "deny" -}}
{{- $egress_mode := $network_policy.egress_mode | default "deny" -}}
{{- $private_cidrs := list "10.0.0.0/8" "172.16.0.0/12" "192.168.0.0/16" -}}

{{- if and (ne $ingress_mode "deny") $service_values.port }}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ printf "%s-allow-ingress" $service_name | trunc 63 | trimSuffix "-" }}
spec:
  podSelector:
    matchLabels:
      app: {{ $appLabel | quote }}
  policyTypes:
    - Ingress
  ingress:
{{- if eq $ingress_mode "private" }}
    - from:
        {{- range $private_cidrs }}
        - ipBlock:
            cidr: {{ . }}
        {{- end }}
      ports:
        - protocol: TCP
          port: {{ $service_values.port }}
{{- else }}
    - ports:
        - protocol: TCP
          port: {{ $service_values.port }}
{{- end }}
{{- end }}

{{- if ne $egress_mode "deny" }}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ printf "%s-allow-egress" $service_name | trunc 63 | trimSuffix "-" }}
spec:
  podSelector:
    matchLabels:
      app: {{ $appLabel | quote }}
  policyTypes:
    - Egress
  egress:
{{- if eq $egress_mode "private" }}
    - to:
        {{- range $private_cidrs }}
        - ipBlock:
            cidr: {{ . }}
        {{- end }}
{{- else }}
    - {}
{{- end }}
{{- end }}

{{- range $rule := $rules }}
{{- if not $rule.name }}
{{- fail (printf "network_policy rule for service %s must define name" $service_name) }}
{{- end }}
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ printf "%s-%s" $service_name $rule.name | trunc 63 | trimSuffix "-" }}
spec:
  podSelector:
    matchLabels:
      app: {{ $appLabel | quote }}
  policyTypes:
{{ toYaml $rule.policyTypes | indent 4 }}
{{- if $rule.ingress }}
  ingress:
{{ toYaml $rule.ingress | indent 4 }}
{{- end }}
{{- if $rule.egress }}
  egress:
{{ toYaml $rule.egress | indent 4 }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}
