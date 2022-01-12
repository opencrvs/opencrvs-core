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
if [  -n "$(uname -a | grep Ubuntu)" ]; then

    echo "OpenCRVS requires multiple terminal windows open in order to run OpenCRVS Core alongside the default country configuration."
    echo "::::::::::::: We want to install the tool tmux to do this. :::::::::::::"
    echo
    echo "::::::::::::: Please enter your sudo password when prompted :::::::::::::"
    echo
    sudo apt-get install tmux
else
  echo "OpenCRVS requires multiple terminal windows open in order to run OpenCRVS Core alongside the default country configuration."
  echo
  echo "We use the tool tmux to do this.  Please install it following the documentation here: https://github.com/tmux/tmux/wiki"
fi
tmux new -d -s opencrvs-core
tmux new -d -s opencrvs-zambia
tmux send -t opencrvs-core.0 ls ENTER
tmux send -t opencrvs-zambia.0 ls ENTER
tmux attach -d -t opencrvs-core
