#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

# defaults, use options to override
FS_FILE=/cryptfs_file_sparse.img  # -f, --file
MOUNT_PATH=/data                  # -m, --mount
DEV_MAP_NAME=cryptfs              # -n, --name

# options
while [[ "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
  -f | --file )
    shift; FS_FILE=$1
    ;;
  -m | --mount )
    shift; MOUNT_PATH=$1
    ;;
  -n | --dev-map-name )
    shift; DEV_MAP_NAME=$1
    ;;
esac; shift; done
if [[ "$1" == '--' ]]; then shift; fi

# unmount the device from a folder
umount $MOUNT_PATH

# close the encrypted device
cryptsetup luksClose /dev/mapper/$DEV_MAP_NAME

# remove the associated loop devices
losetup -l | grep $FS_FILE | awk '{print $1}' | xargs -L 1 losetup -d
