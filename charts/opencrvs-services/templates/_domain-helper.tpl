{{- define "render-external-subdomain" -}}
{{- $service_name := .service_name }}
{{- $http_scheme := include "http-scheme" . }}
{{- printf "%s%s%s" $service_name ( .Values.subdomain_separator | default ".") .Values.hostname }}
{{- end }}

{{- define "render-opencrvs-host-matchers" -}}
{{- $root := . -}}
{{- $service_names := list "register" "login" "gateway" "events" "countryconfig" "metabase" -}}
{{- $host_matchers := list (printf "Host(`%s`)" $root.Values.hostname) -}}
{{- range $service_name := $service_names -}}
{{- $host := include "render-external-subdomain" (dict "service_name" $service_name "Values" $root.Values) -}}
{{- $host_matchers = append $host_matchers (printf "Host(`%s`)" $host) -}}
{{- end -}}
{{- printf "(%s)" (join " || " $host_matchers) -}}
{{- end }}
