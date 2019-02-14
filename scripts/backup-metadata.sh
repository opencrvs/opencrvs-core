docker run -it -v `pwd`/infrastructure/backups:/backups --network=ocrvs_default mongo:3.6 bash \
 -c 'mongodump --host mongo -d hearth-dev --gzip --archive=/backups/hearth-dev.gz'

docker run -it -v `pwd`/infrastructure/backups:/backups --network=ocrvs_default mongo:3.6 bash \
 -c 'mongodump --host mongo -d openhim-dev --gzip --archive=/backups/openhim-dev.gz'

docker run -it -v `pwd`/infrastructure/backups:/backups --network=ocrvs_default mongo:3.6 bash \
 -c 'mongodump --host mongo -d user-mgnt --gzip --archive=/backups/user-mgnt.gz'
