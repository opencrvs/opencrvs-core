echo "Rotating secrets - `date --iso-8601=ns`"
PRIV_KEY=$(openssl genrsa 2048 2>/dev/null)
PUB_KEY=$(echo "$PRIV_KEY" | openssl rsa -pubout 2>/dev/null)

docker secret rm jwt-public-key
echo "$PUB_KEY" | docker secret create jwt-public-key -
docker secret rm jwt-private-key
echo "$PRIV_KEY" | docker secret create jwt-private-key -
echo "DONE - `date --iso-8601=ns`"
