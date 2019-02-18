DIR=`dirname $(readlink -f $0)`
echo "Working dir: $DIR"

docker run --rm -it -v $DIR/backups:/backups --network=ocrvs_default mongo:3.6 bash \
 -c 'mongorestore --host mongo --drop --gzip --archive=/backups/hearth-dev.gz'

docker run --rm -it -v $DIR/backups:/backups --network=ocrvs_default mongo:3.6 bash \
 -c 'mongorestore --host mongo --drop --gzip --archive=/backups/openhim-dev.gz'

docker run --rm -it -v $DIR/backups:/backups --network=ocrvs_default mongo:3.6 bash \
 -c 'mongorestore --host mongo --drop --gzip --archive=/backups/user-mgnt.gz'