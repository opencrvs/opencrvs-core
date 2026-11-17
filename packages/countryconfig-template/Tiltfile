##########################################################################
# Tiltfile: OpenCRVS Country config developer
# For more information about variables, please check:
# https://github.com/opencrvs/infrastructure/blob/develop/Tiltfile

# OpenCRVS core images tag:
core_images_tag = os.getenv("OPENCRVS_CORE_IMAGE_TAG", "v2.1.0")

core_ref = os.getenv("OPENCRVS_CORE_REF", "release/2.1.0")

# Build countryconfig image in local registry (use any name and tag you want)
countryconfig_image_name="opencrvs/ocrvs-countryconfig"
countryconfig_image_tag="local"


# Internal variable for helm charts checkout
core_charts_dir = ".opencrvs-core-charts"

core_repo_url = 'https://github.com/opencrvs/opencrvs-core.git'

# Tilt re-evaluates this file on every reload, so clone only once per ref.
# Delete the directory (or change OPENCRVS_CORE_REF) to fetch the charts again.
core_charts_marker = "{}/.tilt-ref-{}".format(core_charts_dir, core_ref.replace("/", "_"))
if not os.path.exists(core_charts_marker):
  print("Cloning OpenCRVS Helm charts ({}) from {}...".format(core_ref, core_repo_url))
  # set -e and git -C: a failed clone must never leave git running in the country config repository
  local("""
    set -e
    rm -rf {core_charts_dir}
    git clone \
      --depth 1 \
      --filter=blob:none \
      --sparse \
      --branch {core_ref} \
      {core_repo_url} \
      {core_charts_dir}
    git -C {core_charts_dir} sparse-checkout set charts
    touch {core_charts_marker}
  """.format(
    core_ref=core_ref,
    core_charts_dir=core_charts_dir,
    core_repo_url=core_repo_url,
    core_charts_marker=core_charts_marker
  ))
else:
  print("Using OpenCRVS Helm charts ({}) from {}".format(core_ref, core_charts_dir))

if not os.path.exists('{core_charts_dir}/charts/dependencies'.format(core_charts_dir=core_charts_dir)) or not os.path.exists('{core_charts_dir}/charts/opencrvs-services'.format(core_charts_dir=core_charts_dir)):
  fail('Something went wrong while cloning infrastructure repository!')

load('./tilt/opencrvs.tilt', 'setup_opencrvs')

# FIXME: in future releases remove this check and require pnpm only, as yarn is deprecated
# Package manager follows the lockfile, so country configs still on yarn keep working
if os.path.exists('pnpm-lock.yaml'):
  package_manager = 'pnpm'
  startup_command = 'start:tilt'
  lockfile = 'pnpm-lock.yaml'
elif os.path.exists('yarn.lock'):
  package_manager = 'yarn'
  startup_command = 'start:prod'
  lockfile = 'yarn.lock'
else:
  fail('No pnpm-lock.yaml or yarn.lock found, install dependencies before running Tilt')

dependency_files = ['./' + lockfile]
if os.path.exists('.pnpmfile.cjs'):
  dependency_files.append('./.pnpmfile.cjs')

# Build countryconfig image
docker_build(
  "{0}:{1}".format(countryconfig_image_name, countryconfig_image_tag),
  ".",
  dockerfile="Dockerfile",
  network="host",
  entrypoint=[package_manager, startup_command],
  only=[
    './src',
    './package.json',
    './tsconfig.json',
    './Dockerfile'
  ] + dependency_files,
  live_update=[
    # Fallback to full rebuild if dependencies change
    fall_back_on(['package.json', lockfile, 'Dockerfile']),
    # Sync source code changes
    sync('./src', '/usr/src/app/src'),
  ]
)


# Build image with postgres and metabase assets
docker_build("{0}:{1}-assets".format(countryconfig_image_name, countryconfig_image_tag), ".",
              dockerfile="Dockerfile.assets",
              network="host",
              only=[
                'assets/metabase',
                'assets/postgres',
                'assets/deployment',
                'assets/elasticsearch',
                './Dockerfile.assets'
              ]
)

setup_opencrvs(
    opencrvs_chart_repo=core_charts_dir,
    core_images_tag=core_images_tag,
    countryconfig_image_name=countryconfig_image_name,
    countryconfig_image_tag=countryconfig_image_tag,
)

print("✅ Tiltfile configuration loaded successfully.")
