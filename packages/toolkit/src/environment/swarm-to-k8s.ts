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

import * as path from 'path';
import kleur from 'kleur'
import { error, info, log, success, warn } from './logger'
import { readYamlFile } from './utils';
import {
    generateInventory,
    copyChartsValues,
    extractAndModifyUsers,
    extractWorkerNodes,
    extractBackupNode,
    dockerManagerFirst
} from './templates'
import { Octokit } from '@octokit/core';
import { generateSSHKeyPair } from './ssh-keygen';
import { createEnvironmentSecret, createEnvironmentVariable, getRepositoryId } from './github';


(async () => {
    log(kleur.bold(
        "------------------------------------------------\n" +
        "OpenCRVS Infrastructure migration script: \n" +
        "Migrating Swarm configurations to Kubernetes\n" +
        "------------------------------------------------\n"
    ));
    const environment_type = process.env.ENVIRONMENT_TYPE || 'production';
    const environment = process.env.ENVIRONMENT || '';
    const githubToken = process.env.INFRA_TOKEN || '';
    const githubOrganisation = process.env.INFRA_ORGANISATION || '';
    const githubRepository = process.env.INFRA_REPOSITORY || '';

    if (!environment) {
        error('\n', 'Environment variable ENVIRONMENT is not set. Exiting.');
        process.exit(1);
    }
    if (!githubToken) {
        error('\n', 'Environment variable GITHUB_TOKEN is not set. Exiting.');
        process.exit(1);
    }
    if (!githubOrganisation) {
        error('\n', 'Environment variable INFRA_ORGANISATION is not set. Exiting.');
        process.exit(1);
    }
    if (!githubRepository) {
        error('\n', 'Environment variable INFRA_REPOSITORY is not set. Exiting.');
        process.exit(1);
    }
    if (["backup", "jumpbox"].includes(environment)) {
        info(`  > ${environment} environment will not be migrated, see migration notes`)
        process.exit(0);
    }
    log(kleur.bold().underline('Migration properties:'));
    log(`  ✓ Environment: ${environment}`)

    const old_inventory_path = process.env.OLD_INVENTORY_PATH || '';
    if (!old_inventory_path) {
        error('\n', 'Environment variable OLD_INVENTORY_PATH is not set. Exiting.');
        log('\n', 'Old inventory path is required to read existing Swarm configurations.');
        process.exit(1);
    }
    const ansible_inventory = path.join(old_inventory_path, environment + '.yml');
    const data = readYamlFile(ansible_inventory) as any;
    log(`  ✓ Loaded old inventory file: ${ansible_inventory}`);

    const master = dockerManagerFirst(data) || ''
    log(`  ✓ Kubernetes API Host (Docker Manager): ${master}`);
    const users = extractAndModifyUsers(data);
    const kube_worker_nodes = extractWorkerNodes(data);
    log(`  ✓ Worker nodes: ${kube_worker_nodes.join(', ')}`);
    const backup_host = extractBackupNode(data);
    log(`  ✓ Backup host: ${backup_host}`);

    generateInventory(
        environment,
        {
            kube_worker_nodes: kube_worker_nodes,
            users: users,
            backup_host: environment === 'production' ? backup_host : '',
            kube_api_host: master
        }
    )

    copyChartsValues(
        environment,
        {
            env: environment,
            environment_type: environment_type,
            // FIXME: In general that should be environment_type,
            // Hardcode like this blocks us from being generic:
            // https://github.com/opencrvs/opencrvs-core/issues/11171
            two_fa_enabled: environment !== 'production' ? false : true,
            backup_enabled: environment === 'production' ? "true" : "false",
            restore_enabled: environment === 'staging' ? "true" : "false",
            restore_environment_name: environment === 'staging' ? "production" : "",
            restore_type: "dump",
            traefik_mode: "static_ssl",
            backup_type: "dump",
        }
    )
    if (environment === 'staging') {
        const octokit = new Octokit({
            auth: githubToken
        })
        const repositoryId = await getRepositoryId(
            octokit,
            githubOrganisation,
            githubRepository
        )
        try {
            await createEnvironmentVariable(
                octokit,
                repositoryId,
                environment,
                'RESTORE_ENVIRONMENT_NAME',
                'production'
            )
        } catch (err) {
            error(`Failed to create variable RESTORE_ENVIRONMENT_NAME for environment ${environment}:`, err);
        }
    }
    if (environment === 'production') {
        const octokit = new Octokit({
            auth: githubToken
        })
        console.log("Fetching repository ID for:", githubOrganisation, githubRepository);
        const repositoryId = await getRepositoryId(
            octokit,
            githubOrganisation,
            githubRepository
        )

        console.log("Repository ID:", repositoryId);
        const { publicKey, privateKey } = generateSSHKeyPair();
        const secretsToCreate = {
            BACKUP_HOST_PRIVATE_KEY: privateKey,
            BACKUP_HOST_PUBLIC_KEY: publicKey,
            BACKUP_SERVER_USER: "backup",
        }
        const variablesToCreate = {
            BACKUP_HOST: backup_host,
            KUBE_WORKER_NODES: kube_worker_nodes.join(','),
        }
        for (const [secretName, secretValue] of Object.entries(secretsToCreate)) {
            try {
                await createEnvironmentSecret(
                    octokit,
                    repositoryId,
                    environment,
                    secretName,
                    secretValue,
                    githubOrganisation,
                    githubRepository
                )
                log(`  ✓ Created secret ${secretName} for environment ${environment}`);
            } catch (err) {
                error(`Failed to create secret ${secretName} for environment ${environment}:`, err);
            }
        }
        for (const [variableName, variableValue] of Object.entries(variablesToCreate)) {
            try {
                await createEnvironmentVariable(
                    octokit,
                    repositoryId,
                    environment,
                    variableName,
                    variableValue
                )
                log(`  ✓ Created variable ${variableName} for environment ${environment}`);
            } catch (err) {
                error(`Failed to create variable ${variableName} for environment ${environment}:`, err);
            }
        }
    }
})();
 
