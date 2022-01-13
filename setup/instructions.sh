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
echo
echo "All the dependencies have been installed and are running.  Now we are starting the microservices."
echo "We are building the client applications.  Building the client applications can take many minutes depending on your RAM."
echo "Please do not give up, you are nearly there.  This process cannot be interrupted."
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo "Waiting till everything is finished." && wait-on -l tcp:3040
echo
echo -e "\033[32m::::::::::::::::::::::::::: Login Details are :::::::::::::::::::::::::::\033[0m"
echo

echo -e "\033[32m:::::: Field Agent role: Username: kalusha.bwalya - Password: test ::::::\033[0m"
echo

echo -e "\033[32m::: Registration Agent role: Username: felix.katongo - Password: test :::\033[0m"
echo

echo -e "\033[32m::::::: Registrar role: Username: kennedy.mweene - Password: test :::::::\033[0m"
echo

echo -e "\033[32m::::: Local System Admin: Username: emmanuel.mayuka - Password: test :::::\033[0m"
echo

echo -e "\033[32m:: National System Admin: Username: jonathan.campbell - Password: test ::\033[0m"
echo

echo -e "\033[32m::::::::: Demo Two Factor Authentication SMS access code: 000000 :::::::::\033[0m"
echo

echo -e "\033[32m::::::::::::::::::::::::::: CONGRATULATIONS!! :::::::::::::::::::::::::::\033[0m"
echo
echo -e "\033[32m::::::::::::::::::::::: OpenCRVS IS READY TO DEMO. :::::::::::::::::::::::\033[0m"

echo -e "\033[32m::::::::::::::::::::::: OPEN THIS LINK IN CHROME: :::::::::::::::::::::::\033[0m"
echo

echo "http://localhost:3020/"
echo
echo -e "\033[32m::::::::::::::::::::::: Use the login details above ^ :::::::::::::::::::::::\033[0m"
echo


echo -e "\033[32m::::::::::::::::::::::::: HOW TO QUIT THIS SETUP :::::::::::::::::::::::::\033[0m"
echo
echo -e "\033[32m:::::::::::::::::::: These windows are tmux sessions. ::::::::::::::::::::\033[0m"
echo -e "\033[32m:::::::::::::: tmux allows us to manage multiple terminals. ::::::::::::::\033[0m"
echo -e "\033[32m::::::::: To quit, core and Zambia: type Ctrl+C in each terminal. :::::::::\033[0m"
echo -e "\033[32m:::::::::::::::: To exit tmux, type: exit in each terminal ::::::::::::::::\033[0m"
echo
