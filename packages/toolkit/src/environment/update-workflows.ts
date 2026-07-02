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

import { readdir } from 'fs/promises';
import { readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import { basename, join } from 'path';
import * as glob from 'glob';
import * as yaml from 'js-yaml';
import { error, info, log, success, warn } from './logger'
interface WorkflowConfig {
  workflows: string[];
  path: string;
}


async function extractInfrastructureNames(): Promise<string[]> {
  const files = glob.sync('infrastructure/server-setup/inventory/*.yml');
  
  const infraEnvironments = files.map(file => basename(file, '.yml'));
  if (infraEnvironments.length === 0) {
    console.log('⚠️  Warning: No environment directories found in infrastructure/server-setup/inventory/');
    return [];
  }
  log('🔍 Found infrastructure configurations:', infraEnvironments.join(', '));  
  return infraEnvironments;
}

async function extractEnvironmentNames(): Promise<string[]> {
  const entries = await readdir('environments');
  
  // Filter only directories
  const environments = entries.filter(entry => {
    const fullPath = join('environments', entry);
    return statSync(fullPath).isDirectory();
  });
  if (environments.length === 0) {
    console.log('⚠️  Warning: No environment directories found in environments/');
    return [];
  }

  log('🔍 Found OpenCRVS configurations:', environments.join(', '));  
  return environments;
}

function updateOptionsInYaml(content: string, envList: string[]): string {
  // Find the options array pattern
  // Matches: options: followed by array items (- item)
  const optionsRegex = /([ ]*options:[ ]*\n)((?:[ ]*-[^\n]*\n)+)/;
  
  const match = content.match(optionsRegex);
  
  if (!match) {
    throw new Error('Could not find options array in workflow file');
  }
  
  // Get the indentation from the first array item
  const firstItemMatch = match[2].match(/^([ ]*)-/);
  const itemIndent = firstItemMatch ? firstItemMatch[1] : '          ';
  
  // Create new options array
  const newOptions = match[1] + envList.map(env => `${itemIndent}- ${env}`).join('\n') + '\n';
  
  // Replace the old options array with the new one
  return content.replace(optionsRegex, newOptions);
}

async function updateWorkflows(
  envList: string[],
  config: WorkflowConfig
): Promise<void> {
  const { workflows } = config;
  
  for (const workflowPath of workflows) {
    try {
      const fileContents = readFileSync(workflowPath, 'utf8');
      
      // Verify the file is valid YAML and has the expected structure
      const workflowData = yaml.load(fileContents) as any;
      if (!workflowData?.on?.workflow_dispatch?.inputs?.environment?.options) {
        throw new Error('Workflow does not have the expected structure: on.workflow_dispatch.inputs.environment.options');
      }
      
      // Update only the options array while preserving everything else
      const updatedContent = updateOptionsInYaml(fileContents, envList);
      
      writeFileSync(workflowPath, updatedContent, 'utf8');
      log(`  ✓ Successfully updated ${workflowPath}`);
    } catch (error) {
      console.error(`\n⚠️  Error updating ${workflowPath} with environments: [${envList.join(', ')}]`);
      console.error(`✗ Failed to update ${workflowPath}:`, error);
      throw error;
    }
  }
}

export async function updateWorkflowEnvironments(): Promise<void> {
  try {
    let didUpdateWorkflows = false

    // Extract infrastructure names
    const infraEnvironments = await extractInfrastructureNames();
    
    if (infraEnvironments.length > 0) {
      console.log('🔄 Updating infrastructure workflows:');
      await updateWorkflows(infraEnvironments, {
        workflows: [
          '.github/workflows/provision.yml',
          '.github/workflows/reset-2fa.yml',
        ],
        path: 'on.workflow_dispatch.inputs.environment.options'
      });
      didUpdateWorkflows = true
    }

    // Extract environment names (only directories)
    const environments = await extractEnvironmentNames();

    if (environments.length > 0) {
      const workflows = [
        '.github/workflows/deploy-dependencies.yml',
        '.github/workflows/deploy-opencrvs.yml',
        '.github/workflows/clear-all-data.yml',
        '.github/workflows/seed-data.yml',
        '.github/workflows/reindex.yml',
        '.github/workflows/github-to-k8s-sync-env.yml'
      ];
      log("📋 Updating OpenCRVS application workflows:");
      await updateWorkflows(environments, {
        workflows,
        path: 'on.workflow_dispatch.inputs.environment.options'
      });
      didUpdateWorkflows = true
    }

    if (didUpdateWorkflows) {
      success('✅ Workflow updates completed successfully!');
    } else {
      log('ℹ️  No workflows were updated.');
    }
  } catch (error) {
    console.error('\n❌ Error updating workflows:', error);
    process.exit(1);
  }
}
