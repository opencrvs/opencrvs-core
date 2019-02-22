DIR=$(cd "$(dirname "$0")"; pwd)
echo "Working dir: $DIR"

docker run --rm -v $DIR/backups:/backups --network=opencrvs_overlay_net mongo:3.6 bash \
 -c 'mongodump --host mongo -d hearth-dev --gzip --archive=/backups/hearth-dev.gz'

docker run --rm -v $DIR/backups:/backups --network=opencrvs_overlay_net mongo:3.6 bash \
 -c 'mongodump --host mongo -d openhim-dev --gzip --archive=/backups/openhim-dev.gz'

docker run --rm -v $DIR/backups:/backups --network=opencrvs_overlay_net mongo:3.6 bash \
 -c 'mongodump --host mongo -d user-mgnt --gzip --archive=/backups/user-mgnt.gz'
