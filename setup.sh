# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e

export LANGUAGES='en'

SETUP_DIR=$(cd "$(dirname "$0")"; pwd)

sleep_if_non_ci() {
  if [ "$CI" != "true" ]; then
    sleep $1
  fi
}

DOCKER_STARTED=0
TMUX_STARTED=0

trap ctrl_c INT

function ctrl_c() {
  if [ $DOCKER_STARTED == 1 ]; then
    docker stop $(docker ps -aq)
  fi
  if [ $TMUX_STARTED == 1 ]; then
    tmux kill-session -t opencrvs
  fi
  exit 1
}

echo
echo -e "\033[32m:::::::::::::::::::::::::::: INSTALLING OPEN CRVS ::::::::::::::::::::::::::::\033[0m"
echo -e "\033[32m::::::::::::::::::::: INTERNET CONNECTIVITY IS REQUIRED :::::::::::::::::::::\033[0m"

echo

# Retrieve 2-step verification to continue
#-----------------------------------------
function ask_yes_or_no() {
    read -p "$1 ([y]es or [N]o): "
    case $(echo $REPLY | tr '[A-Z]' '[a-z]') in
        y|yes) echo "yes" ;;
        *)     echo "no" ;;
    esac
}
if [[ "no" == $(ask_yes_or_no "OpenCRVS can ONLY run on Ubuntu, WSL or Mac OSX.  This is a ONE TIME USE ONLY setup command for OpenCRVS and resets OpenCRVS to factory settings.  If you have already successfully installed OpenCRVS, you should use 'pnpm dev' to start OpenCRVS again.  Type: no to exit.  If you want to continue, your OS must be Ubuntu or Mac and you must have at least 30 minutes available as the process cannot be interrupted.  You must also have at least 20GB of available disk space and at least 16GB of RAM.  Type: yes to continue.") ]]
then
    echo "Exiting OpenCRVS setup."
    exit 0
fi

echo
echo -e "\033[32m:::::::::::::::::: THIS PROCESS CAN TAKE 15 MINUTES OR MORE ::::::::::::::::::\033[0m"
echo
echo "We will check your dependencies, build docker images, load and configure OpenCRVS. It takes a long time so please be patient and do not quit this process."
echo
sleep_if_non_ci 5
echo "If we recognise that you have not installed a dependency correctly, we will display links to instructions you can follow on 3rd party websites. The links worked at the time of writing but may change. Please let us know on GitHub discussions if you encounter any broken links."
sleep_if_non_ci 5
echo
echo "Installing Docker and Node for example, is outside the scope of this script."
sleep_if_non_ci 10
echo
echo "OpenCRVS Core includes Testland, a reference country configuration in packages/testland. This script starts Testland together with Core.  To develop your own country configuration, run: npm create @opencrvs/countryconfig.  Then start Core with: pnpm dev --no-testland.  For more information, read https://documentation.opencrvs.org."

sleep_if_non_ci 10
echo
echo -e "\033[32m:::::::::::::::: PLEASE WAIT FOR THE OPEN CRVS LOGO TO APPEAR ::::::::::::::::\033[0m"
echo
sleep_if_non_ci 5

# Verify the development environment: a supported OS, the required tooling
# (Docker, Node, pnpm, tmux), Docker Compose and a supported Node version, and
# enable Corepack. Extracted into its own script so developers can run the same
# checks on their own at any time:
#   bash development-environment/check-environment.sh
# Sourced (not executed) so the OS / NODE_OPTIONS it detects carry into the
# setup steps below, and a failed check exits this script too.
source "$SETUP_DIR/development-environment/check-environment.sh"

###
#
# Stop docker containers
#
###

echo
echo -e "\033[32m:::::::::: Stopping any currently running Docker containers ::::::::::\033[0m"
echo
if [[ $(docker ps -aq) ]] ; then
  docker stop $(docker ps -aq)
  sleep_if_non_ci 5
fi
# Remove old containers so they don't reuse mounts to the deleted data/ dir
docker compose -p opencrvs -f docker-compose.deps.yml -f docker-compose.dev-deps.yml down --remove-orphans 2>/dev/null || true

echo
openCRVSPorts=(
  9200  # elasticsearch
  6379  # redis
  5432  # postgres
  3535  # rustfs-api
  3536  # rustfs-console
  4040  # auth
  7070  # gateway
  5555  # events
  9050  # documents
  3040  # testland
  3000  # client
  3020  # login
  2024  # mosip-api
  20240 # mosip-mock
  20260 # esignet-mock
)
for x in "${openCRVSPorts[@]}"
do
   :
    if lsof -nP -iTCP:$x -sTCP:LISTEN -iUDP:$x >/dev/null; then
      echo -e "❌ OpenCRVS thinks that port: $x is in use by another application.\r"
      echo "You need to find out which application is using this port and quit the application."
      echo "You can find out the application by running:"
      echo "lsof -nP -iTCP:$x -sTCP:LISTEN -iUDP:$x"
      exit 1
    else
        echo -e "✅ $x \033[32m port is available!\033[0m :)"
    fi
done

echo
echo -e "\033[32m:::::::::::::::::::::: Initialising Docker ::::::::::::::::::::::\033[0m"

echo

if [ $OS == "UBUNTU" ]; then
  echo
  echo -e "\033[32m::::::::::::::::: Giving Docker user sudo privileges :::::::::::::::::\033[0m"
  echo
  echo -e "\033[32m::::::::::: Please enter your sudo password when prompted :::::::::::\033[0m"
  echo
  sudo chmod 666 /var/run/docker.sock
  sudo usermod -aG docker $USER
fi


echo -e "\033[32m:::::::::::::::::: Installing some Node dependencies ::::::::::::::::::\033[0m"
echo
if [ $(which wait-on 2>/dev/null) ]; then
  echo -e "wait-on is \033[32minstalled!\033[0m :)"
else
  echo "wait-on not found"
  npm install -g wait-on
fi
pnpm install

echo -e "\033[32m:::::::::::::::::::::: Setting hooks path to .husky ::::::::::::::::::::::\033[0m"
echo
git config --local core.hooksPath .husky/

echo -e "\033[32m::::::::::::::::::::::: Creating some directories :::::::::::::::::::::::\033[0m"
echo
echo -e "\033[32m::::::::::::: Please enter your sudo password when prompted :::::::::::::\033[0m"
echo
if [ -d "data" ] ; then sudo rm -r data ; fi
mkdir -p .secrets
openssl genrsa -out .secrets/private-key.pem 2048 && openssl rsa -pubout -in .secrets/private-key.pem -out .secrets/public-key.pem
mkdir -p data/elasticsearch
chmod 775 data/elasticsearch

mkdir -p data/rustfs
# rustfs/rustfs runs as uid 10001, so the host directory must be world-writable
chmod 777 data/rustfs
mkdir -p data/postgres
chmod 775 data/postgres
mkdir -p data/backups
chmod 775 data/backups
# mosip-api keeps its record-only tokens in SQLite. better-sqlite3 does not
# create the directory itself.
mkdir -p data/sqlite
chmod 775 data/sqlite

echo -e "\033[32m:::::::::::::::::::: Building OpenCRVS dependencies ::::::::::::::::::::\033[0m"
echo
echo "This can take some time on slow connections.  Docker is downloading the ElasticSearch, Postgres, Redis and RustFS images.  Some of these are large files."
echo
if [ $OS == "MAC" ]; then
 export LOCAL_IP=host-gateway
fi
pnpm compose:deps:detached

# As this script is also used when setting up E2E tests,
# where we don't want to start the app in tmux. This script ends.
if [[ $CI == "true" ]]; then
 exit 0
fi

DOCKER_STARTED=1
echo "wait-on http://localhost:9200" && wait-on -l http://localhost:9200
echo "wait-on tcp:9200" && wait-on -l tcp:9200
echo "wait-on tcp:6379" && wait-on -l tcp:6379
echo "wait-on tcp:5432" && wait-on -l tcp:5432
echo "wait-on tcp:3535" && wait-on -l tcp:3535


set -- $(stty size) #$1=rows, $2=columns

#start a new session in dettached mode with resizable panes
tmux new-session -s opencrvs -n opencrvs -d -x "$2" -y "$(($1 - 1))"
TMUX_STARTED=1
if [ "$(uname)" == "Darwin" ]; then
  tmux set-environment NODE_OPTIONS "--dns-result-order=ipv4first"
fi
tmux set -p @mytitle "opencrvs-core-working"
tmux send-keys -t opencrvs "bash development-environment/summary.sh" C-m
tmux split-window -h -l '30%'
tmux send-keys -t opencrvs "LANGUAGES=en && pnpm start" C-m
tmux set -p @mytitle "opencrvs-core"
tmux setw -g mouse on
tmux attach -t opencrvs
