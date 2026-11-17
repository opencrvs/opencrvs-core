{{/*
Build image reference from .image.repository and .image.tag.
*/}}
{{- define "opencrvs.imageReference" -}}
{{- $repository := required "image.repository is required" .image.repository -}}
{{- $tag := required "image.tag is required" .image.tag | toString -}}
{{- printf "%s:%s" $repository $tag -}}
{{- end -}}

{{/*
Render imagePullSecrets for a Pod spec.

Resolution order:
1. Service-specific <service>.image.imagePullSecrets
2. platform.imagePullSecrets
*/}}
{{- define "opencrvs.imagePullSecrets" -}}
{{- $root := .root -}}
{{- $svc := .service | default dict -}}
{{- $svcImage := dict -}}
{{- if and (hasKey $svc "image") (kindIs "map" $svc.image) -}}
{{- $svcImage = $svc.image -}}
{{- end -}}
{{- $imagePullSecrets := $svcImage.imagePullSecrets | default $root.Values.platform.imagePullSecrets -}}
{{- with $imagePullSecrets }}
imagePullSecrets:
{{- toYaml . | nindent 2 }}
{{- end }}
{{- end -}}
