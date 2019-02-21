docker run --rm --network=opencrvs_overlay_net mongo:3.6 mongo hearth-dev --host mongo --eval "db.dropDatabase()"

docker run --rm --network=opencrvs_overlay_net mongo:3.6 mongo openhim-dev --host mongo --eval "db.dropDatabase()"

docker run --rm --network=opencrvs_overlay_net mongo:3.6 mongo user-mgnt --host mongo --eval "db.dropDatabase()"

docker run --rm --network=opencrvs_overlay_net appropriate/curl curl -XDELETE 'http://elasticsearch:9200/*' -v
