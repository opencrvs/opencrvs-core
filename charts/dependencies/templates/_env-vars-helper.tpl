{{- define "render-env-vars" -}}
  {{- $service_key_name := (.service_name | replace "-" "_") }}
  {{- $svc := get .Values $service_key_name | default dict }}

  {{- $globalEnv := .Values.env | default dict }}
  {{- $serviceEnv := $svc.env | default dict }}

  {{- $secrets := dict }}
  {{- range $secret_name, $secret_values := ($svc.secrets | default dict) }}
    {{- range $secret_value := $secret_values }}
      {{- $secret := split ":" $secret_value }}
      {{- $envName := $secret._1 | default $secret._0 }}
      {{- $_ := set $secrets $envName (dict "secret" $secret_name "key" $secret._0) }}
    {{- end }}
  {{- end }}

  {{- $result := mergeOverwrite (deepCopy $globalEnv) $serviceEnv $secrets }}

  {{- range $k, $v := $result }}
            - name: {{ $k }}
    {{- if and (kindIs "map" $v) (hasKey $v "secret") }}
              valueFrom:
                secretKeyRef:
                  name: {{ $v.secret }}
                  key: {{ $v.key | quote }}
    {{- else }}
              value: {{ $v | quote }}
    {{- end }}
  {{- end }}
{{- end }}