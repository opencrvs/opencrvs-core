if [ "$DEV" = "true" ]; then
  HOST=mongo1
  NETWORK=opencrvs_default
  echo "Working in DEV mode"
else
  HOST=rs0/mongo1,mongo2,mongo3
  NETWORK=opencrvs_overlay_net
fi

docker run --rm --network=$NETWORK mongo:3.6 mongo hearth-dev --host $HOST --eval "db.dropDatabase()"

docker run --rm --network=$NETWORK mongo:3.6 mongo openhim-dev --host $HOST --eval "db.dropDatabase()"

docker run --rm --network=$NETWORK mongo:3.6 mongo user-mgnt --host $HOST --eval "db.dropDatabase()"

docker run --rm --network=$NETWORK appropriate/curl curl -XDELETE 'http://elasticsearch:9200/*' -v

docker run --rm --network=$NETWORK appropriate/curl curl -X POST 'http://influxdb:8086/query?db=ocrvs' --data-urlencode "q=DROP SERIES FROM /.*/" -v

