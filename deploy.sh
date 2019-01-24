HOST=${1:-opencrvs-staging.jembi.org}
VERSION=${2:-latest}

echo "\nDeploying version $VERSION to $HOST...\n"

# Copy all infrastructure files to the server
rsync -rP docker-compose* infrastructure root@$HOST:/tmp/compose/

# Prepare docker-compose.staging.yml file - rotate secrets etc
ssh root@$HOST '/tmp/compose/infrastructure/rotate-secrets.sh /tmp/compose/docker-compose.staging.yml | tee -a /var/log/rotate-secrets.log'

# Setup configuration files and compose file for the deployment domain
ssh root@$HOST '/tmp/compose/infrastructure/setup-deploy-config.sh '$HOST' | tee -a /var/log/setup-deploy-config.log'

# Deploy the OpenCRVS stack onto the swarm
ssh root@$HOST 'cd /tmp/compose && VERSION='$VERSION' docker stack deploy -c docker-compose.deps.yml -c docker-compose.yml -c docker-compose.staging.yml --with-registry-auth opencrvs'
