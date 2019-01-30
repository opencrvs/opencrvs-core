docker run -it -v `pwd`/infrastructure/backups:/backups --network=\"ocrvs_default\" mongo:3.6 bash \
 -c 'mongorestore --host mongo --drop --gzip --archive=/backups/hearth-dev.gz'

docker run -it -v `pwd`/infrastructure/backups:/backups --network=\"ocrvs_default\" mongo:3.6 bash \
 -c 'mongorestore --host mongo --drop --gzip --archive=/backups/openhim-dev.gz'

docker run -it -v `pwd`/infrastructure/backups:/backups --network=\"ocrvs_default\" mongo:3.6 bash \
 -c 'mongorestore --host mongo --drop --gzip --archive=/backups/user-mgnt.gz'