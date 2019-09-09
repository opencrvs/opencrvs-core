set -e

print_usage_and_exit () {
    echo 'Usage: ./restore-metadata.sh bgd|zmb'
    echo "Script must receive a parameter of 'bgd' or 'zmb' set  as a supported alpha-3 country code e.g.: ./restore-metadata.sh bgd"
    exit 1
}

if [ -z "$1" ] || { [ $1 != 'bgd' ] && [ $1 != 'zmb' ] ;} ; then
    echo 'Error: Argument for country is required in position 1.'
    print_usage_and_exit
fi

COUNTRY=$1
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

docker run --rm -v $DIR/src/$1/backups:/src/$1/backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/src/$1/backups/hearth-dev.gz"

docker run --rm -v $DIR/src/$1/backups:/src/$1/backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/src/$1/backups/openhim-dev.gz"

docker run --rm -v $DIR/src/$1/backups:/src/$1/backups --network=$NETWORK mongo:3.6 bash \
 -c "mongorestore --host $HOST --drop --gzip --archive=/src/$1/backups/user-mgnt.gz"
