# OpenCRVS server setup

This folder contains script to setup a new set of servers for OpenCRVS. It sets up docker swarm and configures the servers to prepare them for a deployment for OpenCRVS.

Ansible is required to run the server setup. This should be installed on your local machine. Also ensure that you have ssh access with the root user to all the server that you are trying to configure.

Run the configuration script with:

```
ansible-playbook -i <inventory_file> playbook.yml -e "dockerhub_username=your_username dockerhub_password=your_password"
```

Replace <inventory_file> with the correct inventory file and use `-K` option if you need supply an ssh password (add ansible_password to inventory for each node). These files contain the list of servers which are to be configured. Use the `-b` option if your servers require sudo to perform the ansible tasks. If you are setting up a new set of servers, you will need to create a new file.

Once this command is finished the servers are now prepared for an OpenCRVS deployment.

Before the deployment can be done a few secrets need to be manually added to the docker swarm:

ssh into the leader manager and run the following, replacing the values with the actual secrets:

```
printf "<clickatell-user>" | docker secret create clickatell-user -
printf "<clickatell-password>" | docker secret create clickatell-password -
printf "<clickatell-api-id>" | docker secret create clickatell-api-id -

printf "<infobip-gateway-endpoint>" | docker secret create infobip-gateway-endpoint -
printf "<infobip-api-key>" | docker secret create infobip-api-key -
printf "<infobip-sender-id>" | docker secret create infobip-sender-id -
```

After creating the secrets make sure the commands are removed from the shell history

Also, if you can't ssh into the manager as root you will need to add your ssh user to be able to run docker commands:

```
sudo groupadd docker
sudo usermod -aG docker $USER
```

Note: the Ansible script will install the UFW firewall, however, Docker manages it's own iptables. This means that even if there are UFW rules to block certain ports these will be overridden for ports where Docker is publishing a container port. Ensure only the necessary ports are published via the docker-compose files. Only the necessary ports are published by default, however, you may want to check this when doing security audits.

Synthetic records will need to be created, enabling SSL and permanently directing the following subdomains for the Traefik SSL cert to be succcessfully generated:

api.<your_domain>
auth.<your_domain>
gateway.<your_domain>
login.<your_domain>
openhim.<your_domain>
openhim-api.<your_domain>
performance.<your_domain>
register.<your_domain>
resources.<your_domain>
styleguide.<your_domain>

Now, in the package.json file in the root folder of the repository, amend the deployment script appropriately:

```
"deploy": "SSH_USER=<<your_ssh_username>> SSH_HOST=<<your_swarm_manager_node_ip>> bash deploy.sh",
```

Then, run the deployment like so:

```
yarn deploy <<insert country code>> --clear-data=yes --restore-metadata=yes <<insert host domain e.g.: opencrvs.your_country.org>> <<insert version e.g.: latest>>
```

Version can be any git commit hash, git tag, dockerhub tag or 'latest'

## Enabling encryption

For production servers we offer the ability to setup an encrypted /data folder for the docker containers to use. This allows us to support encryption at rest. To do this run the ansible script with these extra variables. Note, if the server is already setup the docker stack must be stopped and ALL DATA WILL BE LOST when switching to an ecrypted folder. It is useful to set this up from the beginning.

```
ansible-playbook -i <inventory_file> playbook.yml -e "dockerhub_username=your_username dockerhub_password=your_password encrypt_passphrase=<a_strong_passphrase> encrypt_data=True"
```

## Enabling Mongo replica sets

Mongo is enabled with replica sets in order to provide backup in case a node fails. When the deploy script runs, the mongo-rs-init container waits 20s before trying to setup the replica set. If the mongo instances aren't up by then then there is a chance that the deployment will fail. You can recognise this by the following error in the opencrvs_mongo service logs `Unable to reach primary for set rs0`. Run `docker service ls` to see if the replicas have scaled or not. Running the following commands manually scales the replica set, and allows you to continue.

```
docker service scale opencrvs_mongo-rs-init=0
docker service scale opencrvs_mongo-rs-init=1
```
