/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import fs from "fs";
import path from "path";
import { log, success, warn } from './logger'

import Handlebars from 'handlebars';

// Register a helper to increment numbers
Handlebars.registerHelper('data_label_idx', function(value) {
  return parseInt(value) + 2;
});

export function getUsers(data: any): any {
  if (!data?.all?.vars?.users) {
    return { users: [] };
  }
  return data.all.vars.users;
}
// START: TEMPORAL SECTION FOR TRANSITION FROM DOCKER SWARM TO K8s
// Extract users from the old inventory
// Docker swarm format to new
export function extractAndModifyUsers(data: any): any {
  if (!data?.all?.vars?.users) {
    return { users: [] };
  }
  const users = data.all.vars.users.map((user: any) => {
    const { sudoer, ...rest } = user;
    return {
      ...rest,
      role: sudoer ? "admin" : "operator",
    };
  });
  return users;
}

export function dockerManagerFirst(data: any): string {
  if (!data?.['docker-manager-first']?.hosts) {
    throw new Error('Invalid YAML structure: missing docker-manager-first.hosts');
  }
  const hosts = data['docker-manager-first'].hosts;
  const dockerManagerFirst = Object.values(hosts)
    .filter((host: any) => host.ansible_host)
    .map((host: any) => host.ansible_host);
  return dockerManagerFirst.length === 1 ? dockerManagerFirst[0] : '';
}

export function extractBackupNode(data: any): string {
  if (!data?.['backups']?.hosts) {
    return '';
  }
  const hosts = data['backups'].hosts;
  const backupHostEntry = Object.values(hosts)
    .filter((host: any) => host.ansible_host)
    .map((host: any) => host.ansible_host);
  return backupHostEntry.length === 1 ? backupHostEntry[0] : '';
}

export function extractWorkerNodes(data: any): string[] {
  if (!data?.['docker-workers']?.hosts) {
    return [];
  }
  const hosts = data['docker-workers'].hosts;
  const worker_hosts = Object.values(hosts)
    .filter((host: any) => host.ansible_host)
    .map((host: any) => host.ansible_host);
  return worker_hosts;
}
// END: TEMPORAL SECTION FOR TRANSITION FROM DOCKER SWARM TO K8s

/**
 * Copy charts-values directory into environments/<env>
 * @param env Environment name
 * Usage: copyChartsValues('dev')
 */
/**
 * Recursively copy a directory and replace placeholders in text files.
 */
export function copyChartsValues(env: string, values: Record<string, string | boolean>) {
  const srcDir = path.resolve(__dirname, "templates", "charts-values");
  const destDir = path.resolve(process.cwd(), "environments", env);

  fs.mkdirSync(destDir, { recursive: true });

  values['lets_encrypt'] = values['traefik_mode'] === "lets_encrypt";
  values['static_ssl'] = values['traefik_mode'] === "static_ssl";

  function copyRecursive(src: string, dest: string) {
    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });

      for (const item of fs.readdirSync(src)) {
        copyRecursive(path.join(src, item), path.join(dest, item));
      }
    } else {
      const content = fs.readFileSync(src, "utf8");

      const template = Handlebars.compile(content);
      const updated = template(values);
      
      const isOverridesFile = dest.endsWith("override.yaml");
      // Skip overwrite for existing overrides.yaml
      if (isOverridesFile && fs.existsSync(dest)) {
        log(`  ↷ Skipped existing overrides file: ${dest}`);
        return;
      }

      fs.writeFileSync(dest, updated, "utf8");
      log(`  ✓ Created: ${dest}`);
    }
  }

  log(`\n📋 Copying charts-values templates to ${destDir}:`);
  copyRecursive(srcDir, destDir);

  success(`✅ Completed copying charts-values.\n`);
}

/**
 * Generate Ansible inventory file from template
 * @param env Environment name
 * @param number_of_servers Number of servers (1 for single-node, >1 for multi-node)
 * @param values Key-value pairs to replace in the template
 * Usage: generateInventory('dev', 1, {
 * HOST: process.env.APP_HOST || "localhost",
 * USER: process.env.SSH_USER || "ubuntu",
 * PORT: process.env.SSH_PORT || "22"
 * });
 */
export function generateInventory(env: string, values: Record<string, any>){
  // Template and output paths
  const templatePath = path.join(__dirname, "templates", "inventory", "inventory.template.yml");
  const outputPath = path.join(process.cwd(), "infrastructure", "server-setup", "inventory", `${env}.yml`);

  const templateFile = fs.readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(templateFile);
  values['single_node'] = (values['kube_worker_nodes'].length > 0 || values['backup_host']) ? "false" : "true";

  const updated = template(values);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, updated);
  log(`\n✅ Generated inventory file at ${outputPath}\n`);
}
