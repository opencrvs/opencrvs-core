##########################################################################
# Tiltfile: OpenCRVS Core developer
# For more information about variables, please check:
# https://github.com/opencrvs/infrastructure/blob/develop/Tiltfile

core_images_tag = "local"
countryconfig_image_name="opencrvs/ocrvs-countryconfig"
countryconfig_image_tag="develop"

load('ext://git_resource', 'git_checkout')
if not os.path.exists('../infrastructure'):
    # FIXME: Replace ocrvs-10672 to develop after testing
    git_checkout('git@github.com:opencrvs/infrastructure.git#ocrvs-10672', '../infrastructure')
if not os.path.exists('../infrastructure/tilt/opencrvs.tilt'):
  fail('Something went wrong while cloning infrastructure repository!')
load('../infrastructure/tilt/opencrvs.tilt', 'setup_opencrvs')

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


setup_opencrvs(
    infrastructure_path='../infrastructure',
    core_images_tag=core_images_tag,
    countryconfig_image_name=countryconfig_image_name,
    countryconfig_image_tag=countryconfig_image_tag,
)

print("✅ Tiltfile configuration loaded successfully.")
