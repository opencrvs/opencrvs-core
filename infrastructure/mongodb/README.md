# MongoDB How to

### How to create new production credentials for applications

1. Create a new user creation entry to `infrastructure/mongodb/docker-entrypoint-initdb.d/create-mongo-users.sh`. This file is run on fresh installations of OpenCRVS meaning that MongoDB directory is completely empty when the stack is started.

```sh
mongo <<EOF
  use my-new-database
  db.createUser({
    user: 'my-new-user',
    pwd: '$MY_SERVICE_MONGODB_PASSWORD',
    roles: [{ role: 'readWrite', db: 'my-new-database' }]
  })
EOF
```

Notice that `$MY_SERVICE_MONGODB_PASSWORD` needs to be defined in `deploy.sh`

```
MY_SERVICE_MONGODB_PASSWORD=`generate_password`
```

More information about running MongoDB commands can be found [here](https://hub.docker.com/_/mongo#:~:text=MONGO_INITDB_ROOT_USERNAME%20and%20MONGO_INITDB_ROOT_PASSWORD.-,Initializing%20a%20fresh%20instance,-When%20a%20container). On environments that are already deployed you want to either include the user creation to on-deploy script or add the user manually.

2. Add a command for rotating the password on each deploy to `infrastructure/mongodb/on-deploy.sh`. It should look something like this:

```
mongo $(mongo_credentials) --host $HOST <<EOF
  use my-new-database
  db.updateUser('my-new-user', {
    pwd: '$MY_SERVICE_MONGODB_PASSWORD'
  })
EOF
```

This command is meant to update the database user to use the new rotated password as `on-deploy.sh` gets run after you deploy.

3. Make sure you pass you newly created password to Docker Swarm in `deploy.sh`'s `docker_stack_deploy()` function.

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

Remember to update the variable also in `docker-compose.prod-deploy-3.yml` and `docker-compose.prod-deploy-5.yml`.
