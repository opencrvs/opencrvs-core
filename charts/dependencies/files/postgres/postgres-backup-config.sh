#!/bin/bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -e


common_config(){
apt update -q
apt upgrade -y -q
apt install -y -q pgbackrest openssh-client
# Common configuration for backup and restore
# Temporal directory required for pushing WAL files
echo "Create pgbackrest temp directory with correct permissions"
mkdir -p /tmp/pgbackrest
chown postgres:postgres /tmp/pgbackrest
chmod 770 /tmp/pgbackrest

# Skip ssh keys validation for external connections
echo "Configure key-based access to backup server"
{
echo "StrictHostKeyChecking no"
echo "UserKnownHostsFile /dev/null" 
} > /etc/ssh/ssh_config.d/backup.conf


# Create home directory for postgres user and push ssh keys inside
mkdir -p /var/lib/postgresql/.ssh
cp /root/.ssh/id_rsa /var/lib/postgresql/.ssh/id_rsa
chown -R postgres:postgres /var/lib/postgresql/.ssh/id_rsa
chmod 400 /var/lib/postgresql/.ssh/id_rsa

}

backup_mode(){

if [ -f "${PGDATA}/postgresql.conf" ]
then
echo "Database type: $DB_TYPE. Modify ${PGDATA}/postgresql.conf"
grep -q "pgbackrest --stanza=$PGBACKREST_STANZA" ${PGDATA}/postgresql.conf || \
cat >> ${PGDATA}/postgresql.conf <<EOF

# WAL Archive Configuration
archive_mode = on
archive_command = 'pgbackrest --stanza=$PGBACKREST_STANZA archive-push %p'
archive_timeout = 60
max_wal_senders = 3
wal_keep_size = 1GB
max_wal_size = 2GB
min_wal_size = 1GB
EOF
else
  echo "Warning: '${PGDATA}/postgresql.conf' not found, cannot configure backup."
fi

}

restore_mode(){
    
# pgBackRest does restore filesystem from production including configuration files
# Drop backup section from postgresql.conf after database restore
if [ -f ${PGDATA}/postgresql.conf ] && [ "$DB_TYPE" == "restore" ]
then
  echo "Database type: $DB_TYPE. Modify ${PGDATA}/postgresql.conf: Drop archive settings."
  grep -v 'archive_' ${PGDATA}/postgresql.conf > ${PGDATA}/postgresql.conf.tmp
  mv ${PGDATA}/postgresql.conf.tmp ${PGDATA}/postgresql.conf
else
  echo "Warning: '${PGDATA}/postgresql.conf' not found, cannot clean archive settings."
fi
}

###########################################################
# How it works?
# 1. standalone: database without backup or restore configured and
#            backup/restore.type=dump.
# 2. backup: backup.type=differential.
#            Production database is accessible for write while backup
#            WAL is used to play transactions made while full/diff backup
# 3. restore: restore.type=differential.
#            After restore drop WAL section to avoid concurrent write 
#            operations to production repository
###########################################################
case "${DB_TYPE:-standalone}" in
  standalone)
    echo "Database type: $DB_TYPE. Additional configuration is not required" && \
    exit 0
    ;;
  backup)
    common_config
    backup_mode
    ;;
  restore)
    common_config
    restore_mode
    ;;
  *)
    log "Unknown or missing DB_TYPE: '${DB_TYPE}'. Must be standalone, backup, or restore."
    exit 1
    ;;
esac

