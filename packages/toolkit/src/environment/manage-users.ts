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

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';



async function inquirerPrompt(
  name: 'input' | 'select' | 'confirm' | 'editor' | 'checkbox',
  options: any
) {
  const inquirer = await import('@inquirer/prompts')
  return (inquirer[name] as (value: typeof options) => Promise<any>)(options)
}

const input = (options: any) => inquirerPrompt('input', options)
const select = (options: any) => inquirerPrompt('select', options)
const confirm = (options: any) => inquirerPrompt('confirm', options)
const editor = (options: any) => inquirerPrompt('editor', options)
const checkbox = (options: any) => inquirerPrompt('checkbox', options)

import { info, warn } from './logger'
import { readYamlFile, writeYamlFile } from './utils'
import { getUsers } from './templates'

export interface User {
  name: string;
  ssh_keys: string[];
  state: 'present' | 'absent';
  role: 'admin' | 'operator';
}

/**
 * Updates users in Ansible inventory file
 * 
 * @param {string} filePath - Path to the inventory file
 * @param {User[]} users - Users array
 */
function updateInventoryFile(filePath: string, users: User[]) {
  const data = readYamlFile(filePath)
  if (!data?.all?.vars?.users) {
    throw Error(`'users' section not found within inventory file: ${filePath}`)
  }
  data.all.vars.users = users;
  writeYamlFile(filePath, data)
}
/**
 * Parses the Ansible inventory file and extracts existing users
 * 
 * @param {string} filePath - Path to the inventory file
 * @returns {User[]} Array of existing users
 */
function parseInventoryFile(filePath: string): User[] {
  try {
  const data = readYamlFile(filePath)
  return getUsers(data)
  } catch {
    return []
  }
}

/**
 * Gets the current system username
 * 
 * @returns {string} Current OS username
 */
function getCurrentUsername(): string {
  return os.userInfo().username;
}

/**
 * Reads SSH public keys from the current user's .ssh directory
 * 
 * @returns {string[]} Array of SSH public keys found
 */
function getCurrentUserSSHKeys(): string[] {
  const homeDir = os.homedir();
  const sshDir = path.join(homeDir, '.ssh');
  const keys: string[] = [];
  
  // Common public key filenames
  const keyFiles = [
    'id_rsa.pub',
    'id_ecdsa.pub',
    'id_ed25519.pub',
    'id_dsa.pub'
  ];
  
  for (const keyFile of keyFiles) {
    const keyPath = path.join(sshDir, keyFile);
    
    try {
      if (fs.existsSync(keyPath)) {
        const keyContent = fs.readFileSync(keyPath, 'utf8').trim();
        if (keyContent) {
          keys.push(keyContent);
        }
      }
    } catch (error) {
      // Silently skip if can't read the file
      continue;
    }
  }
  
  return keys;
}

async function selectRole(): Promise<'admin' | 'operator'> {
  return await select({
    message: 'Select user role:',
    choices: [
      { name: 'Admin (full access to OS and Kubernetes)', value: 'admin' },
      { name: 'Operator (read-only OS, full Kubernetes)', value: 'operator' }
    ]
  });
}

async function selectState(): Promise<'present' | 'absent'> {
  return await select({
    message: 'Select user state:',
    choices: [
      { name: 'Present (user is allowed to login)', value: 'present' },
      { name: 'Absent (user account is disabled)', value: 'absent' }
    ]
  });
}

/**
 * Asks if user wants to add current system user as the first user
 * 
 * @returns {Promise<User | null>} User object if accepted, null if declined
 */
async function askToAddCurrentUser(existingUsers: User[]): Promise<User | null> {
  const currentUsername = getCurrentUsername();
  const currentKeys = getCurrentUserSSHKeys();

  // Check if user already exists
  if (existingUsers.find(u => u.name === currentUsername)) {
    info(`ℹ️  User "${currentUsername}" already exists in inventory.`);
    return null;
  }

  if (currentKeys.length === 0) {
    // No SSH keys found for current user
    return null;
  }
  
  const addCurrentUser = await confirm({
    message: `Add current user "${currentUsername}" with ${currentKeys.length} SSH key(s)?`,
    default: true
  });
  
  if (!addCurrentUser) {
    return null;
  }
  
  // Ask for role
  const role = await selectRole();
  
  return {
    name: currentUsername,
    ssh_keys: currentKeys,
    state: 'present',
    role: role
  };
}


/**
 * Add a new user
 */
async function addNewUser(existingUsers: User[]): Promise<User | null> {
  const name = await input({
    message: 'Enter username:',
    validate: (value: string) => {
      if (!value.trim()) {
        return 'Username required';
      }
      if (existingUsers.find(u => u.name === value.trim())) {
        return `User "${value}" already exists`;
      }
      if (!/^[a-z_][a-z0-9_-]*[$]?$/.test(value.trim())) {
        return 'Invalid username format (use lowercase, numbers, underscore, hyphen)';
      }
      return true;
    }
  });
  
  const keysInput = await editor({
    message: 'Paste SSH public key(s) (one per line):',
    default: ''
  });
  
  const ssh_keys = keysInput
    .split('\n')
    .map((key: string) => key.trim())
    .filter((key: string) => key && !key.startsWith('#'));
  
  if (ssh_keys.length === 0) {
    warn('⚠️  Warning: No SSH keys provided. User will not be able to login remotely.');
  }
  
  const role = await selectRole();
  // New users always active
  const state = "present"
  
  return {
    name: name.trim(),
    ssh_keys,
    state,
    role
  };
}


/**
 * Display user summary
 */
function displayUserSummary(users: User[]): void {
  if (users.length === 0) {
    console.log('\n📋 No users configured.\n');
    return;
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`📋 User Configuration Summary - Total users: ${users.length}`);
  console.log('='.repeat(70));
  
  users.forEach((user, index) => {
    const stateIcon = user.state === 'present' ? '✅' : '❌';
    const roleIcon = user.role === 'admin' ? '👑' : '👤';
    console.log(
      `${index + 1}. ${stateIcon} ${roleIcon} ${user.name.padEnd(20)} ` +
      `Role: ${user.role.padEnd(10)} State: ${user.state.padEnd(10)} ` +
      `SSH Keys: ${user.ssh_keys.length}`
    );
  });
  
  console.log('='.repeat(70) + '\n');
}

/**
 * Edit an existing user with screen clearing for better UX
 */
async function editUser(user: User): Promise<User> {
  const updatedUser = { ...user };
  let continueEditing = true;
  
  // Function to clear screen and move cursor to top
  const clearScreen = () => {
    process.stdout.write('\x1Bc'); // Clear entire screen
    // Alternative: process.stdout.write('\x1B[2J\x1B[0f'); // Clear screen + move cursor to top
  };
  
  // Function to display current user state
  const displayUserState = () => {
    clearScreen();
    console.log('─'.repeat(70));
    console.log(`📝 Editing user: ${updatedUser.name}`);
    console.log('─'.repeat(70));
    console.log(`Current Role:      ${updatedUser.role === 'admin' ? '👑 admin' : '👤 operator'}`);
    console.log(`Current State:     ${updatedUser.state === 'present' ? '✅ present' : '❌ absent'}`);
    console.log(`Current SSH Keys:  ${updatedUser.ssh_keys.length} key(s)`);
    if (updatedUser.ssh_keys.length > 0) {
      updatedUser.ssh_keys.forEach((key, idx) => {
        const keyPreview = key.length > 50 ? key.substring(0, 47) + '...' : key;
        console.log(`  ${idx + 1}. ${keyPreview}`);
      });
    }
    console.log('─'.repeat(70));
    console.log(''); // Empty line for spacing
  };
  
  while (continueEditing) {
    displayUserState();
    
    const action = await select({
      message: 'What would you like to modify?',
      choices: [
        { 
          name: `Change role (current: ${updatedUser.role})`, 
          value: 'role' 
        },
        { 
          name: `Change state (current: ${updatedUser.state})`, 
          value: 'state' 
        },
        { 
          name: `Update SSH keys (current: ${updatedUser.ssh_keys.length} key(s))`, 
          value: 'keys' 
        },
        { 
          name: '💾 Save changes and return', 
          value: 'save' 
        },
        { 
          name: '🚫 Cancel and discard changes', 
          value: 'cancel' 
        }
      ]
    });
    
    switch (action) {
      case 'role':
        const newRole = await selectRole();
        if (newRole !== updatedUser.role) {
          updatedUser.role = newRole;
        }
        break;
        
      case 'state':
        const newState = await selectState();
        if (newState !== updatedUser.state) {
          updatedUser.state = newState;
        }
        break;
        
      case 'keys':
        const keysInput = await editor({
          message: 'Update SSH public key(s) (one per line):',
          default: updatedUser.ssh_keys.join('\n')
        });
        
        const newKeys = keysInput
          .split('\n')
          .map((key: string) => key.trim())
          .filter((key: string) => key && !key.startsWith('#'));
        
        if (newKeys.length === 0) {
          clearScreen();
          displayUserState();
          const confirmRemoveKeys = await confirm({
            message: '⚠️  Warning: All SSH keys will be removed. Continue with no SSH keys?',
            default: false
          });
          
          if (confirmRemoveKeys) {
            updatedUser.ssh_keys = [];
          }
        } else {
          updatedUser.ssh_keys = newKeys;
        }
        break;
        
      case 'save':
        const hasChanges = 
          updatedUser.role !== user.role ||
          updatedUser.state !== user.state ||
          JSON.stringify(updatedUser.ssh_keys) !== JSON.stringify(user.ssh_keys);
        
        clearScreen();
        if (hasChanges) {
          console.log('\n✅ Changes saved for user:', updatedUser.name, '\n');
        } else {
          console.log('\nℹ️  No changes made\n');
        }
        continueEditing = false;
        break;
        
      case 'cancel':
        clearScreen();
        const confirmCancel = await confirm({
          message: 'Discard all changes?',
          default: false
        });
        
        if (confirmCancel) {
          console.log('\n🚫 Changes discarded\n');
          return user; // Return original user
        }
        break;
    }
  }
  
  return updatedUser;
}

/**
 * Main function to manage users
 */
export async function manageUsers(inventoryPath: string): Promise<User[]> {

  let users: User[] = fs.existsSync(inventoryPath) ? parseInventoryFile(inventoryPath) : [];

  if (users.length > 0) {
    displayUserSummary(users);
  }
  
  let continueManaging = true;
  
  while (continueManaging) {
    const action = await select({
      message: 'What would you like to do?',
      choices: [
        { name: '➕ Add new user', value: 'add' },
        { name: '✏️  Edit existing user', value: 'edit' },
        { name: '🗑️  Remove user', value: 'remove' },
        { name: '👤 Add current system user', value: 'add-current' },
        { name: '📋 View all users', value: 'view' },
        { name: '💾 Save and exit', value: 'save' },
        { name: '🚪 Exit without saving', value: 'exit' }
      ]
    });
    
    switch (action) {
      case 'add':
        const newUser = await addNewUser(users);
        if (newUser) {
          users.push(newUser);
          console.log(`✅ User "${newUser.name}" added.\n`);
        }
        break;
        
      case 'add-current':
        const currentUser = await askToAddCurrentUser(users);
        if (currentUser) {
          users.push(currentUser);
          console.log(`✅ Current user "${currentUser.name}" added.\n`);
        }
        break;
        
      case 'edit':
        if (users.length === 0) {
          console.log('⚠️  No users to edit.\n');
          break;
        }
        
        const userToEdit = await select({
          message: 'Select user to edit:',
          choices: users.map(u => ({
            name: `${u.name} (${u.role}, ${u.state})`,
            value: u.name
          }))
        });
        
        const userIndex = users.findIndex(u => u.name === userToEdit);
        if (userIndex !== -1) {
          users[userIndex] = await editUser(users[userIndex]);
          console.log(`✅ User "${userToEdit}" updated.\n`);
        }
        break;
        
      case 'remove':
        if (users.length === 0) {
          console.log('⚠️  No users to remove.\n');
          break;
        }
        
        const usersToRemove = await checkbox({
          message: 'Select user(s) to remove:',
          choices: users.map(u => ({
            name: `${u.name} (${u.role}, ${u.state})`,
            value: u.name
          }))
        });
        
        if (usersToRemove.length > 0) {
          const confirmRemove = await confirm({
            message: `Remove ${usersToRemove.length} user(s)?`,
            default: false
          });
          
          if (confirmRemove) {
            users = users.filter(u => !usersToRemove.includes(u.name));
            console.log(`✅ Removed ${usersToRemove.length} user(s).\n`);
          }
        }
        break;
        
      case 'view':
        displayUserSummary(users);
        break;
        
      case 'save':
        if (users.length === 0) {
          info('\n📋 No users configured.\n');
          continueManaging = false;
          break;
        }
        displayUserSummary(users);
        const confirmSave = await confirm({
          message: 'Save changes end exit?',
          default: true
        });
        
        if (confirmSave && fs.existsSync(inventoryPath)) {
          updateInventoryFile(inventoryPath, users);
          console.log(`\n✅ Changes saved to ${inventoryPath}\n`);
        }
        continueManaging = false;
        break;
        
      case 'exit':
        if (users.length === 0) {
          info('\n📋 No users configured.\n');
          continueManaging = false;
          break;
        }
        const confirmExit = await confirm({
          message: 'Exit without saving changes?',
          default: false
        });
        
        if (confirmExit) {
          console.log('👋 Exited without saving.\n');
          continueManaging = false;
        }
        break;
    }
  }
  
  return users;
}
