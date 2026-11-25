{{- define "render-external-subdomain" -}}
{{- $service_name := .service_name }}
{{- $http_scheme := include "http-scheme" . }}
{{- printf "%s%s%s" $service_name ( .Values.subdomain_separator | default ".") .Values.hostname }}
{{- end }}

{{/*
Prints "true" when all services share `hostname` (routing.mode: path), nothing otherwise.
Usage: {{- if include "is-path-routing" . }}
*/}}
{{- define "is-path-routing" -}}
{{- if eq .Values.routing.mode "path" }}true{{ end }}
{{- end }}

{{/*
Traefik rule of the client route. Usage: include "render-client-rule" .
In path mode it is the fallback for every path that no other route takes.
*/}}
{{- define "render-client-rule" -}}
{{- if include "is-path-routing" . -}}
Host(`{{ .Values.hostname }}`)
{{- else -}}
Host(`{{ include "render-external-subdomain" (dict "service_name" "register" "Values" .Values) }}`) || Host(`{{ .Values.hostname }}`)
{{- end -}}
{{- end }}

{{/*
Path of the login app in path mode. It is not a value, because the client and login apps
write it in their code: the client goes to /login to sign in.
*/}}
{{- define "login-path" -}}
/login
{{- end }}

{{/*
Traefik rule of the login route. Usage: include "render-login-rule" .
In path mode the route also takes /register. Login sends people there after they sign in,
and the nginx of login redirects them to the client. This is what the login host does in subdomain mode.
*/}}
{{- define "render-login-rule" -}}
{{- if include "is-path-routing" . -}}
{{- $login := include "login-path" . -}}
Host(`{{ .Values.hostname }}`) && (Path(`{{ $login }}`) || PathPrefix(`{{ $login }}/`) || Path(`/register`) || PathPrefix(`/register/`))
{{- else -}}
Host(`{{ include "render-external-subdomain" (dict "service_name" "login" "Values" .Values) }}`) || Host(`{{ .Values.hostname }}`)
{{- end -}}
{{- end }}

{{- define "render-opencrvs-host-matchers" -}}
{{- $root := . -}}
{{- $service_names := list "register" "login" "countryconfig" "metabase" -}}
{{- if include "is-path-routing" $root -}}
{{- /* Only Metabase has a name of its own */ -}}
{{- $service_names = list "metabase" -}}
{{- end -}}
{{- $host_matchers := list (printf "Host(`%s`)" $root.Values.hostname) -}}
{{- range $service_name := $service_names -}}
{{- $host := include "render-external-subdomain" (dict "service_name" $service_name "Values" $root.Values) -}}
{{- $host_matchers = append $host_matchers (printf "Host(`%s`)" $host) -}}
{{- end -}}
{{- printf "(%s)" (join " || " $host_matchers) -}}
{{- end }}
