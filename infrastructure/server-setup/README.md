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

This README outlines the process to setup and deploy OpenCRVS on a remote server environment.

### Decide on the size of your deployment

Decide on the size of your deployment. OpenCRVS supports deploying to 1 server, but this is only supported for a testing, staging or a QA environment.

Alternatively, OpenCRVS supports deploying to 3 servers creating Mongo replica sets for managing a production environment at a normal scale.

Finally, OpenCRVS supports deploying to 5 servers creating Mongo replica sets for managing a production environment at a large scale.

If you wish to enable an automated backup from production onto another server, you will need an additional server for this.

### Provision your IP addresses with SSH access

1. Using your hosting provider, setup 1, 3 or 5 Ubuntu server nodes with an additional backup server node should you require this option. OpenCRVS can be deployed on a cluster of 3 or 5 server nodes in production and 1 server node in a demo, staging or QA environment, each with the following minimm specification:

8 GB Memory (preferrably 16 GB) / 160 GB Disk / Ubuntu 18.04.3 (LTS) x64

2. Decide which of your IP addresses will be the **Manager Node** This server will be the manager in the Docker Swarm and the main server used to control load balancing.

3. Add your users GIT SSH keys to all nodes, and ensure that you take a note of each server's **hostname**

This is a handy command to copy any SSH keys you use on Git into a server's .ssh/authorized_keys file.

```
curl https://github.com/<git-user>.keys >> ~/.ssh/authorized_keys
```

4. For production deployments of 3 or 5 servers, or where you are provisioning a server backup, ensure the manager node can ssh into all the other worker and backup nodes.

SSH into manager node and create an ssh key. Press Enter for defaults and no passphrase

```
ssh-keygen
```

Print the key for copying:

```
cat ~/.ssh/id_rsa.pub
```

Copy the key and exit the manager node.

SSH into the 2 or 4 worker nodes to add the key into the .ssh/authorised_keys for all nodes

```
echo "<manager-node-public-key>" >> ~/.ssh/authorized_keys
```

If you are setting up a backup server, ensure that the manager node can ssh into that too. SSH into the backup node to add the key into its .ssh/authorised_keys file.

SSH into the manager, and confirm that you can SSH into all nodes from the manager.

You are now ready to exit all nodes and run the Ansible command from your local environment.

### Install Ansible to automate the dependency installation, firewall and optional backup

Ansible is required to run the server setup. Ansible is an IT automation tool and the script we provide will install all the dependencies onto your nodes and configure a secure firewall, open required ports and provision the optional automated backup of OpenCRVS for use in production.

Ansible should be installed on your local machine. Installation instructions are [here](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html). Also ensure that you have ssh access with the root user to all the servers that you are trying to configure.

1. Create an account on [Dockerhub](https://hub.docker.com/) as Ansible will require your username and password in order to login.

2. Duplicate the **example-X.ini** inventory_file of choice depending if you are deploying to 1, 3 or 5 servers.

If you are only deploying to 1 server, you need to make a copy of the [example-1.ini](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/example-1.ini) file to run with the Ansible [playbook-1.yml](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/playbook-1.yml) explained below.

**Only 1 server is not supported for production deployments**

If you are deploying to a standard production deploymet of 3 servers, you need to make a copy of the [example-3.ini](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/example-3.ini) file to run with the Ansible [playbook-3.yml](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/playbook-3.yml) explained below.

If you are deploying to 5 servers, you need to make a copy of the [example-5.ini](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/example-5.ini) file to run with the Ansible [playbook-5.yml](https://github.com/opencrvs/opencrvs-core/blob/master/infrastructure/server-setup/playbook-5.yml) explained below.

You will be required to uncomment some lines to enter the IP addresses and hostnames, e.g.:

```
;manager1 ansible_host="ENTER YOUR MANAGER HOST IP"
```

becomes:

```
manager1 ansible_host="159.223.11.243"
```

... and:

```
;data1_hostname=ENTER_HOSTNAME_1
```

becomes:

```
;data1_hostname=farajaland-staging
```

3. Using a strong password generator, such as [1Password](https://1password.com/) you should create and **safely store** a master mongo password and encrypt_passphrase along with an elasticsearch superuser password in order to prepare these required parameters. If you want to make use of the provided automated Github Actions for automated continuous deployment from your Git repo, you will need to set the same details as Github Action Secrets, so make sure that you save them for future use:

**Required parameters:**

Call the Ansible command below passing these required paramters.

dockerhub_username
dockerhub_password
mongodb_admin_username
mongodb_admin_password
elasticsearch_superuser_password
encrypt_passphrase

**Optional parameters:**

For the optional automated daily external data backup to another server, these parameters must be prepared. You can :

external_backup_server_ip
external_backup_server_user
external_backup_server_ssh_port
external_backup_server_remote_directory

If you have a [Papertrail](https://www.papertrail.com/) account, OpenCRVS can automatically export system logs to Loggly using this parameter:

papertrail_token

4. Ansible playbooks are run like this **at a minimum**:

If you are on the root directory of the opencrvs-core repository, navigate to the server-setup folder:

```
cd infrastructure/server-setup
```

Now you can run the playbook like this, substituting the paramters as required:

```
ansible-playbook -i <inventory_file> <playbook_file> -e " \
dockerhub_username=<your_username> \
dockerhub_password=<your_password> \
mongodb_admin_username=opencrvs-admin \
mongodb_admin_password=<secure password you generated> \
elasticsearch_superuser_password=<secure password you generated> \
encrypt_passphrase=<a_strong_passphrase> \
encrypt_data=True"
```

Or with all the possible **optional props**:

```
ansible-playbook -i <inventory_file> <playbook_file> -e " \
dockerhub_username=<your_username> \
dockerhub_password=<your_password> \
mongodb_admin_username=opencrvs-admin \
mongodb_admin_password=<secure password you generated> \
elasticsearch_superuser_password=<secure password you generated> \
encrypt_passphrase=<a_strong_passphrase> \
encrypt_data=True \
external_backup_server_ip=<your_external_backup_server_ip> \
external_backup_server_user=<your_external_backup_server_user> \
external_backup_server_ssh_port=<your_external_backup_server_ssh_port> \
manager_production_server_ip=<your_manager_production_server_ip> \
external_backup_server_remote_directory=<your_external_backup_server_remote_directory>"
```

Once this command is finished the servers are prepared for an OpenCRVS deployment. You can read more about the external backups in the **Emergency Backup & Restore** section

### Create Docker Secrets

Before the deployment can be done a few secrets need to be created and manually added to the docker swarm.
[Docker secrets](https://docs.docker.com/engine/swarm/secrets/) are used as a secure alternative to serving passwords in environment variables without using .env files

Using a strong password generator service such as [1Password](https://1password.com/) you should create and safely store the required passwords as you will need them regularly in other steps such as when populating your country configuration database.

**ssh into the manager server and run the following commands, replacing the values with the actual secrets:**

1. Running the following lines saves the login details to OpenHIM as Docker secrets. You will have created this password when setting up your country configuration. The username will likely be the default: root@openhim.org

```sh
printf "<openhim-user>" | docker secret create openhim-user -
printf "<openhim-password>" | docker secret create openhim-password -
```

2. The next secrets store the choice of SMS provider and connection details. Currently you can only choose between [Clickatell](https://www.clickatell.com/) and [Infobip](https://www.infobip.com/). In a future version of OpenCRVS, we intend to refactor out the entire notification microservice from core into the country configuration server so that you can choose any communication provider and method that you wish. Currently if you would like to set up a different provider we would really appreciate it if you open a pull request.

a) In your country configuration look at the file docker-compose.countryconfig.prod-deploy.yml file. You will notice that environment variables are passed to the notification service from this compose file. Set the choice of provider in the SMS_PROVIDER environment veriable. You can set the choice to be **clickatell** or **infobip**

```
- SMS_PROVIDER=infobip
```

b) Depending on your choice of provider, you need to set the following Docker secrets

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

Also note, if depending on your setup you can't ssh into the manager as **root** you will need to add your ssh user to Docker to be able to run docker commands:

```
sudo groupadd docker
sudo usermod -aG docker $USER
```

Note: the Ansible script will install the UFW firewall, however, Docker manages it's own iptables. This means that even if there are UFW rules to block certain ports these will be overridden for ports where Docker is publishing a container port. Ensure only the necessary ports are published via the docker-compose files. Only the necessary ports are published by default, however, you may want to check this when doing security audits.

### Set up an SMTP server for OpenCRVS monitoring alerts

We use [Elastalert](https://elastalert.readthedocs.io/en/latest/), in tandem with ElasticSearch and Kibana to monitor the health of the OpenCRVS stack in production. In order for OpenCRVS to alert your Technical System Administrator of any memory or hardware issues, we have set up email notifications as the Elastalert option. So you need to have an SMTP service available. [Google offers SMTP services for free](https://kinsta.com/blog/gmail-smtp-server/) linked to a Gmail account, but there are countless other paid for SMTP services such as [Mailchimp](https://mailchimp.com/). You will need to know your SMTP host, port, username and password. We have hardcoded the service to use SMTP SSL by default.

### Manage DNS for your chosen domain

Using your domain management system, A records will need to be created for all the services which are publicly exposed.

This also enables the Traefik SSL cert to be succcessfully generated. The SSL cert is signed by [LetsEncrypt](https://letsencrypt.org/) in the infrastructure/traefik.toml config file by default. If you wish to use a different SSL cert provider, you can amend the code there to do so.

Create A records for each of the following, with a TTL of 1 hour that forward the URL to your manager node's external IP address

<your_domain>
api.<your_domain>
auth.<your_domain>
config.<your_domain>
countryconfig.<your_domain>
gateway.<your_domain>
kibana.<your_domain>
login.<your_domain>
openhim-api.<your_domain>
openhim.<your_domain>
register.<your_domain>
webhooks.<your_domain>

### Run the deploy Github Ation

The best way to deploy OpenCRVS to your stack is by using our supplied Github Actions in the country configuration repo.

1. First you need to ensure that you set up at least one, or optionally all, of the following Git [environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment):

These environments allow you to provision different subdomains, secrets and optional deployment properties depending on your chosen deployment environment.

a) **staging** - A useful environment for developers, where the environment variable NODE_ENV is set to **development** and you can create test user accounts with a 6 zero "000000" 2FA code during login.

b) **qa** - A quality assurance/pseudo production environment for software testers, where the environment variable NODE_ENV is set to **procuction** and a secondary exception variable QA_ENV is set to **true**, so that you can create test user accounts with a 6 zero "000000" 2FA code during login but be able to test all other production features.

c) **production** - A live environment, where NODE_ENV is set to **production** & QA_ENV is set to **false**, SMS random 2FA is enabled.

2. You need to create the following [Github secrets](https://docs.github.com/en/codespaces/managing-codespaces-for-your-organization/managing-encrypted-secrets-for-your-repository-and-organization-for-codespaces) for the usernames and passwords you created earlier when provisioning the servers using Ansible, along with other secrets Github will use to SSH into your servers, set the Traefik SSL hostname, connect to [Dockerhub](https://hub.docker.com/) etc.

These secrets below can be set as global repository secrets in Github as they apply to all environments:

ELASTICSEARCH_SUPERUSER_PASSWORD
KIBANA_PASSWORD
KIBANA_USERNAME
MONGODB_ADMIN_PASSWORD
MONGODB_ADMIN_USER
DOCKER_USERNAME - Your [Dockerhub](https://hub.docker.com/) username
DOCKER_PASSWORD - Your [Dockerhub](https://hub.docker.com/) password
DOCKERHUB_ACCOUNT - The name of your Dockerhub account or organisation that forms the URL to your country config docker image before the slash. e.g: ocrvs
DOCKERHUB_REPO - The name of your Dockerhub repository .. the name of your country config docker image after the slash. e.g. opencrvs-farajaland
SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD

The following secrets likely change for each environment so they should be duplicated as environment secrets in Github

Github needs a [deployment SSH key](https://docs.github.com/en/developers/overview/managing-deploy-keys) to be enabled. FYI we use [this Github action](https://github.com/shimataro/ssh-key-action) to connect.

KNOWN_HOSTS - You will need a copy of the KNOWN_HOSTS line in **.ssh/known_hosts** relevant to the host domain name for your environment. This will have been generated using a test SSH connection using your key
SSH_KEY - Note: This is a copy of the **id_rsa** file for your deploy key ... Not the id_rsa.pub!
STAGING_DOMAIN or QA_DOMAIN or PRODUCTION_DOMAIN - the host **domain name** (without www!) for your environment. **You must make sure that you can ping this domain and that the ping resolves to your manager server's IP address.** If this does not resolve, there must be a problem with your A record configuration explained previously
REPLICAS - The number of replicas: **1, 3 or 5** depending on the setup introduced above.
FACTORY_RESET - For production, set to **no** as you do not want each deployment to factory reset OpenCRVS. This is a process which deletes any registrations or users made and restores reference data. For staging and qa, you can optionally set this to **yes** and OpenCRVS will reset on each deploy, deleting registratons and restoring all data. A useful option for developers and testers.

3. With these secrets the first Github action is set to automatically run on your country configuration repository whenever code is pushed to a branch named master, main or develop. This action will build and push your Docker image to Dockerhub. **The image will be tagged with the short Git commit hash. This is important to refer to and use in the next step.**

**Publish image to Dockerhub: .github/workflows/publish-to-dockerhub.yml**

4. When the previous action has completed, you can deploy to your server with this action.

a) You will be required to select the environment to deploy to.
b) You will be required to enter the short Git hash that is tagged in the OpenCRVS Core release of choice
c) You will be required to enter the short Git hash that is tagged in your country configuration image created by the previous "Publish image to Dockerhub" action

**Deploy: .github/workflows/deploy.yml.yml**

Once the deployment is complete, wait a couple of minutes before browsing to OpenCRVS as it can take a little while for the Docker images to start up. If this is your first deployment, wait about 15 minutes as Docker must download them first.

## Emergency Backup & Restore

Every day OpenCRVS automatically backs up all databases to the following directories on the manager node. Every 7 days the data is overwritten to save disk space.

These files can be automatically backed up to an external server, provisioned during the Ansible command above as a noted option.

We highly recommend that once a week, these files should be saved to a
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

In the top left you will see an expanding side navigation. In the menu you should navigate to Observability -> Metrics. From here you can see different observations (CPU load, memory usage, traffic) for each of your servers. The first step you should take is to determine if any/all of the servers are at capacity. Thing you should look for include:

- A constantly maxed out CPU percentage or load number
- If IOWAIT is constantly high your disks are becoming a bottleneck
- Check RAM usage to make sure the server isn't paging (linux systems always try use as much RAM as possible, what you are looking for is high number with almost no caching)
- Check if Kibana has any active alarms on any of the servers (Main menu -> Observability -> Alerts)

If all of the server are running at capacity you might need to add more servers to the swarm. If just a few are at capacity then you should try to figure out which containers are using the most resources and scale those out so other server may take the load.

To do this, navigate to Observability -> Metrics -> Inventory. By selecting Metric:`docker.cpu.total.pct` and Group by:`docker.container.labels.com_docker_swarm_service_name` you should be able to see all running services and the containers on each server. By hovering over the containers, you'll see basic system statistics for each container.

Next, go through each of the docker containers listed and try to find which one is using the majority of the resources. Look for constantly high CPU or Disk usage. If you find a culprit you may increase the number of replicas of that service using:

```
docker service scale <service name e.g.: "opencrvs_workflow">=5
```

After this is done, monitor the containers and ensure that the change was effective and ensure there aren't any other services that are also at capacity. In some cases the only answer may be to [add additional servers to the docker swarm](https://docs.docker.com/engine/swarm/swarm-tutorial/add-nodes/). To get tasks to move to the new server you can scale down certain service and scale them back up again or you can [force a rebalance](https://docs.docker.com/engine/swarm/admin_guide/#force-the-swarm-to-rebalance) which may lead to so down time.

Alert rules can be added by navigating to Observability -> Alerts -> Manage rules.

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
