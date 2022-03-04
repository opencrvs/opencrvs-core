<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Setting up a hosting environment for deploying OpenCRVS](#setting-up-a-hosting-environment-for-deploying-opencrvs)
  - [How can I install and manage an OpenCRVS server cluster?](#how-can-i-install-and-manage-an-opencrvs-server-cluster)
    - [8 GB Memory (preferrably 16 GB) / 160 GB Disk / Ubuntu 18.04.3 (LTS) x64](#8-gb-memory-preferrably-16-gb--160-gb-disk--ubuntu-18043-lts-x64)
  - [How can I deploy to a staging environment cluster?](#how-can-i-deploy-to-a-staging-environment-cluster)
  - [How can I deploy to a QA environment cluster?](#how-can-i-deploy-to-a-qa-environment-cluster)
  - [How can I deploy to production?](#how-can-i-deploy-to-production)
  - [Enabling encryption](#enabling-encryption)
  - [Enabling Mongo replica sets](#enabling-mongo-replica-sets)
  - [Emergency Backup & Restore](#emergency-backup--restore)
  - [How to know when to scale a service](#how-to-know-when-to-scale-a-service)
  - [Some useful Docker and Docker Swarm commands](#some-useful-docker-and-docker-swarm-commands)
    - [To check the status of all running services](#to-check-the-status-of-all-running-services)
    - [To scale a service that hasn't started, in order to check for bugs](#to-scale-a-service-that-hasnt-started-in-order-to-check-for-bugs)
    - [You want to get all stack information and see if there are any errors](#you-want-to-get-all-stack-information-and-see-if-there-are-any-errors)
    - [To check the logs on a service](#to-check-the-logs-on-a-service)
    - [To check logs or access a specific container](#to-check-logs-or-access-a-specific-container)
    - [You need to check logs on the container](#you-need-to-check-logs-on-the-container)
    - [You need to run commands inside a container](#you-need-to-run-commands-inside-a-container)
    - [You need to inspect a container to see networking and all other information](#you-need-to-inspect-a-container-to-see-networking-and-all-other-information)
    - [You need to rollback the changes made to a service](#you-need-to-rollback-the-changes-made-to-a-service)
  - [Why Docker Swarm? ...and is there Kubernetes support?](#why-docker-swarm-and-is-there-kubernetes-support)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Setting up a hosting environment for deploying OpenCRVS

This README outlines the process to setup and deploy OpenCRVS on a remote server environment. The documentation is in progress and will be finalised for the public Beta release scheduled for June 2022.

### How can I install and manage an OpenCRVS server cluster?

OpenCRVS can be deployed on a cluster of 3 or 5 server nodes in production and 1 server node in a demo, staging or QA environment, each with the following minimm specification:

#### 8 GB Memory (preferrably 16 GB) / 160 GB Disk / Ubuntu 18.04.3 (LTS) x64

This folder contains scripts to setup the server nodes for OpenCRVS.

Ansible is required to run the server setup. This should be installed on your local machine. Also ensure that you have ssh access with the root user to all the servers that you are trying to configure.

Add your users GIT SSH keys to all nodes

```
curl https://github.com/<git-user>.keys >> ~/.ssh/authorized_keys
```

For production deployments of 3 or 5 servers, ensure the manager node can ssh into worker nodes (Required for automated backups)

SSH into manager node and create ssh key. Press Enter for defaults and no passphrase

```
ssh-keygen
```

Print the key for copying:

```
cat ~/.ssh/id_rsa.pub
```

Copy the key and SSH into worker nodes to add manager key into node authorised keys, and repeat for all workers

```
echo "<manager-node-public-key>" >> ~/.ssh/authorized_keys
```

Decide on the size of your deployment. OpenCRVS supports deploying to 1 server, but this is only supported for a testing, staging or a QA environment.

Alternatively OpenCRVS supports deploying to 3 servers creating Mongo replica sets for managing a production environment at a normal scale.

Finally OpenCRVS supports deploying to 5 servers creating Mongo replica sets for managing a production environment at a large scale.

These files contain the list of servers which are to be configured:

If you are only deploying to 1 server, you need to make a copy of the [example-1.ini](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/example-1.ini) file to run with the Ansible [playbook-1.yml](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/playbook-1.yml) explained below.

**Only 1 server is not supported for production deployments**

If you are deploying to a standard production deploymet of 3 servers, you need to make a copy of the [example-3.ini](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/example-3.ini) file to run with the Ansible [playbook-3.yml](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/playbook-3.yml) explained below.

If you are deploying to 5 servers, you need to make a copy of the [example-5.ini](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/example-5.ini) file to run with the Ansible [playbook-5.yml](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/playbook-5.yml) explained below.

Note: Add the ansible_password prop to the ini file of choice next to each worker IP for each node that requires an SSH password. Usually we recommend creating nodes that use SSH key access. Use `-K` option if you need supply an ssh password when running the playbook

Note: For automated daily external data backup to another server, you can pass optional parameters to the playbook of choice. This line in the playbook will set that up for you. Read about emergency backups below.

```
job: 'cd ~/ && bash /tmp/compose/infrastructure/emergency-backup-metadata.sh <ssh-user> <external-server-for-remote-backup-host> <ssh-port> <your-production-environment-manger-node-host> <path-to-encrypted-volume-on-external-server> <number-of-server-replicas-1-3-or-5> >> /var/log/opencrvs-backup.log 2>&1'
```

Run the [Ansible](https://www.ansible.com/) playbook configuration script of your choice from your client computer (You must have [Ansible](https://www.ansible.com/) installed, a [Dockerhub](https://hub.docker.com/) account & optionally a [Papertrail](https://www.papertrail.com/) account - leave "papertrail_token" variable undefined if you do not wish to use the logging service. We recommend you use an external Logging service to have live backup access to logs):

Use the `-b` option if your servers require sudo to perform the ansible tasks. If you are setting up a new set of servers, you will need to create a new file.

Ansible playbooks are run like this:

```
ansible-playbook -i <inventory_file> <playbook_file> -e "dockerhub_username=your_username dockerhub_password=your_password papertrail_token=your_papertrail_token external_backup_server_ip=your_external_backup_server_ip external_backup_server_user=your_external_backup_server_user external_backup_server_ssh_port=your_external_backup_server_ssh_port manager_production_server_ip=your_manager_production_server_ip external_backup_server_remote_directory=your_external_backup_server_remote_directory"
```

E.G.:

```
ansible-playbook -i example-3.ini playbook-3.yml -e "dockerhub_username=your_username dockerhub_password=your_password"
```

## Enabling encryption

For production servers we offer the ability to setup an encrypted /data folder for the docker containers to use. This allows us to support encryption at rest. To do this run the ansible script with these extra variables. Note, if the server is already setup the docker stack must be stopped and ALL DATA WILL BE LOST when switching to an ecrypted folder. It is useful to set this up from the beginning.

```
ansible-playbook -i <inventory_file> <playbook_file> -e "dockerhub_username=your_username dockerhub_password=your_password papertrail_token=your_papertrail_token encrypt_passphrase=<a_strong_passphrase> encrypt_data=True"
```

Once this command is finished the servers are now prepared for an OpenCRVS deployment.

Before the deployment can be done a few secrets need to be manually added to the docker swarm:

ssh into the manager server and run the following, replacing the values with the actual secrets:

```sh
# Create login credentials for Kibana Basic Auth
htpasswd -nb kibana-admin example-password
printf 'kibana-admin:$apr1$LFvoLjiD$j/33/z/rI9xrMFUiIC5rM.' | docker secret create kibana-htpasswd -
# For API integration mediators, allows API access to the OpenHIM
printf "<openhim-user>" | docker secret create openhim-user -
printf "<openhim-password>" | docker secret create openhim-password -
```

ssh into the manager server and run the following, replacing the following values with the actual secrets for your SMS provider of choice:

```sh
# In Zambia we have used Clickatell, we have found good Telco coverage in Africa with this provider
printf "<clickatell-user>" | docker secret create clickatell-user -
printf "<clickatell-password>" | docker secret create clickatell-password -
printf "<clickatell-api-id>" | docker secret create clickatell-api-id -

# For Bangladesh we used Infobip, we have found good Telco coverage in Asia with this provider
printf "<infobip-gateway-endpoint>" | docker secret create infobip-gateway-endpoint -
printf "<infobip-api-key>" | docker secret create infobip-api-key -
printf "<infobip-sender-id>" | docker secret create infobip-sender-id -

```

After creating the secrets make sure the commands are removed from the shell history by running `history -c`

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
register.<your_domain>
countryconfig.<your_domain>
config.<your_domain>
styleguide.<your_domain>
monitor.<your_domain>
webhooks.<your_domain>

Then, run the deployment using the example deploy commands in the root [package.json](https://github.com/opencrvs/opencrvs-core/blob/master/package.json) depending on your needs:

The commands are like this:

Deploys to a staging environment, clearing and restoring all data every time:

"deploy:staging": "bash deploy.sh --clear-data=yes --restore-metadata=yes --update-metadata=no development"

Deploys to a qa or production environment, without clearing any data. On production, SMS 2FA codes are used so an SMS provider must have been configured.

"deploy:qa": "bash deploy.sh --clear-data=no --restore-metadata=no --update-metadata=no qa"
"deploy:prod": "bash deploy.sh --clear-data=no --restore-metadata=no --update-metadata=no production"

You must add some variables to the end of the script like this:

HOST is the server to deploy to'
VERSION can be any OpenCRVS Core docker image tag or 'latest'
COUNTRY_CONFIG_VERSION can be any OpenCRVS Country Configuration docker image tag or 'latest': e.g.: **7b994cd** for [OpenCRVS - Alpha 3.1](https://github.com/opencrvs/opencrvs-core/releases)
COUNTRY_CONFIG_PATH directory path to where your country configuration repository is locally checked out
REPLICAS number of supported servers. Can be 1, 3 or 5

E.G.:

```
yarn deploy:qa farajaland-qa.opencrvs.org 7b994cd 88a5a83 opencrvs-farajaland 1
```

## Emergency Backup & Restore

Every day OpenCRVS automatically backs up all databases to the following directories on the manager node.
Every 7 days the data is overwritten to save disk space.

These files can be automatically backed up to an external server, provisioned during the Ansible command above as a noted option.

Servers can be stolen, so we highly recommend that once a week, these files should be saved to a
password protected and encrypted external harddrive and stored in a secure and approved location.

Hearth, OpenHIM and the other databases are saved in mongo .gz zip files here:

```
/data/backups/mongo/hearth-dev-<date>.gz
/data/backups/mongo/openhim-dev-<date>.gz
/data/backups/mongo/user-mgnt-<date>.gz
/data/backups/mongo/application-config-<date>.gz
```

Elasticsearch snapshot files and indices are saved here:

```
/data/backups/elasticsearch
```

InfluxDB backup files are saved here:

```
/data/backups/influxdb/<date>
```

To perform a restore, ensure that you have backup files in the day's folders you wish to restore from.

Backup files:

The Hearth, OpenHIM and User db backup zips you would like to restore from: hearth-dev-{date}.gz, openhim-dev-{date}.gz and user-mgnt-{date}.gz must exist in /data/backups/mongo/{date} folder
The Elasticsearch backup folder /data/backups/elasticsearch must exist with all previous snapshots and indices. All files are required
The InfluxDB backup files must exist in the /data/backups/influxdb/{date} folder

1. SSH into the manager node
2. Make sure you are a root user
3. cd to the /tmp/compose/infrastructure directory

Run the following script as root but beware that **ALL DATA WILL BE REPLACED BY YOUR BACKUP DATA**

```
./emergency-restore-metadata.sh <day of the week to restore from> <number of server replicas: 1 3 or 5>
```

## How to know when to scale a service

OpenCRVS uses the [Kibana](https://www.elastic.co/kibana) tool for server and container monitoring. This would be your first stop to determine how your servers are operating and if they are keeping up with the load.

Access Kibana by visiting: https://kibana.<your_domain>

In the top left you will see a dropdown. From here you may select each of the servers in your swarm. The first step you should take is to determine if any/all of the servers are at capacity. Thing you should look for include:

- A constantly maxed out CPU percentage or load number
- If IOWAIT is constantly high your disks are becoming a bottleneck
- Check RAM usage to make sure the server isn't paging (linux systems always try use as much RAM as possible, what you are looking for is high number with almost no caching)
- Check if Netadata has any active alarms on any of the servers

If all of the server are running at capacity you might need to add more servers to the swarm. If just a few are at capacity then you should try to figure out which containers are using the most resources and scale those out so other server may take the load.

To do this, first check the 'Applications' section in Netdata and see if it really is the containers using up system resources, it could be another rouge process.

Next, go through each of the docker containers listed on the menu on the left in Netdata. Try to find which one is using the majority of the resources. Look for constantly high CPU or Disk usage. If you find a culprit you may increase the number of replicas of that service using:

```
docker service scale <service name e.g.: "opencrvs_workflow">=5
```

After this is done, watch Netdata and ensure that the change was effective and ensure there aren't any other services that are also at capacity. In some cases the only answer may be to [add additional servers to the docker swarm](https://docs.docker.com/engine/swarm/swarm-tutorial/add-nodes/). To get tasks to move to the new server you can scale down certain service and scale them back up again or you can [force a rebalance](https://docs.docker.com/engine/swarm/admin_guide/#force-the-swarm-to-rebalance) which may lead to so down time.

You may want to [setup notifications](https://docs.netdata.cloud/health/notifications/) in Netdata as well so that you may be notified of any alarms on the servers.

## Some useful Docker and Docker Swarm commands

The following docker commands are helpful when managing OpenCRVS and debugging infrastructure issues

### To check the status of all running services

```
docker service ls
```

### To scale a service that hasn't started, in order to check for bugs

```
docker service scale <service name e.g.: "opencrvs_metrics">=1
```

### You want to get all stack information and see if there are any errors

docker stack ps opencrvs —no-trunc

### To check the logs on a service

```
docker service logs <service name e.g.: "opencrvs_metrics">
```

### To check logs or access a specific container

You need to check Docker swarm for the id of the containers running mongo, elasticsearch or resources in order to access
To find which node hosts the container you are looking for, run this command on the manager node.

```
docker stack ps -f "desired-state=running" opencrvs
```

After running the previous command to discover which node is running a container, SSH into the right node and run the following to get the container id

```
docker ps
```

### You need to check logs on the container

```
docker logs -f <container id e.g. "opencrvs_user-mgnt.1.t0178z73i4tjcll68a7r72enu">
```

### You need to run commands inside a container

```
docker exec -it <container-id> <command e.g. "ls", "mongo", "printenv", "influxd">
```

Running

```
netstat -plant
```

Inside a container will tell you which ports are open and listening

### You need to inspect a container to see networking and all other information

```
docker ps # to get the container id
docker inspect <container id e.g. "opencrvs_user-mgnt.1.t0178z73i4tjcll68a7r72enu">
```

### You need to rollback the changes made to a service

docker service rollback opencrvs_user-mgnt

## Why Docker Swarm? ...and is there Kubernetes support?

[Docker Swarm](https://docs.docker.com/engine/swarm/) was chosen for it's simplicity, so that previously unskilled system administrators can quickly up-skill in the techniques of private and public cloud infrastructure management. We wanted to democratise the containerisation benefits of AWS/Kubernetes style public cloud deployments for developing nations.

Some nations may be located far from a developed world datacentre. Many nations may not be able to legally support international data storage of citizen data. Often getting the legal approval requires regulatory change which obviously can take some time. In the short term, these nations may not have access to the development skills necessary to manage a complicated distributed cloud deployment, so ease-of-use is paramount.

Docker Swarm makes it easy to commence service distribution privately and then migrate publically when an organisation is ready to do so. Docker Swarm automatically configures a "round robin" load balanced cluster, and provides Service Discovery out-the-box.

We are working on a [Kubernetes](https://kubernetes.io/) Software-As-A-Service solution, so that smaller nations can hand over system administration to a 3rd party to manage solely in the public cloud, if these nations can get regulatory approval.

<br>
