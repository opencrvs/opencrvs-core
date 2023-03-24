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
DIR=$(cd "$(dirname "$0")"; pwd)

export LANGUAGES="en,fr"
export LOG_LEVEL="error"

export NATIONAL_ID_OIDP_CLIENT_ID=3yz7-j3xRzU3SODdoNgSGvO_cD8UijH3AIWRDAg1x-M
export NATIONAL_ID_OIDP_BASE_URL=https://idp.collab.mosip.net/
export NATIONAL_ID_OIDP_REST_URL=https://api.collab.mosip.net/v1/idp/
export NATIONAL_ID_OIDP_ESSENTIAL_CLAIMS=name,birthdate,address
export NATIONAL_ID_OIDP_VOLUNTARY_CLAIMS=""
export NATIONAL_ID_OIDP_CLIENT_PRIVATE_KEY=ewogICAgInAiOiAiNC13dWRnbUVQOC1aSWhfSnpGQlg5akptQmI3YW1NNWVPbUUxdUtuN0JScjZkblVhWHlJcjl4M2MxZm1ENUQ5QnJ2WVJzR0d0UC1ramotZXNKeFdkQ1ppYm1vWmctVFp0bnZ0MnRqNTh4eHNwMnFJMUprUEs1S1hpNm5DZnoyTGtSRGtxajVocTNlQXZlZDZpZUJUbmktcGhqV240MjEtazFzalBNWmJRT19jIiwKICAgICJrdHkiOiAiUlNBIiwKICAgICJxIjogInJrWkRYRjNwVW04Y0ZmM2dENmtsRVFfS1BYQi1kdVNyUUp1WlA2aVQxcnEwZ3Y2b2RxUUt4cEVXNmU1Qjd3NnkwU3pVRGFCZVhyRmZMcXlGT1ZGZEhGaVp5ODBmMFhOTzhHNkZqNjh1dXNqc0w1aHdSbmRxLTNHRHFCTTZOWXBfRjVFU2tvVXJPcVEzbDB5QmdXZTZMeWdTRnVwMTV6VU5VZHpscGxyVnU5YyIsCiAgICAiZCI6ICJJNi1LY0p4aUlvcldxR0lEVjBocTl0ZHljTTFxS2pPbDBERlhjUlhOdDZVUW9QbkdqUDk1cVFsQTg4M1FLQzZhWHRyRnZ0YS1UMUs2dkhjdnZ5QXhFR1hTckJvWVlXYnBVbzlEOFN0YV9sd3V6Wm5Yb1V0YjdKTUtGNjRGV1lkS2lmV1NWZEdvdEhrX0tZdFJaazNLd0FCR0ptSGJlNkR5TlROLVJudlcyQ3pidEt1bUtzSWpaUHpZUk4zNzdLQ2JiYzR4N1MwY2dNb25VdVk5Rm9pZXRwUWVzYXVGcmNrTmhhVktYa190N1Buc3k4dEhCbEtWeFVVYkU4TGR0LWZrbVFXNmYxUnZiM3RkNHNkRERaRjc4RHZWMFlHd0Z0S0pLODJnRlZEWTZaM0hvTTFKaGJyRk56YWpDTUpwd0c4TGtDcWJmUXlfUlhXLWhsN241eDVwSlEiLAogICAgImUiOiAiQVFBQiIsCiAgICAicWkiOiAiMGJNS1BfTFFHUWkxZ3RVNjIwb1R5RjR5dGY3QXBmU1dCN1BtSHJfT3JCU3F1Q0s3T1hiUW40enBpUXdkb2tvc3RWS0thT0tYblQ0aldVejNCQllBaDBDSmNibnphMTdMVXdKMWQ3QW1Bdnp3LVdQa3hMZWJDMWZta013SlFoOTN5YmdOMnphYXlxdTBNd0s3a1VDTm9XcHo1TUNUZ210Q2JDbWFfOEZGODc0IiwKICAgICJkcCI6ICJVQU5XNEN0QkdTR284WmpWUF91b2xZNWwwSGlLeHdBVGhrMGdEZDdtZDRsY0NmX2NMUy1TM2FMSEp2cjhPVUdYcm5OR0RIU04zSlRjM2lVSGc0VUw1eFdDOHNGZ0E3ei15TVFnamFQc0tfMjJPTUdmQlByaG5GazhDdTlVdXZwTmhrSEhWamU4dEgyQ1RUZENOQU9xc2F5cmFIaWVXMno5TWtXMnJ3THh3VXMiLAogICAgImRxIjogImNGMFBLMnZGZHdmNmxOZFdjdUo4NnE1Q21EQ0M2WWR3UHp6VHB5NjYtMVR2OUJIYmJudEFFMTBTNkF0ZGFaUVJpVHFkRXBnV29Iay1SR3FwanhZOXNYd1MxVXRSTzR0Y0Z6czdWRFFBTGlCRDRFQXFDOVVOSGtmSE9rUURZT2dHSDV6QzI4T081c1Zncm1WLWpuX2hsR3dDbGRIZjZRM1VvN2FJUHlVTDc0cyIsCiAgICAibiI6ICJteWtXSWZ0a25LMVRRbWJpYXp1aWswcldHc3hlT0lVRTN5ZlNRSmdvQ2ZkR1hZNEhmSEU2QWxOS0ZkSUtaT1hlLVUtTDIxS2xqNjkyZTlpWngwNXJISGFadk8wYTRJenlGTU95dzV3akJDV29CT2NBNHE5M0xQa1pUU2tJcTlJMlZncjZCend1Nlg3UVBNYm1GOHhBS1g0S2VTbl95WmNzQWhFbEhCT1drRU5tS3A3NnlDeVRlRTREQUlHYWgxQmNnaUJfS1d2T1pPZWR3VFJETHlRMERaTTF6MDctTi1yUGgwcVNkMlVGUlJZLWJfamM5b3BqeVJRcTNkNVpraUI5VzRSZUFVaElLQTl1YzFSRHMxc2hjM0c4emdacDNxSDZmWVdtc09pMjNCT0FfcThaLXdNSHdQSzJ2RUp2Z1pJV292QUc1akdGYk1pbE5jRlFmekxKY1EiCn0=
export NATIONAL_ID_OIDP_JWT_AUD_CLAIM=https://api.collab.mosip.net/v1/idp/oauth/token

if [  -n "$(uname -a | grep Ubuntu)" ]; then
  OS="UBUNTU"
  else
  OS="MAC"
fi

if [ ! $OS == "UBUNTU" ]; then
  export LOCAL_IP=host-gateway
fi

####
#
# SUPER USER MODE
# Using --only-dependences or --only-services will start only the dependencies or services.
# This is done so that more experienced users could start the stack in different terminal windows
#
###
dependencies=false
services=false

for arg in "$@"
do
  case $arg in
    --only-dependencies)
      dependencies=true
      ;;
    --only-services)
      services=true
      ;;
    *)
      # Handle unknown option
      echo "Unknown option: $arg"
      exit 1
      ;;
  esac
done

if $dependencies; then
  yarn run compose:deps
  exit 0
elif $services; then
  yarn dev:secrets:gen
  yarn run start
  exit 0
fi

echo
echo -e "This command starts the OpenCRVS Core development environment, which consists of multiple NodeJS microservices running in parallel.  OpenCRVS requires a companion country configuration server to also be running. \n\nIf you ran our setup command, the fictional Farajaland country configuration server exists in the directory opencrvs-farajaland alongside this directory, otherwise you may have cloned or forked it somewhere else.\n\nSo, before we start...\n\n1. Copy this command: \033[32myarn dev \033[0m\n\n2. Create another terminal window.\n\n3. cd into your country config directory and prepare to run this command in that terminal window  \033[32myarn dev \033[0m\n\n2, \033[32mWHEN OPENCRVS CORE HAS FULLY STARTED UP\033[0m, in order to start the country config server and be able to use OpenCRVS.\n\nYou know OpenCRVS Core is ready for you to start the country configuration server, when you see this message: \"\033[32m@opencrvs/client: Compiled with warnings.\033[0m\" followed by any NPM dependency warnings."
echo

sleep 3

# Retrieve 2-step verification to continue
#-----------------------------------------
function ask_yes_or_no() {
    read -p "$1 ([y]es or [N]o): "
    case $(echo $REPLY | tr '[A-Z]' '[a-z]') in
        y|yes) echo "yes" ;;
        *)     echo "no" ;;
    esac
}

if [[ "no" == $(ask_yes_or_no "If you are ready to continue, type: yes.  If you dont know, type: no to exit.") ]]
then
    echo -e "\n\nExiting OpenCRVS."
    exit 0
fi

echo
echo -e "\033[32m:::::::::: Stopping any currently running Docker containers ::::::::::\033[0m"
echo
if [[ $(docker ps -aq) ]] ; then
  docker stop $(docker ps -aq)
  sleep 5
fi


echo
openCRVSPorts=( 3447 9200 5001 5000 9200 27017 6379 8086 3040 5050 2020 7070 9090 1050 3030 3000 3020 2525 2021 3535 3536 9050)
for x in "${openCRVSPorts[@]}"
do
   :
    if lsof -i:$x; then
      echo -e "OpenCRVS thinks that port: $x is in use by another application.\r"
      echo "You need to find out which application is using this port and quit the application."
      echo "You can find out the application by running:"
      echo "lsof -i:$x"
      exit 1
    else
        echo -e "$x \033[32m port is available!\033[0m :)"
    fi
done



echo
echo -e "\033[32m:::::::::: STARTING OPENCRVS ::::::::::\033[0m"
echo
echo "If you did not previously run our setup command, Docker is downloading Mongo DB, ElasticSearch, OpenHIM and Hearth docker images.  These are large files.  Then docker will build them.  If you did run our setup command, OpenCRVS will start much faster. Wait for the OpenCRVS client app to build completely (output will stop and you will see the message: @opencrvs/client: Compiled with warnings.), then OpenCRVS Core will be available."
echo
echo -e "\033[32m:::::::::: PLEASE WAIT for @opencrvs/client ::::::::::\033[0m"
echo
sleep 10

yarn dev:secrets:gen
concurrently "yarn run start" "yarn run compose:deps"