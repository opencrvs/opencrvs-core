#!/usr/bin/env bash

backup_log() {
  echo "[$(date +%F\ %H:%M:%S)] $*"
}

create_archive() {
  local source_dir="$1"
  local archive_path="$2"

  backup_log "Creating archive at $archive_path"
  tar -czvf "$archive_path" -C "$source_dir" .
}

extract_archive() {
  local archive_path="$1"
  local destination_dir="$2"

  backup_log "Extracting archive $archive_path into $destination_dir"
  mkdir -p "$destination_dir"
  tar -xzvf "$archive_path" -C "$destination_dir"
}

encrypt_backup() {
  local input_path="$1"
  local output_path="$2"

  backup_log "Encrypting backup at $input_path"
  openssl enc -aes-256-cbc -pbkdf2 -salt \
    -in "$input_path" -out "$output_path" -pass env:ENCRYPT_PASS || return 1
  rm -f "$input_path"
  backup_log "Backup encrypted at $output_path"
}

decrypt_backup() {
  local input_path="$1"
  local output_path="$2"

  backup_log "Decrypting backup file $input_path"
  openssl enc -d -aes-256-cbc -pbkdf2 -salt \
    -in "$input_path" -out "$output_path" -pass env:ENCRYPT_PASS
  backup_log "Backup decrypted at $output_path"
}

transfer_to_backup_host() {
  local local_file="$1"
  local remote_dir="$2"
  local backup_user="$3"
  local backup_host="$4"
  local ssh_key_path="${5:-/ssh/ssh_key}"

  backup_log "Transferring backup to $backup_host:$remote_dir"
  if rsync -avz \
    --rsync-path="mkdir -p $remote_dir && rsync" \
    -e "ssh -i $ssh_key_path -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
    "$local_file" "$backup_user@$backup_host:$remote_dir/"; then
    backup_log "Backup transferred to $backup_host:$remote_dir"
  else
    backup_log "[ERROR] Failed to transfer $local_file to $backup_host:$remote_dir" >&2
    return 1
  fi
}

transfer_from_backup_host() {
  local remote_file="$1"
  local local_file="$2"
  local backup_user="$3"
  local backup_host="$4"
  local ssh_key_path="${5:-/ssh/ssh_key}"

  backup_log "Transferring backup from $backup_host:$remote_file"
  if rsync -avz \
    -e "ssh -i $ssh_key_path -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
    "$backup_user@$backup_host:$remote_file" "$local_file"; then
    backup_log "Backup transferred from $backup_host:$remote_file"
  else
    backup_log "[ERROR] Failed to transfer $backup_host:$remote_file" >&2
    return 1
  fi
}
