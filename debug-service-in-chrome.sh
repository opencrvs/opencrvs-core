#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Check if a port number is provided
if [ -z "$1" ]; then
  echo -e "\033[31mUsage: $0 <port>\033[0m"
  exit 1
fi

PORT=$1

# Get the PID of the process listening on the provided port
PID=$(lsof -i:$PORT -t)

# Check if the PID was found
if [ -z "$PID" ]; then
  echo -e "\033[31mNo process found listening on port $PORT.\033[0m"
  exit 1
else
  # Send the SIGUSR1 signal to the process
  kill -SIGUSR1 $PID
  echo -e "\033[32mSent SIGUSR1 to process with PID $PID.\033[0m"
fi

# Open Chrome with the specified URL
open -a "Google Chrome" "chrome://inspect/#devices"

# Display information message
echo -e "\033[34m====================================================\033[0m"
echo -e "\033[33mThis script helps you debug a Node.js application running on http://localhost:$PORT in Google Chrome DevTools.\033[0m"
echo -e "\033[34m====================================================\033[0m"
echo -e "\033[36m1. Once the DevTools are open, click 'inspect' below the 'Remote Target' link.\033[0m"
echo -e "\033[36m2. A new window will pop up.\033[0m"
echo -e "\033[36m3. Go to the 'Sources' tab.\033[0m"
echo -e "\033[36m4. Press \033[35mCtrl/Command + P\033[36m and type the filename to select the file.\033[0m"
echo -e "\033[36m5. Add breakpoints and debug your Node.js application.\033[0m"
echo -e "\033[34m====================================================\033[0m"
