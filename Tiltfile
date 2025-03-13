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
docker_build("ghcr.io/opencrvs/ocrvs-client:local", "packages", 
              dockerfile="packages/client/Dockerfile", 
              only=["components","client","events","gateway"],
              network="host")
docker_build("ghcr.io/opencrvs/ocrvs-login:local", "packages", 
              dockerfile="packages/login/Dockerfile", 
              only=["components","login"], 
              network="host")
docker_build("ghcr.io/opencrvs/ocrvs-gateway:local", "packages",
              dockerfile="packages/gateway/Dockerfile", 
              only=["components","gateway", "events"], 
              network="host")

apps = ['auth', 
              'config',
              # 'dashboards', 
              'documents', 
              'events',
              'metrics', 
              'migration', 
              'notification', 
              'scheduler', 
              'search', 
              'user-mgnt', 
              'webhooks', 
              'workflow']

def build_services():
  for app in apps:
    docker_build("ghcr.io/opencrvs/ocrvs-{}:local".format(app), "packages/{}".format(app), network="host")

build_services()

# Only use for local dev with docker desktop
allow_k8s_contexts('docker-desktop')

# Create namespace
namespace_create('traefik')
namespace_create('opencrvs-deps-dev')
namespace_create('opencrvs-services-dev')


def create_traefik_ssl():
"""Create SSL certificate locally in .secrets"""
    local_resource(
      name="refresh_traefik_ssl",
      cmd='openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 -subj "/C=GB/ST=London/L=London/O=OpenCRVS/OU=R&D Department/CN=opencrvs.org" -keyout .secrets/_wildcard.opencrvs.localhost-key.pem  -out .secrets/_wildcard.opencrvs.localhost.pem'
    )
    secret_create_tls('localhost-cert', key='.secrets/_wildcard.opencrvs.localhost-key.pem', cert='.secrets/_wildcard.opencrvs.localhost.pem',namespace="traefik")

create_traefik_ssl()

# Install Traefik GW
helm_repo('traefik-repo', 'https://traefik.github.io/charts')
helm_resource('traefik', 'traefik-repo/traefik', namespace='traefik', resource_deps=['traefik-repo'], flags=['--values=kubernetes/traefik/values.yaml'])

# Create auth keys #in k8s
secret_create_generic('private-key', from_file='.secrets/private-key.pem', namespace="opencrvs-services-dev")
configmap_create('public-key', from_file=['.secrets/public-key.pem'], namespace="opencrvs-services-dev")

# Deploy dependencies with Helm
k8s_yaml(helm('kubernetes/dependencies',
              namespace='opencrvs-deps-dev', 
              values=['kubernetes/dependencies/values.yaml', 
                      'kubernetes/dependencies/values-dev.yaml']))


# Deploy services with Helm
k8s_yaml(helm('kubernetes/opencrvs-services',
             namespace='opencrvs-services-dev', 
             values=['kubernetes/opencrvs-services/values.yaml', 
                    'kubernetes/opencrvs-services/values-dev.yaml']))


#def wait_for_builds():
#  for app in apps:
#    resources_to_be_waited = 
#    k8s_resource(app, resource_deps=["ghcr.io/opencrvs/ocrvs-{}:local".format(app))

#wait_for_builds()
