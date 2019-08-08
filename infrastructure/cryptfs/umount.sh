#!/bin/bash

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
