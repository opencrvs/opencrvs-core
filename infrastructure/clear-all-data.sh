docker run --rm -it --network=ocrvs_default mongo:3.6 mongo hearth-dev --host mongo --eval "db.dropDatabase()"

docker run --rm -it --network=ocrvs_default mongo:3.6 mongo openhim-dev --host mongo --eval "db.dropDatabase()"

docker run --rm -it --network=ocrvs_default mongo:3.6 mongo user-mgnt --host mongo --eval "db.dropDatabase()"

docker run --rm -it --network=ocrvs_default appropriate/curl curl -XDELETE 'http://elasticsearch:9200/*' -v
