# Load extensions for configmap/secret/namespace operations
load('ext://configmap', 'configmap_create')
load('ext://secret', 'secret_create_generic', 'secret_from_dict', 'secret_create_tls')
load('ext://namespace', 'namespace_create', 'namespace_inject')
load('ext://helm_resource', 'helm_resource', 'helm_repo')

# Tune parallel updates, default 3
#update_settings(max_parallel_updates=2)

# Build baseimage
docker_build("ghcr.io/opencrvs/ocrvs-base", ".",
              dockerfile="packages/Dockerfile.base", 
              only=["packages/commons","package.json","yarn.lock"], 
              network="host")

# Build services
docker_build("ghcr.io/opencrvs/ocrvs-client:local", ".", 
              dockerfile="packages/client/Dockerfile", 
              only=["packages/components","packages/client","packages/events","packages/gateway"],
              network="host")
docker_build("ghcr.io/opencrvs/ocrvs-login:local", ".", 
              dockerfile="packages/login/Dockerfile", 
              only=["packages/components","packages/login"], 
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
  'data-seeder',
  'notification', 
  'scheduler', 
  'search', 
  'user-mgnt', 
  'webhooks', 
  'workflow'
]
images = ["ghcr.io/opencrvs/ocrvs-{}:local".format(app) for app in apps]

def build_services():
  for app in apps:
    docker_build("ghcr.io/opencrvs/ocrvs-{}:local".format(app), ".", dockerfile="packages/{}/Dockerfile".format(app), network="host")

build_services()

# Create namespace
opencrvs_namespace = 'opencrvs-dev'
namespace_create('traefik')
namespace_create('opencrvs-deps-dev')
namespace_create(opencrvs_namespace)

if not os.path.exists('.secrets/_wildcard.opencrvs.localhost-key.pem'):
    local('openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=GB/ST=London/L=London/O=OpenCRVS/OU=R&D Department/CN=opencrvs.org" -keyout .secrets/_wildcard.opencrvs.localhost-key.pem  -out .secrets/_wildcard.opencrvs.localhost.pem')
secret_create_tls(
  name='localhost-cert',
  key='.secrets/_wildcard.opencrvs.localhost-key.pem',
  cert='.secrets/_wildcard.opencrvs.localhost.pem',
  namespace="traefik"
)

# Install Traefik GW
helm_repo('traefik-repo', 'https://traefik.github.io/charts')
helm_resource('traefik', 'traefik-repo/traefik', namespace='traefik', resource_deps=['traefik-repo'], flags=['--values=kubernetes/traefik/values.yaml'])

# Create auth keys #in k8s
secret_create_generic('private-key', from_file='.secrets/private-key.pem', namespace=opencrvs_namespace)
configmap_create('public-key', from_file=['.secrets/public-key.pem'], namespace=opencrvs_namespace)

# Deploy dependencies with Helm
# NOTE: This helm chart can be deployed as helm release
k8s_yaml(helm('../infrastructure/charts/dependencies',
              namespace='opencrvs-deps-dev', 
              values=['../infrastructure/charts/dependencies/values.yaml', 
                      '../infrastructure/charts/dependencies/values-dev.yaml']))

k8s_yaml(helm('../infrastructure/charts/opencrvs-services',
              namespace=opencrvs_namespace,
              values=['kubernetes/opencrvs-services/values-dev.yaml']))


# TODO:
# def wait_for_builds():
#   for app in apps:
#     resources_to_be_waited = k8s_resource(app, resource_deps=images)

# wait_for_builds()

# TODO: Check the way how to get tilt build image tag
# data_seed_command = """
# helm template ../infrastructure/charts/opencrvs-services --set data_seeder.enabled=true --namespace={} -s templates/data-seeder.yaml -f kubernetes/opencrvs-services/values-dev.yaml |\
#  kubectl apply -f -""".format(opencrvs_namespace)
# local_resource(
#     'Seed data',
#     cmd=data_seed_command,
#     trigger_mode=TRIGGER_MODE_MANUAL,
# )