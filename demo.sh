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



echo ":::::::::::::::::::::::::::: INSTALLING OPEN CRVS ::::::::::::::::::::::::::::"
echo ":::::::::::::::: PLEASE WAIT FOR THE OPEN CRVS LOGO TO APPEAR ::::::::::::::::"
echo "::::::::::::::::::: THIS CAN TAKE TIME ON SLOW CONNECTIONS :::::::::::::::::::"
echo
sleep 5
echo ":::::: FIRST WE NEED TO CHECK THAT YOU HAVE INSTALLED YOUR DEPENDENCIES ::::::"
sleep 1
echo ":::::::::: YOU MUST BE RUNNING A SUPPORTED OS: MAC or UBUNTU > 18.04 :::::::::"
echo ":::::::::::::::: YOU MUST HAVE NODE v14.15.0, YARN AND DOCKER ::::::::::::::::"

if [  -n "$(uname -a | grep Ubuntu)" ] && [ lsb_release -sr < 18.04 ] ; then
  echo "Sorry your Ubuntu version is not supported.  You must upgrade Ubuntu to 18.04 or 20.04"
  exit 1
fi
sleep 2
dependencies=( "docker" "yarn" "node" )
if [  -n "$(uname -a | grep Ubuntu)" ]; then
  dependencies+=("docker-compose")
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
            if [  -n "$(uname -a | grep Ubuntu)" ]; then
                echo "You need to install Docker, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker installation."
                echo "Please follow the documentation here: https://docs.docker.com/engine/install/ubuntu/"
            else
                echo "You need to install Docker Desktop for Mac, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker installation."
                echo "Please follow the documentation here: https://docs.docker.com/desktop/mac/install/"
            fi
        fi
        if [ $i == "docker-compose" ] ; then
            if [  -n "$(uname -a | grep Ubuntu)" ]; then
                echo "You need to install Docker Compose, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker-compose installation."
                echo "Please follow the documentation here: https://docs.docker.com/compose/install/"
            else
                echo "You need to install Docker Desktop for Mac, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker installation."
                echo "Please follow the documentation here: https://docs.docker.com/desktop/mac/install/"
            fi
        fi
        exit 1
    fi
done
# check dependencies installed
# check environment for correct commands
# check memory assigned
echo "

 ... some output ...

"

echo -e "Now my color changes to \033[32mGreen\033[0m"
#
# echo -e "\033[41;32m" # change background color and text
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
# yarn dev:secrets:gen && concurrently "yarn run start" "yarn run compose:deps"
