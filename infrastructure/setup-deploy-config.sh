set -e
echo
echo "Setting up deployment config for $1 - `date --iso-8601=ns`"

# Set hostname in traefik config
sed -i "s/{{hostname}}/$1/g" /tmp/compose/infrastructure/traefik.toml

# Set hostname in openhim-console config
sed -i "s/{{hostname}}/$1/g" /tmp/compose/infrastructure/openhim-console-config.staging.json

# Set hostname in webapp configs
sed -i "s/{{hostname}}/$1/g" /tmp/compose/infrastructure/register-config.js
sed -i "s/{{hostname}}/$1/g" /tmp/compose/infrastructure/login-config.js
sed -i "s/{{hostname}}/$1/g" /tmp/compose/infrastructure/performance-config.js

# Set hostname in compose file
sed -i "s/{{hostname}}/$1/g" /tmp/compose/docker-compose.staging.yml

echo "DONE - `date --iso-8601=ns`"
echo