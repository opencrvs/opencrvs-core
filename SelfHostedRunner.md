# Preparing Self Hosted Runner

Install github runner on the machine as per the guide line & make it a service. The workflow expects `ROOT_PASSWORD` variable to be set on the github secret. Execute following commands to prepare the VM/Runner machine.

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
echo vm.max_map_count=262144 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

Install nvm & use nvm to install node.js

```
sudo apt install curl
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
```

You might need to reload your terminal session to have nvm. Once you do install node using:

```
nvm install 14.17.0
```

Install docker & make it permissible for the non root user also

```
sudo apt install docker docker-compose
sudo usermod -aG docker $USER
```

Install screen

```
sudo apt install screen
```

Install yarn & wait-on globally

```
npm install -g yarn wait-on
```

FYI: Best if we run `yarn compose:deps` once manually.

Optionally you might have to install following dependencies:

```
sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb
```
