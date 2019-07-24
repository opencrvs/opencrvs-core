# OpenCRVS server setup

This folder contains script to setup a new set of servers for OpenCRVS. It sets up docker swarm and configures the servers to prepare them for a deployment for OpenCRVS.

Ansible is required to run the server setup. This should be installed on your local machine. Also ensure that you have ssh access with the root user to all the server that you are trying to configure.

Run the configuration script with:

```
ansible-playbook -i <inventory_file> playbook.yml -e "dockerhub_username=your_username dockerhub_password=your_password"
```

Replace <inventory_file> with the correct inventory file and use `-k` option if you need supply an ssh password. These files contain the list of servers which are to be configured. If you are setting up a new set of servers, you will need to create a new file. Some files have been provide for the QA and staging environments.

Once this command is finished the servers are now prepared for an OpenCRVS deployment.

Before the deployment can be done a few secrets need to be manually added to the docker swarm:

ssh into the leader manager and run the following, replacing the values with the actual secrets:

```
printf "<clickatell-user>" | docker secret create clickatell-user -
printf "<clickatell-password>" | docker secret create clickatell-password -
printf "<clickatell-api-id>" | docker secret create clickatell-api-id -

printf "<infobip-gateway-endpoint>" | docker secret create infobip-gateway-endpoint -
printf "<infobip-api-key>" | docker secret create infobip-api-key -
```

After creating the secrets make sure the commands are removed from the shell history

Also, if you can't ssh into the manager as root you will need to add your ssh user to be able to run docker commands:

```
sudo groupadd docker
sudo usermod -aG docker $USER
```

Note: the Ansible script will install the UFW firewall, however, Docker manages it's own iptables. This means that even if there are UFW rules to block certain ports these will be overridden for ports where Docker is publishing a container port. Ensure only the necessary ports are published via the docker-compose files. Only the necessary ports are published by default, however, you may want to check this when doing security audits.

Now, from the root folder of the repository run the deployment as follows:

```
yarn deploy <server_hostname> <version>
```

Version can be any git commit hash, git tag or 'latest'
