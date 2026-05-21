{{- define "http-scheme" -}}
{{- if .Values.ingress.ssl_enabled }}
{{- printf "https" }}
{{- else }}
{{- printf "http" }}
{{- end }}
{{- end }}

{{- define "render-external-url" -}}
{{- $service_name := .service_name }}
{{- $http_scheme := include "http-scheme" . }}
{{- printf "%s://%s%s%s" $http_scheme $service_name ( .Values.subdomain_separator | default ".") .Values.hostname }}
{{- end }}

{{- define "service-helper" -}}
{{- $service_name := .service_name }}
{{- $service_key_name := ( $service_name | replace "-" "_" ) }}
{{- $service_type := .Values.service_type }}
{{- $port := index .Values $service_key_name "port" }}
{{- $container_port := index .Values $service_key_name "container_port" | default $port }}
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: {{ $service_name }}
  name: {{ $service_name }}
spec:
  ports:
    - port: {{ $port }}
      targetPort: {{ $container_port }}
  selector:
    app: {{ $service_name }}
  type: {{ $service_type }}
{{- end }}

{{- define "hpa-helper" -}}
{{- if .Values.hpa.enabled }}
{{- $service_name := .service_name }}
{{- $service_key_name := ( $service_name | replace "-" "_" ) }}
{{- $global := .Values.hpa | default dict }}
{{- $service := (index .Values $service_key_name) | default dict }}
{{- $service_hpa := $service.hpa | default dict }}

{{- $minReplicas := $service_hpa.minReplicas | default $global.minReplicas | default 1 }}
{{- $maxReplicas := $service_hpa.maxReplicas | default $global.maxReplicas | default 2 }}
{{- $averageUtilization := $service_hpa.averageUtilization | default $global.averageUtilization | default 70 }}

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ $service_name }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ $service_name }}
  minReplicas: {{ $minReplicas }}
  maxReplicas: {{ $maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ $averageUtilization }}
{{- end }}
{{- end }}
{{- define "resources-helper" -}}
{{- $service_name := .service_name }}
{{- $service_key_name := ( $service_name | replace "-" "_" ) }}
{{- $global := .Values.resources }}
{{- $service_values := index .Values $service_key_name | default dict }}
{{- $service := $service_values.resources | default dict }}
resources:
  requests:
    memory: {{ $service.memoryRequest | default $global.memoryRequest | quote }}
    cpu: {{ $service.cpuRequest | default $global.cpuRequest | quote }}
  limits:
    memory: {{ $service.memoryLimit | default $global.memoryLimit | quote }}
    cpu: {{ $service.cpuLimit | default $global.cpuLimit | quote }}
{{- end }}

{{- define "pdb-helper" -}}
{{- if .Values.pdb.enabled }}
{{- $service_name := .service_name }}
{{- $service_key_name := ( $service_name | replace "-" "_" ) }}
{{- $global := .Values.pdb }}
{{- $service_values := index .Values $service_key_name | default dict }}
{{- $service_pdb := $service_values.pdb | default dict }}
{{- $min_available := $service_pdb.minAvailable | default $global.minAvailable }}
{{- $max_unavailable := $service_pdb.maxUnavailable | default $global.maxUnavailable }}
{{- if or $min_available $max_unavailable }}
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ $service_name }}
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: {{ $service_name }}
  {{- if $min_available }}
  minAvailable: {{ $min_available | quote }}
  {{- end }}
  {{- if $max_unavailable }}
  maxUnavailable: {{ $max_unavailable | quote }}
  {{- end }}
{{- end }}
{{- end }}
{{- end }}

{{/*

probes-helper
---
This is a helper template that dynamically generates Kubernetes Pod HTTP probes:
- liveness
- readiness
- startup

It accounts for both global and service-specific environment variables and secrets.

Parameters:
- .ServiceName: The name of the microservice, which is used to access service-specific values.
- .Values: The top-level Values object for the Helm chart.

*/}}
{{- define "probes-helper" -}}
{{- $service_name := .service_name }}
{{- $service_key_name := ( $service_name | replace "-" "_" ) }}
{{- $global := .Values.probes }}
{{- $service_values := index .Values $service_key_name | default dict }}
{{- $service := $service_values.probes | default dict }}
livenessProbe:
  failureThreshold: 5
  httpGet:
    path: {{ ( $service.liveness | default dict ).path | default $global.liveness.path }}
    port: {{ $service_values.port }}
    scheme: HTTP
  periodSeconds: {{ ( $service.liveness | default dict ).periodSeconds | default $global.liveness.periodSeconds }}
  successThreshold: 1
  timeoutSeconds: {{ ( $service.liveness | default dict ).timeoutSeconds | default $global.liveness.timeoutSeconds }}
readinessProbe:
  failureThreshold: 5
  httpGet:
    path: {{ ( $service.readiness | default dict ).path | default $global.readiness.path }}
    port: {{ $service_values.port }}
    scheme: HTTP
  periodSeconds: {{ ( $service.readiness | default dict ).periodSeconds | default $global.readiness.periodSeconds }}
  successThreshold: 1
  timeoutSeconds: {{ ( $service.readiness | default dict ).timeoutSeconds | default $global.readiness.timeoutSeconds }}
startupProbe:
  failureThreshold: 30
  httpGet:
    path: {{ ( $service.startup | default dict ).path | default $global.startup.path }}
    port: {{ $service_values.port }}
    scheme: HTTP
  periodSeconds: {{ ( $service.startup | default dict ).periodSeconds | default $global.startup.periodSeconds }}
  successThreshold: 1
  timeoutSeconds: {{ ( $service.startup | default dict ).timeoutSeconds | default $global.startup.timeoutSeconds }}
{{- end }}
