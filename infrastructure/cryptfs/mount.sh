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
                                  # -p, --passphrase (required)

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
  -p | --passphrase )
    shift; PASSPHRASE=$1
    ;;
esac; shift; done
if [[ "$1" == '--' ]]; then shift; fi

if [[ -z "$PASSPHRASE" ]]; then
  echo "ERROR: Passphrase is required. Use -p or --passphrase."
  exit 1
fi

# create a loop device from the data file if it doesn't already exist
LOOP_DEVICE=$(losetup -j /cryptfs_file_sparse.img | awk '{print substr($1, 1, length($1)-1)}' | head -1)
echo $LOOP_DEVICE
if [[ -z "$LOOP_DEVICE" ]]; then
  LOOP_DEVICE=$(losetup --find --show $FS_FILE)
  echo "Created new loop device $LOOP_DEVICE"
else
  echo "Using existing loop device $LOOP_DEVICE"
fi

# open the LUKS device and set a mapping name
echo $PASSPHRASE | cryptsetup -d - luksOpen $LOOP_DEVICE $DEV_MAP_NAME || true

# mount the device to a folder
mount /dev/mapper/$DEV_MAP_NAME $MOUNT_PATH || true
