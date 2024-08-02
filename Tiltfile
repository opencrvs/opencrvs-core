# Load extensions for configmap/secret/namespace operations
load('ext://configmap', 'configmap_create')
load('ext://secret', 'secret_create_generic', 'secret_from_dict')
load('ext://namespace', 'namespace_create', 'namespace_inject')

# Only use for local dev with docker desktop
allow_k8s_contexts('docker-desktop')

# Build baseimage
docker_build("opencrvs/ocrvs-base", ".", dockerfile="packages/Dockerfile.base")

# Build services
docker_build("opencrvs/ocrvs-auth:dev", "packages/auth")
docker_build("opencrvs/ocrvs-client:dev", "packages", dockerfile="packages/client/Dockerfile")
docker_build("opencrvs/ocrvs-config:dev", "packages/config")
docker_build("opencrvs/ocrvs-dashboards:dev", "packages/dashboards")
docker_build("opencrvs/ocrvs-documents:dev", "packages/documents")
docker_build("opencrvs/ocrvs-gateway:dev", "packages/gateway")
docker_build("opencrvs/ocrvs-login:dev",  "packages", dockerfile="packages/login/Dockerfile")
docker_build("opencrvs/ocrvs-metrics:dev", "packages/metrics")
docker_build("opencrvs/ocrvs-migration:dev", "packages/migration")
docker_build("opencrvs/ocrvs-notification:dev", "packages/notification")
docker_build("opencrvs/ocrvs-scheduler:dev", "packages/scheduler")
docker_build("opencrvs/ocrvs-search:dev", "packages/search")
docker_build("opencrvs/ocrvs-user-mgnt:dev", "packages/user-mgnt")
docker_build("opencrvs/ocrvs-webhooks:dev", "packages/webhooks")
docker_build("opencrvs/ocrvs-workflow:dev", "packages/workflow")


# Create namespace
namespace_create('opencrvs-deps-dev')

# Create auth keys in k8s
secret_create_generic('private-key', from_file='.secrets/private-key.pem')
configmap_create('public-key', from_file=['.secrets/public-key.pem'])

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

