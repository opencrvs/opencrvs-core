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

# Load extensions for namespace and helm operations
load('ext://helm_resource', 'helm_resource', 'helm_repo')
load('ext://namespace', 'namespace_create', 'namespace_inject')
load("../infrastructure/tilt/lib.tilt", "copy_secrets", "reset_environment", "seed_data")

include('../infrastructure/tilt/common.tilt')

# If your machine is powerful feel free to change parallel updates from default 3
update_settings(max_parallel_updates=1)

############################################################
# Build images:
############################################################

# Build baseimage
docker_build("ghcr.io/opencrvs/ocrvs-base", ".",
              dockerfile="packages/Dockerfile.base", 
              only=["packages/commons","package.json","yarn.lock"], 
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
# - opencrvs-deps-dev, dependencies namespace
# - opencrvs-dev, main namespace
namespace_create(dependencies_namespace)
namespace_create(opencrvs_namespace)

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

#######################################################
# Add Data Tasks to Tilt Dashboard
reset_environment(opencrvs_namespace, opencrvs_configuration_file)

seed_data(opencrvs_namespace, opencrvs_configuration_file)

if security_enabled:
    copy_secrets(dependencies_namespace, opencrvs_namespace)

print("✅ Tiltfile configuration loaded successfully.")
