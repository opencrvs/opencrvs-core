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
echo ":::::::: In the terminal on the bottom left, OpenCRVS is starting. ::::::::"
echo
echo ":::::::: In the terminal on the bottom right, an OpenCRVS country config will start when OpenCRVS core is running ::::::::"
echo
echo "Please be patient as this can still take 10 minutes if your RAM isnt high."
echo
echo ":::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::"
echo
echo "wait-on Zambia country configuration server tcp:3040" && wait-on -l tcp:3040
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

echo "::::::::::::::::::::::::: HOW TO QUIT THIS SETUP :::::::::::::::::::::::::"
echo
echo ":::::::::::::::::::: These windows are tmux sessions. ::::::::::::::::::::"
echo ":::::::::::::: tmux allows us to manage multiple terminals. ::::::::::::::"
echo "::::::::: To quit, core and Zambia: type Ctrl+C in each terminal. :::::::::"
echo ":::::::::::::::: To exit tmux, type: exit in each terminal ::::::::::::::::"
echo
