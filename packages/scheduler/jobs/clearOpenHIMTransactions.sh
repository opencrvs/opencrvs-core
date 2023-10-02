#!/bin/bash

echo 'Clearing OpenHIM transactions older than 30 days...'
mongo $OPENHIM_MONGO_URL --eval 'db.transactions.deleteMany({"request.timestamp": {$lt: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000))}})'
