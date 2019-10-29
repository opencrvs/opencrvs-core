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

set -e

# defaults, use options to override
FS_SIZE=50g                       # -s, --size
FS_FILE=/cryptfs_file_sparse.img  # -f, --file
MOUNT_PATH=/data                  # -m, --mount
DEV_MAP_NAME=cryptfs              # -n, --name
                                  # -p, --passphrase (required)

# options
while [[ "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
  -s | --size )
    shift; FS_SIZE=$1
    ;;
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

# creates a sparse file that will be used for the crypt file system data
if test -f "$FS_FILE"; then
  echo "ERROR: $FS_FILE exists, cannot bootstrap as the file might already contain existing data. Try run mount.sh to mount the file."
  exit 1
else
  truncate -s $FS_SIZE $FS_FILE
fi

# create a loop device from the data file
LOOP_DEVICE=$(losetup --find --show $FS_FILE)

# setup encryption on the device
echo $PASSPHRASE | cryptsetup -q -d - luksFormat $LOOP_DEVICE

# open the LUKS device and set a mapping name
echo $PASSPHRASE | cryptsetup -d - luksOpen $LOOP_DEVICE $DEV_MAP_NAME

# create a file system on the device
mkfs.ext4 /dev/mapper/$DEV_MAP_NAME

# mount the device to a folder
mkdir -p $MOUNT_PATH
mount /dev/mapper/$DEV_MAP_NAME $MOUNT_PATH
