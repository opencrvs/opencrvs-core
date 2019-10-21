set -e
echo
echo "Rotating secrets - `date --iso-8601=ns`"

PRIV_KEY=$(openssl genrsa 2048 2>/dev/null)
PUB_KEY=$(echo "$PRIV_KEY" | openssl rsa -pubout 2>/dev/null)
UNIX_TS=$(date +%s)

echo "$PUB_KEY" | docker secret create jwt-public-key.$UNIX_TS -
echo "$PRIV_KEY" | docker secret create jwt-private-key.$UNIX_TS -

sed -i "s/{{ts}}/$UNIX_TS/g" "$@"
echo "DONE - `date --iso-8601=ns`"
echo
