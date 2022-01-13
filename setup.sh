# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.
set -e

export LANGUAGES='en'
do_version_check() {

   if [ "$1" == "$2" ] ; then
    echo "SAME"
    return "$?"
  fi
   ver1front=`echo $1 | cut -d "." -f -1`
   ver1back=`echo $1 | cut -d "." -f 2-`

   ver2front=`echo $2 | cut -d "." -f -1`
   ver2back=`echo $2 | cut -d "." -f 2-`

   if [ "$ver1front" != "$1" ] || [ "$ver2front" != "$2" ]; then
       if [ "$ver1front" -gt "$ver2front" ] ; then
        echo "GREATER"
        return "$?"
      fi
       if [ "$ver1front" -lt "$ver2front" ] ; then
        echo "LOWER"
        return "$?"
      fi


       [ "$ver1front" == "$1" ] || [ -z "$ver1back" ] && ver1back=0
       [ "$ver2front" == "$2" ] || [ -z "$ver2back" ] && ver2back=0
       do_version_check "$ver1back" "$ver2back"
       return "$?"
   else
      if [ "$1" -gt "$2" ] ; then
        echo "GREATER"
         return "$?"
      else
         echo "LOWER"
         return "$?"
      fi
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
echo ":::::::::::::::::::::::::::: INSTALLING OPEN CRVS ::::::::::::::::::::::::::::"
echo "::::::::::::::::::::: INTERNET CONNECTIVITY IS REQUIRED :::::::::::::::::::::"
echo
echo ":::::::::::::::::: THIS PROCESS CAN TAKE 15 MINUTES OR MORE ::::::::::::::::::"
echo ":::::::::::::::: PLEASE WAIT FOR THE OPEN CRVS LOGO TO APPEAR ::::::::::::::::"
echo
sleep 5

  echo ":::::::::::::::::::::: Checking your operating system ::::::::::::::::::::::"
  echo
#sleep 1
if [  -n "$(uname -a | grep Ubuntu)" ]; then
  echo ":::::::::::::::: You are running Ubuntu.  Checking version ::::::::::::::::"
  echo
  #sleep 1
  OS="UBUNTU"
  ubuntuVersion="$(grep -oP 'VERSION_ID="\K[\d.]+' /etc/os-release)"
  ubuntuVersionTest=$(do_version_check $ubuntuVersion 18.04)
  if [ "$ubuntuVersionTest" == "LOWER" ] ; then
    echo "Sorry your Ubuntu version is not supported.  You must upgrade Ubuntu to 18.04 or 20.04"
    echo "Follow the instructions here: https://ubuntu.com/tutorials/upgrading-ubuntu-desktop#1-before-you-start"
    exit 1
  else
    echo -e "Your Ubuntu version: $ubuntuVersion is \033[32msupported!\033[0m :)"
    echo
    #sleep 1
    echo ":::::::: Setting memory requirements for file watch limit and ElasticSearch ::::::::"
    echo
    #sleep 1
    if grep -Fxq "fs.inotify.max_user_watches=524288" /etc/sysctl.conf ; then
        echo "File watch limit already meets requirements."
    else
        echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
    fi

    if grep -Fxq "vm.max_map_count=262144" /etc/sysctl.conf ; then
        echo "Max map count already meets requirements."
    else
        echo vm.max_map_count=262144 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
    fi

    echo
    if [  -n "$(google-chrome --version | grep Chrome)" ]; then
      echo -e "Chrome is \033[32minstalled!\033[0m :)"
      echo
    else
      echo ":::::::: The OpenCRVS client application is a progressive web application. ::::::::"
      echo "::::::::::::: It is best experienced using the Google Chrome browser. :::::::::::::"
      echo
      echo "We think that you do not have Chrome installed."
      echo ":::: We recommend that you install Google Chrome: https://www.google.com/chrome ::::"
      echo
    fi
  fi
elif [ "$(uname)" == "Darwin" ]; then
  echo "::::::::::::::::::::::::: You are running Mac OSX. :::::::::::::::::::::::::"
  echo
  OS="MAC"
  if [  -n "$(/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version | grep Chrome)" ]; then
    echo -e "Chrome is \033[32minstalled!\033[0m :)"
    echo
  else
    echo ":::::::: The OpenCRVS client application is a progressive web application. ::::::::"
    echo "::::::::::::: It is best experienced using the Google Chrome browser. :::::::::::::"
    echo
    echo "We think that you do not have Chrome installed, or it is not available on this path: "
    echo "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
    echo ":::: We recommend that you install Google Chrome: https://www.google.com/chrome ::::"
    echo
  fi
else
  echo "Sorry your operating system is not supported."
  echo "YOU MUST BE RUNNING A SUPPORTED OS: MAC or UBUNTU > 18.04"
  exit 1
fi

echo ":::::::: Checking that you have the required dependencies installed ::::::::"
echo
#sleep 1
dependencies=( "docker" "node" "yarn" "tmux")
if [ $OS == "UBUNTU" ]; then
  dependencies+=("docker-compose" "google-chrome")
fi
for i in "${dependencies[@]}"
do
   :
    if which $i >/dev/null; then

        echo -e "$i \033[32minstalled!\033[0m :)"

        sleep 1
    else
        echo -e "OpenCRVS thinks $i is not installed.\r"
        if [ $i == "docker" ] ; then
            if [ $OS == "UBUNTU" ]; then
                echo "You need to install Docker, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker installation."
                echo "Please follow the documentation here: https://docs.docker.com/engine/install/ubuntu/"
            else
                echo "You need to install Docker Desktop for Mac, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker installation."
                echo "Please follow the documentation here: https://docs.docker.com/desktop/mac/install/"
            fi
        fi
        if [ $i == "docker-compose" ] ; then
            if [ $OS == "UBUNTU" ]; then
                echo "You need to install Docker Compose, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker-compose installation."
                echo "Please follow the documentation here: https://docs.docker.com/compose/install/"
            else
                echo "You need to install Docker Desktop for Mac, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker installation."
                echo "Please follow the documentation here: https://docs.docker.com/desktop/mac/install/"
            fi
        fi
        if [ $i == "node" ] ; then
            echo "You need to install Node, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your node installation."
            echo "We recommend you install Node v.14.15.0, v14.15.4, 14.17.0 or v14.18.1 as this release has been tested on those versions."
            echo "There are various ways you can install Node.  The easiest way to get Node running with the version of your choice is using Node Version Manager."
            echo "Documentation is here: https://nodejs.org/en/download/package-manager/#nvm.  For example run:"
            echo "curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash"
            echo "Then use nvm to install the Node version of choice.  For example run:"
            echo "nvm install 14.17.0"
        fi
        if [ $i == "yarn" ] ; then
           echo "You need to install the Yarn Package Manager for Node."
           echo "The documentation is here: https://classic.yarnpkg.com/en/docs/install"
        fi
        if [ $i == "google-chrome" ] ; then
          echo ":::::::: The OpenCRVS client application is a progressive web application. ::::::::"
          echo "::::::::::::: It is best experienced using the Google Chrome browser. :::::::::::::"
          echo
          echo "We think that you do not have Chrome installed."
          echo ":::: We recommend that you install Google Chrome: https://www.google.com/chrome ::::"
          echo
        fi
        if [ $i == "tmux" ] ; then
          if [ $OS == "UBUNTU" ]; then
              echo "OpenCRVS requires multiple terminal windows open in order to run OpenCRVS Core alongside the default country configuration."
              echo "::::::::::::: We want to install the tool tmux to do this. :::::::::::::"
              echo
              echo "::::::::::::: Run this command: sudo apt-get install tmux :::::::::::::"
          else
              echo "OpenCRVS requires multiple terminal windows open in order to run OpenCRVS Core alongside the default country configuration."
              echo
              echo "We use the tool tmux to do this.  Please install it following the documentation here: https://github.com/tmux/tmux/wiki"
          fi
        fi
        echo
        echo "::::::::::::::: After $i is installed please try again :::::::::::::::"
        echo
        exit 1
    fi
done

echo
echo ":::::: NOW WE NEED TO CHECK THAT YOUR NODE VERSION IS SUPPORTED ::::::"
echo
#sleep 1
myNodeVersion=`echo "$(node -v)" | sed 's/v//'`
versionTest=$(do_version_check $myNodeVersion 14.15.0)
if [ "$versionTest" == "LOWER" ] ; then
  echo "Sorry your Node version is not supported.  You must upgrade Node to use a supported version."
  echo "We recommend you install Node v.14.15.0, v14.15.4, v14.17.0 or v14.18.1 as this release has been tested on those versions."
  echo "Documentation is here: https://nodejs.org/en/download/package-manager/#nvm"
  echo "Then use nvm to install the Node version of choice.  For example run:"
  echo "nvm install 14.17.0"
  exit 1
  else
    echo -e "Your Node version: $myNodeVersion is \033[32msupported!\033[0m :)"
    echo
fi

if [ $OS == "UBUNTU" ]; then
  echo
  echo "::::::::::::::::: Giving Docker user sudo privileges :::::::::::::::::"
  echo
  echo "::::::::::: Please enter your sudo password when prompted :::::::::::"
  echo
  sudo chmod 666 /var/run/docker.sock
  sudo usermod -aG docker $USER
fi

echo
echo ":::::::::::::::::::::: Initialising Docker Swarm ::::::::::::::::::::::"
echo
docker swarm init


echo
echo ":::::::::::::::::: Installing some Node dependencies ::::::::::::::::::"
echo
npm install -g wait-on
yarn install

echo "::::::::::::::::::::::: Creating some directories :::::::::::::::::::::::"
echo
echo "::::::::::::: Please enter your sudo password when prompted :::::::::::::"
echo
openssl genrsa -out .secrets/private-key.pem 2048 && openssl rsa -pubout -in .secrets/private-key.pem -out .secrets/public-key.pem
sudo mkdir -p data/elasticsearch
sudo chown -R 1000:1000 data/elasticsearch

echo ":::::::::::::::::::: Building OpenCRVS dependencies ::::::::::::::::::::"
echo
echo ":::::::::::::: This can take some time on slow connections ::::::::::::::"
echo
yarn compose:deps:detached
DOCKER_STARTED=1
echo "wait-on tcp:3447" && wait-on -l tcp:3447
echo "wait-on http://localhost:9200" && wait-on -l http://localhost:9200
echo "wait-on tcp:5001" && wait-on -l tcp:5001
echo "wait-on tcp:9200" && wait-on -l tcp:9200
echo "wait-on tcp:27017" && wait-on -l tcp:27017
echo "wait-on tcp:6379" && wait-on -l tcp:6379
echo "wait-on tcp:8086" && wait-on -l tcp:8086



set -- $(stty size) #$1=rows, $2=columns

#start a new session in dettached mode with resizable panes
tmux new-session -s opencrvs -n opencrvs -d -x "$2" -y "$(($1 - 1))"
TMUX_STARTED=1
tmux set -p @mytitle "opencrvs-core-working"
tmux send-keys -t opencrvs "bash setup/summary.sh" C-m
tmux split-window -v

if [ $OS == "UBUNTU" ]; then
  tmux send-keys -t opencrvs "LANGUAGES=en && yarn start" C-m
  else
  $MY_IP = $(hostname -I | cut -d' ' -f1)
  tmux send-keys -t opencrvs "LANGUAGES=en && LOCAL_IP=$MY_IP && yarn start" C-m
fi
tmux set -p @mytitle "opencrvs-core"
tmux split-window -h
tmux set -p @mytitle "opencrvs-zambia"
tmux send-keys -t opencrvs "bash setup/setup-resources.sh" C-m
tmux attach -t opencrvs

