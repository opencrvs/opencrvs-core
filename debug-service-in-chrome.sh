#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Define an array with service names and ports
SERVICES=(
  "auth:4040"
  "workflow:5050"
  "events:5555"
  "config:2021"
  "gateway:7070"
  "metrics:1050"
  "notification:2020"
  "search:9090"
  "user-mgnt:3030"
  "webhooks:2525"
  "countryconfig:3040"
)

# ANSI color codes
ROYAL_BLUE="\033[38;5;21m"
RESET="\033[0m"
PURPLE="\033[35m"
YELLOW="\033[33m"
CYAN="\033[36m"
UNDERLINE="\033[4m"
RED="\033[31m"
GREEN="\033[32m"

# Function to get port by service name
get_port() {
  local service_name=$1
  for service in "${SERVICES[@]}"; do
    IFS=":" read -r name port <<< "$service"
    if [ "$name" == "$service_name" ]; then
      echo "$port"
      return 0
    fi
  done
  return 1
}

# Function to display all supported services and their ports
display_supported_services() {
  echo -e "${YELLOW}Supported services and their ports:${RESET}"
  for service in "${SERVICES[@]}"; do
    IFS=":" read -r name port <<< "$service"
    echo -e "${ROYAL_BLUE}- $name: $port${RESET}"
  done
}

# Check if a service name is provided
if [ -z "$1" ]; then
  echo -e "${RED}Usage: $0 <service-name>${RESET}"
  display_supported_services
  exit 1
fi

SERVICE_NAME=$1
PORT=$(get_port "$SERVICE_NAME")

# Check if the port number was found for the given service name
if [ -z "$PORT" ]; then
  echo -e "${RED}No port found for service name '$SERVICE_NAME'.${RESET}"
  display_supported_services
  exit 1
fi

# Get the PID of the process listening on the provided port
PID=$(lsof -i:$PORT -t)

# Check if the PID was found
if [ -z "$PID" ]; then
  echo -e "${RED}No process found listening on port $PORT for service '$SERVICE_NAME'.${RESET}"
  display_supported_services
  exit 1
else
  # Send the SIGUSR1 signal to the process
  kill -SIGUSR1 $PID
  echo -e "${GREEN}Sent SIGUSR1 to process with PID $PID for service '$SERVICE_NAME' on port $PORT.${RESET}"
fi

# Open Chrome with the specified URL
open -a "Google Chrome" "chrome://inspect/#devices"



# Display information message
echo -e "${PURPLE}====================================================${RESET}"
echo -e "${YELLOW}This script helps you debug '$SERVICE_NAME' service running on http://localhost:$PORT in Google Chrome DevTools.${RESET}"
echo -e "${PURPLE}====================================================${RESET}"
echo -e "${ROYAL_BLUE}1. Once the DevTools are open, click 'inspect' below the 'Remote Target' link.${RESET}"
echo -e "${ROYAL_BLUE}2. A new window will pop up.${RESET}"
echo -e "${ROYAL_BLUE}3. Go to the 'Sources' tab.${RESET}"
echo -e "${ROYAL_BLUE}4. Press \033[35mCtrl/Command + P${ROYAL_BLUE} and type the filename to select the file.${RESET}"
echo -e "${ROYAL_BLUE}5. Add breakpoints and debug your Node.js application.${RESET}"
echo -e "${ROYAL_BLUE}6. If you don't see your service listed as a remote target, click on 'Configure', check if 'localhost:9229' exists. If not, add it, then run the script again.${RESET}"
echo -e "${ROYAL_BLUE}For more details on debugging Node.js applications, click here: ${PURPLE}\033[4mhttps://nodejs.org/en/learn/getting-started/debugging${RESET}${ROYAL_BLUE}.${RESET}"
echo -e "${PURPLE}====================================================${RESET}"
echo -e "${RED}Note: If you previously ran this script for a different service (e.g., 'workflow'), try to run another service (e.g., 'auth') and it's still the previous one showing up in the remote target, ensure you stop the previous service and refresh Chrome DevTools.${RESET}"
