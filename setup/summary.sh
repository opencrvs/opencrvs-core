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
echo -e "\033[32m:::::::: In the terminal on the bottom left, OpenCRVS is starting. ::::::::\033[0m"
echo
echo -e "\033[32m:::::::: In the terminal on the bottom right, an OpenCRVS country config will start when OpenCRVS core is running ::::::::\033[0m"
echo
echo "Please be patient as this can still take 15 minutes if your RAM isnt high."
echo "Please do not give up, you are nearly there.  This process cannot be interrupted."
echo
echo -e "\033[32m:::::::::::::::::::::::::::::: PLEASE WAIT ::::::::::::::::::::::::::::::\033[0m"
echo
echo "Waiting till everything is finished." && wait-on -l tcp:3040
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
