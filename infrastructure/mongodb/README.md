# MongoDB How to

### How to create new mongo database production credentials for services

1. Create a new Mongo user creation or updation entry block in `infrastructure/mongodb/on-deploy.sh`. This file is run on fresh deployments of OpenCRVS

```
CONFIG_USER=$(echo $(checkIfUserExists "config"))
if [[ $CONFIG_USER != *"FOUND"* ]]; then
  echo "config user not found"
  mongo <<EOF
  use application-config
  db.createUser({
    user: 'config',
    pwd: '$CONFIG_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'application-config' }]
  })
EOF
else
  echo "config user exists"
  mongo $(mongo_credentials) --host $HOST <<EOF
  use application-config
  db.updateUser('config', {
    pwd: '$CONFIG_MONGODB_PASSWORD'
  })
EOF
fi
```

Notice that `$MY_SERVICE_MONGODB_PASSWORD` needs to be defined in `deploy.sh`

```
MY_SERVICE_MONGODB_PASSWORD=`generate_password`
```

More information about running MongoDB commands can be found [here](https://hub.docker.com/_/mongo#:~:text=MONGO_INITDB_ROOT_USERNAME%20and%20MONGO_INITDB_ROOT_PASSWORD.-,Initializing%20a%20fresh%20instance,-When%20a%20container).

2. Make sure you pass your newly created password to Docker Swarm in `deploy.sh`'s `docker_stack_deploy()` function.

```sh
MY_SERVICE_MONGODB_PASSWORD='$MY_SERVICE_MONGODB_PASSWORD' \
docker stack deploy -c docker-compose.deps.yml -c docker-compose.yml ...
```

4. Configure your service's MONGO_URL to include the credentials

```yml
my-new-service:
  environment:
    - MONGO_URL=mongodb://my-new-user:${MY_SERVICE_MONGODB_PASSWORD}@mongo1/webhooks?replicaSet=rs0
```

Remember to update the variable also in `docker-compose.deploy.yml` and `docker-compose.replicas-3.yml` and `docker-compose.replicas-5.yml`.
