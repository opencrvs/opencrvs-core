{{/*
Usage:
image: {{ include "opencrvs.image" (dict "root" . "service" .Values.auth) }}

FIXME: Remove after v2.1

Legacy fallback to `.Values.image.*` (deprecated) can be removed
once all configuration files are migrated to use `platform.*`.

At that point, simplify helper input and resolution logic to:

image: {{ include "opencrvs.image" (dict
  "platform" .Values.platform
  "service" .Values.auth
) }}

and remove fallback to:
- .Values.image.tag
- .Values.imagePullSecrets

This will reduce complexity and make precedence rules explicit.
*/}}

{{/*
Build full container image reference for an OpenCRVS service.

Resolution order (highest priority first):
1. Service-specific image overrides (.service.image.*)
2. Platform defaults (.Values.platform.*)
3. Deprecated legacy fields (.Values.image.*) — temporary fallback

Expected service values structure:
<service>:
  image:
    name: <required>               # image name, e.g. ocrvs-auth
    tag: <optional>               # overrides platform.tag
    repository: <optional>        # overrides platform.repository

Platform defaults:
platform:
  repository: ghcr.io/opencrvs
  tag: v1.x.x

Example output:
ghcr.io/opencrvs/ocrvs-auth:v1.9.11

*/}}
{{- define "opencrvs.image" -}}
{{- $root := .root -}}
{{- $svc := .service -}}

{{- $rawTag := $svc.image.tag | default $root.Values.platform.tag | default $root.Values.image.tag -}}
{{- $tag := kindIs "float64" $rawTag | ternary ($rawTag | int64 | toString) ($rawTag | toString) -}}
{{- $repository := $svc.image.repository | default $root.Values.platform.repository -}}
{{- $name := required "service image.name is required" $svc.image.name -}}

{{- if contains "/" $name -}}
{{- printf "%s:%s" $name $tag -}}
{{- else -}}
{{- printf "%s/%s:%s" $repository $name $tag -}}
{{- end -}}
{{- end -}}


{{/*
opencrvs.imagePullSecrets
---
Renders imagePullSecrets for a Pod spec.

Usage:
  {{- include "opencrvs.imagePullSecrets" (dict "root" . "service" .Values.auth) | nindent 6 }}

Resolution order:
1. Service-specific imagePullSecrets:
   <service>.image.imagePullSecrets

2. Platform-level imagePullSecrets:
   platform.imagePullSecrets

3. Legacy imagePullSecrets:
   imagePullSecrets

Example values:

platform:
  imagePullSecrets:
    - name: ghcr-secret

auth:
  image:
    imagePullSecrets:
      - name: custom-auth-secret

Backward compatibility:
- .Values.imagePullSecrets is deprecated.
- It exists only to support older configuration files.
- Remove this fallback after all environments migrate to platform.imagePullSecrets.

Notes:
- This helper renders the full imagePullSecrets block.
- It should be used under spec.template.spec.
- Do not add imagePullSecrets manually around this helper.
*/}}
{{- define "opencrvs.imagePullSecrets" -}}
{{- $root := .root -}}
{{- $svc := .service | default dict -}}
{{- $svcImage := $svc.image | default dict -}}

{{- $imagePullSecrets := (
    $svcImage.imagePullSecrets
    | default $root.Values.platform.imagePullSecrets
    | default $root.Values.imagePullSecrets
  ) -}}

{{- with $imagePullSecrets }}
imagePullSecrets:
{{- toYaml . | nindent 2 }}
{{- end }}
{{- end -}}
