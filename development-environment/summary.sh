# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
set -e
echo -e "\033[32m:::::::: In the terminal on the top right, OpenCRVS core is starting. ::::::::\033[0m"
echo
echo -e "\033[32m:::::::: In the terminal on the bottom right, an OpenCRVS country config will start when OpenCRVS core is running ::::::::\033[0m"
echo
echo "Please be patient as this can still take 15 minutes if your RAM isnt high."
echo "Please do not give up, you are nearly there.  This process cannot be interrupted."
echo
echo -e "\033[32m::::::::::::::::::::::::: PLEASE WAIT FOR THE LOGO :::::::::::::::::::::::::\033[0m"
echo
echo "Waiting till contry config server is running before seeding data." && wait-on -l tcp:3040
echo
yarn seed:dev
echo -e "






                      *###((#*                     (((###(.
                  ,##########(                    /##########/
                ,##############,                 (#############/
               (#################(            *#################(
              ,#############################(####################(
              /(#######################((#########################.
              /####################,        .(####################.
              /################(                /#################.
              /###############,                   ################.
              /##############*                     ###############.
              /##############,                     (##############.
              /##############/                    ,###############.
              /###############(                  .################.
              /#################/              .##################.
              /#####################/.     *(#####################.
              /(##################################################.
              ,######################/,..,/(#(###################/
               *#################              /################(
                 ##############                  *#############,
                   *#########(                    ,#########(
                       ./####,                     (###(,




\033[32m::::::::::::::::::::::::: OPENCRVS IS READY FOR USE :::::::::::::::::::::::::\033[0m
"
