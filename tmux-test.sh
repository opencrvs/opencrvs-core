# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.
#!/bin/bash

session=$1
window=$2
pan1=$3
pan2=$4

#Get width and lenght size of terminal, this is needed if one wants to resize a detached session/window/pane
#with resize-pane command here
set -- $(stty size) #$1=rows, $2=columns

#start a new session in dettached mode with resizable panes
tmux new-session -s $session -n $window -d -x "$2" -y "$(($1 - 1))"
tmux send-keys -t $session 'echo "first command in 1st pane"' C-m

#rename pane 0 with value of $pan1
tmux set -p @mytitle "$pan1"

#split window vertically
tmux split-window -h
tmux send-keys -t $session 'echo "first command in 2nd pane"' C-m
tmux set -p @mytitle "$pan2"

#At the end, attach to the customized session
tmux attach -t $session
