DIR=$(cd "$(dirname "$0")"; pwd)
echo "Working dir: $DIR"

if [ "$DEV" = "true" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in DEV mode"
else
  HOST=rs0/mongo1,mongo2,mongo3
  NETWORK=opencrvs_overlay_net
fi

docker run --rm -v $DIR/backups:/backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/backups/hearth-dev.gz"

docker run --rm -v $DIR/backups:/backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/backups/openhim-dev.gz"

docker run --rm -v $DIR/backups:/backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/backups/user-mgnt.gz"
