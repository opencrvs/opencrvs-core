############################################################
# Please check readme at: https://github.com/opencrvs/infrastructure/tree/develop
############################################################

############################################################
# Variables declaration:
############################################################
# Core images tag: usually "develop" or one of release name:
# - v1.7.0
# - v1.7.1
# NOTE: It could take any value from https://github.com/orgs/opencrvs/packages
# If you are under opencrvs-core repository, please use "local" tag
# Tilt will build new image every time when changes are made to repository
core_images_tag="local"

# Countryconfig/Farajaland image repository and tag
# Usually image repository value is to your repository on DockerHub
# If for some reason you don't have DockerHub account yet, please create
# you local registry
# (see: https://medium.com/@ankitkumargupta/quick-start-local-docker-registry-35107038242e)
countryconfig_image_name="opencrvs/ocrvs-countryconfig"
# If you are under opencrvs-countryconfig or your own repository, please use "local" tag,
# Tilt will build new image every time when changes are made to repository
countryconfig_image_tag="develop"

# Namespaces:
opencrvs_namespace = 'opencrvs-dev'
dependencies_namespace = 'opencrvs-deps-dev'

# Security enabled:
# Configure security for dependencies and OpenCRVS services:
# - Setup MinIO admin user and password
# - Configure Redis users
# - Sync passwords between dependencies and OpenCRVS services
security_enabled = True

# Checkout infrastructure directory if not exists
if not os.path.exists('../infrastructure'):
    local("git clone git@github.com:opencrvs/infrastructure.git ../infrastructure")

############################################################
# What common Tiltfile does?
# - Group resources by label on UI: http://localhost:10350/
include('../infrastructure/tilt/Tiltfile.common')

# Load extensions for namespace and helm operations
load('ext://namespace', 'namespace_create', 'namespace_inject')
load('ext://helm_resource', 'helm_resource', 'helm_repo')

# If your machine is powerful feel free to change parallel updates from default 3
update_settings(max_parallel_updates=1)

############################################################
# Build images:
############################################################

# Build baseimage
docker_build("ghcr.io/opencrvs/ocrvs-base", ".",
              dockerfile="packages/Dockerfile.base", 
              only=["packages/commons","package.json","pnpm-lock.yaml"], 
              network="host")

# Build services
docker_build("ghcr.io/opencrvs/ocrvs-client:local", ".",
              dockerfile="packages/client/Dockerfile", 
              only=[
                "infrastructure",
                "packages/components",
                "packages/client",
                "packages/events",
                "packages/gateway"
              ],
              network="host")
docker_build("ghcr.io/opencrvs/ocrvs-login:local", ".",
              dockerfile="packages/login/Dockerfile", 
              only=["infrastructure", "packages/components", "packages/login"], 
              network="host")
docker_build("ghcr.io/opencrvs/ocrvs-gateway:local", ".",
              dockerfile="packages/gateway/Dockerfile", 
              only=["packages/components","packages/gateway", "packages/events"], 
              network="host")
apps = [
    'auth', 
    'config',
    'dashboards', 
    'documents', 
    'events',
    'metrics', 
    'migration', 
    'notification', 
    'scheduler', 
    'search', 
    'user-mgnt', 
    'webhooks', 
    'workflow'
]

def build_services():
  for app in apps:
    docker_build(
        "ghcr.io/opencrvs/ocrvs-{}:local".format(app), ".",
        dockerfile="packages/{}/Dockerfile".format(app),
        only="packages/{}".format(app),
        network="host"
    )

build_services()

############################################################
# Deploy workloads:
############################################################

# Create namespaces:
# - traefik, ingress controller (https://opencrvs.localhost)
# - opencrvs-deps-dev, dependencies namespace
# - opencrvs-dev, main namespace
namespace_create('traefik')
namespace_create(dependencies_namespace)
namespace_create(opencrvs_namespace)


# Install Traefik GW
helm_repo('traefik-repo', 'https://traefik.github.io/charts', labels=['Dependencies'])
helm_resource(
  'traefik', 'traefik-repo/traefik', namespace='traefik', resource_deps=['traefik-repo'],
  flags=['--values=../infrastructure/infrastructure/localhost/traefik/values.yaml'])

######################################################
# OpenCRVS Dependencies Deployment
# NOTE: This helm chart can be deployed as helm release
if security_enabled:
    deps_configuration_file = '../infrastructure/infrastructure/localhost/dependencies/values-dev-secure.yaml'
    opencrvs_configuration_file = '../infrastructure/infrastructure/localhost/opencrvs-services/values-dev-secure.yaml'
else:
    deps_configuration_file = '../infrastructure/infrastructure/localhost/dependencies/values-dev.yaml'
    opencrvs_configuration_file = '../infrastructure/infrastructure/localhost/opencrvs-services/values-dev.yaml'
k8s_yaml(helm('../infrastructure/charts/dependencies',
  namespace=dependencies_namespace,
  values=[deps_configuration_file]))

######################################################
# OpenCRVS Deployment
k8s_yaml(
  helm('../infrastructure/charts/opencrvs-services',
       namespace=opencrvs_namespace,
       values=[opencrvs_configuration_file],
       set=[
        "image.tag={}".format(core_images_tag),
        "countryconfig.image.name={}".format(countryconfig_image_name),
        "countryconfig.image.tag={}".format(countryconfig_image_tag)
        ]
      )
)

if security_enabled:
    local_resource(
      "copy_secrets",
      cmd="""kubectl get secret redis-opencrvs-users minio-opencrvs-users -n {0} -o yaml \
          | sed "s#namespace: {0}#namespace: {1}#" | grep -v 'resourceVersion\\|uid\\|creationTimestamp' \
          | kubectl replace -n {1} -f -""".format(dependencies_namespace, opencrvs_namespace),
      resource_deps=["minio", "redis"])

######################################################
# Data management tasks:
# - Reset database: This task is not part of helm deployment to avoid accidental data loss
# - Seed data: is part of helm install post-deploy hook, but it is a manual task as well
# - Run migration job, is part of helm install/upgrade post-deploy hook
cleanup_command = "../infrastructure/infrastructure/clear-all-data.k8s.sh --dependencies-namespace {1} -o {0}".format(
  opencrvs_namespace, dependencies_namespace
)
local_resource(
    'Reset database',
    labels=['2.Data-tasks'],
    auto_init=False,
    cmd=cleanup_command,
    trigger_mode=TRIGGER_MODE_MANUAL,
)
