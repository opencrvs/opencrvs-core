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

echo
echo ":::::::::::::::::::::::::::: INSTALLING OPEN CRVS ::::::::::::::::::::::::::::"
echo
echo ":::::::::::::::: PLEASE WAIT FOR THE OPEN CRVS LOGO TO APPEAR ::::::::::::::::"
echo
#sleep 5

  echo ":::::::::::::::::::::: Checking your operating system ::::::::::::::::::::::"
  echo
#sleep 1
if [  -n "$(uname -a | grep Ubuntu)" ]; then
  echo ":::::::::::::::: You are running Ubuntu.  Checking version ::::::::::::::::"
  echo
  #sleep 1
  OS="UBUNTU"
  ubuntuVersion=`echo awk -F= '$1 == "VERSION_ID" {gsub(/"/, "", $2); print $2}' /etc/os-release`
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
    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
    echo vm.max_map_count=262144 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
    echo
    if [  -n "$(google-chrome --version | grep Chrome)" ]; then
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
dependencies=( "docker" "node" "yarn" )
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


echo
echo ":::::::::::::::::::::: Initialising Docker Swarm ::::::::::::::::::::::"
echo
docker swarm init

if [ $OS == "UBUNTU" ]; then
  echo
  echo "::::::::::::::::: Giving Docker user sudo privileges :::::::::::::::::"
  echo
  sudo usermod -aG docker $USER
fi

echo
echo ":::::::::::::::::: Installing some Node dependencies ::::::::::::::::::"
echo
npm install -g wait-on

echo
echo ":::::::::::::::::::::::::: Building OpenCRVS ::::::::::::::::::::::::::"
echo
echo ":::::::::::::: This can take some time on slow connections ::::::::::::::"
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
openssl genrsa -out .secrets/private-key.pem 2048 && openssl rsa -pubout -in .secrets/private-key.pem -out .secrets/public-key.pem
sudo mkdir -p data/elasticsearch
sudo chown -R 1000:1000 data/elasticsearch

echo ":::::::::::::::::::: Starting OpenCRVS dependencies ::::::::::::::::::::"
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
yarn compose:deps
echo "wait-on tcp:3447" && wait-on -l tcp:3447
echo "wait-on http://localhost:9200" && wait-on -l http://localhost:9200
echo "wait-on tcp:5001" && wait-on -l tcp:5001
echo "wait-on tcp:9200" && wait-on -l tcp:9200
echo "wait-on tcp:27017" && wait-on -l tcp:27017
echo "wait-on tcp:6379" && wait-on -l tcp:6379
echo "wait-on tcp:8086" && wait-on -l tcp:8086

echo
echo "::::::::::::::::::::::: Starting OpenCRVS Core :::::::::::::::::::::::"
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo

if [ $OS == "UBUNTU" ]; then
  LANGUAGES=en yarn start --silent
  else
  LOCAL_IP=$(hostname -I | cut -d' ' -f1)
  LANGUAGES=en yarn start --silent
fi
echo "wait-on tcp:4040" && wait-on -l tcp:4040
echo "wait-on http://localhost:3000" && wait-on -l http://localhost:3000
echo "wait-on http://localhost:3020" && wait-on -l http://localhost:3020
echo "wait-on tcp:3030" && wait-on -l tcp:3030
echo "wait-on tcp:2020" && wait-on -l tcp:2020
echo "wait-on tcp:7070" && wait-on -l tcp:7070
echo "wait-on tcp:5050" && wait-on -l tcp:5050
echo "wait-on tcp:9090" && wait-on -l tcp:9090
echo "wait-on tcp:1050" && wait-on -l tcp:1050


echo
echo "::::::::::::::: Cloning the Zambia Country Configuration :::::::::::::::"
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
git clone https://github.com/opencrvs/opencrvs-zambia.git
cd opencrvs-zambia
echo
echo ":::::::::::::::::::: Installing Zambia Configuration ::::::::::::::::::::"
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
yarn install
yarn db:clear:all
yarn db:backup:restore
echo
echo "::::::::::::::::::::: Starting Zambia Config Server :::::::::::::::::::::"
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
CERT_PUBLIC_KEY_PATH=./../.secrets/public-key.pem yarn start
wait-on -l tcp:3040
echo
echo -e "::::::::::::::::::::::::::: \033[32mCONGRATULATIONS!!\033[0m :::::::::::::::::::::::::::"
echo
echo "
                                            -=================================.
                                          -@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@-
  --                                                                       +@@-
.%@*                                                                       +@@-
:@@*                                                                       +@@-
:@@*                                                                       +@@-
:@@*                                                                       +@@-
:@@*                                                                       +@@-
:@@*                   .                                                   +@@-
:@@*               .*@@%@@*.   =@@%@@#.  -@@%%%%   =@@-  @@                +@@-
:@@*               %@-   -@%   =@*  *@+  -@*       =@@@= @@                +@@-
:@@*              :@%     %@:  =@@@@@#.  -@@@@@    =@**@+@@                +@@-
:@@*               %@=   =@%   =@*       -@*       =@* *@@@                +@@-
:@@*                +%@@@%+    =@*       -@@@@@@   =@*  +@@                +@@-
:@@*                                                                       +@=
:@@*
:@@*
:@@*
:@@*                 .-=-:     .----:     --    --.   :--:
:@@*               :%@*+*@%:   -@@**@@:   *@+  -@%   +@**@=
:@@*              .@@.   .-.   -@%-=%@-   .@@. %@:   +@#-.
:@@*              .@@          -@@*@@:     -@#+@+     :+#@#
:@@*               *@#-:-#@-   -@# =@%.     *@@%    .@%::%@.
:@@*                :+###+:    :#+  :#*     .##:     :+##*:
:@@*
:@@*
:@@*
:@@*
:@@*
:@@*
:@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%:
---------------------------------------------------------------------------
"
echo
echo "::::::::::::::::::::::: OpenCRVS IS READY TO DEMO. :::::::::::::::::::::::"

echo "::::::::::::::::::::::: OPEN THIS LINK IN CHROME: :::::::::::::::::::::::"
echo

echo -e "::::::::::::::::::::::::: \033[32mhttp://localhost:3020/\033[0m :::::::::::::::::::::::::"
echo

echo "::::::::::::::::::::::::::: Login Details are :::::::::::::::::::::::::::"
echo

echo ":::::: Field Agent role: Username: kalusha.bwalya - Password: test ::::::"
echo

echo "::: Registration Agent role: Username: felix.katongo - Password: test :::"
echo

echo "::::::: Registrar role: Username: kennedy.mweene - Password: test :::::::"
echo

echo "::::: Local System Admin: Username: emmanuel.mayuka - Password: test :::::"
echo

echo ":: National System Admin: Username: jonathan.campbell - Password: test ::"
echo

echo "::::::::: Demo Two Factor Authentication SMS access code: 000000 :::::::::"
echo
