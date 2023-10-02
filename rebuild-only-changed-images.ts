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

import * as yaml from 'js-yaml'
import { readFileSync, writeFileSync } from 'fs'
import fetch from 'node-fetch'
import * as cp from 'child_process'
import { promisify } from 'util'

const exec = promisify(cp.exec.bind(cp))

const { DOCKER_USERNAME, DOCKER_PASSWORD } = process.env

async function getToken() {
  const response = await fetch('https://hub.docker.com/v2/users/login/', {
    method: 'POST',
    body: JSON.stringify({
      username: DOCKER_USERNAME,
      password: DOCKER_PASSWORD
    }),

    headers: {
      'Content-Type': 'application/json'
    }
  })

  const body = await response.json()
  return body.token
}

async function getLatestTag(token: string, repository: string) {
  const response = await fetch(
    `https://hub.docker.com/v2/repositories/${repository}/tags`,
    {
      headers: {
        Authorization: `JWT ${token}`
      }
    }
  )
  const body = await response.json()

  if (!body.results) {
    return null
  }

  const latest = body.results.find(({ name }) => name === 'latest')
  return body.results.find(
    ({ name, images }) =>
      name !== 'latest' && images[0].digest === latest.images[0].digest
  )
}

const IMAGE_NAME_TO_PACKAGE_NAME = {
  styleguide: 'components'
}

async function preventBuildImageFromBeingBuilt() {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
  pkg.scripts['build:image'] = 'echo "Skipping build image creation..."'
  writeFileSync('./package.json', JSON.stringify(pkg))
}
async function ignoreFromBuild(packages: string[]) {
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
  pkg.scripts['build'] =
    pkg.scripts['build'] +
    ' ' +
    packages.map((directory) => `--ignore @opencrvs/${directory}`).join(' ')
  writeFileSync('./package.json', JSON.stringify(pkg))
}
async function isDependencyOf(dependency: string, packageName: string) {
  const pkg = JSON.parse(
    readFileSync(`./packages/${packageName}/package.json`, 'utf8')
  )

  return (
    pkg.dependencies[`@opencrvs/${dependency}`] ||
    pkg.devDependencies[`@opencrvs/${dependency}`]
  )
}

async function run() {
  const compose = yaml.safeLoad(readFileSync('./docker-compose.yml', 'utf8'))

  const token = await getToken()

  // Not sure why but docker hub's API sometimes fails if you query it right after getting a token
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const toPackageName = (serviceName) => {
    const service = compose.services[serviceName]
    const { image } = service
    const repository = image.split(':')[0]
    const imageName = repository.replace('opencrvs/ocrvs-', '')
    return IMAGE_NAME_TO_PACKAGE_NAME[imageName] || imageName
  }
  const serviceNames = Object.keys(compose.services)
  const allPackages = serviceNames.map(toPackageName)
  const packagesThatDontNeedRebuilding = []

  for (const serviceName of serviceNames) {
    const service = compose.services[serviceName]
    const { image } = service
    const repository = image.split(':')[0]
    const packageName = toPackageName(serviceName)

    const latestGitHash = (
      await exec(
        `git --no-pager log -n 1 --format="%h" -- "packages/${packageName}"`
      )
    ).trim()

    const latestTag = await getLatestTag(token, repository)
    if (!latestTag) {
      console.log(
        '⚠️ ',
        serviceName,
        ': no tags found for repository',
        repository
      )
      continue
    }

    const imageHash = latestTag.name

    try {
      // Check that image hash is newer or the same as the latest commit of this package
      await exec(`git merge-base --is-ancestor ${latestGitHash} ${imageHash}`)
      console.log('✅ ', serviceName, ': no rebuild needed')
      service.image = `${repository}:latest`
      delete service.build
      packagesThatDontNeedRebuilding.push(packageName)
    } catch {
      console.log('♻️ ', serviceName, ': rebuilding...')
    }
  }
  writeFileSync('./docker-compose.yml', yaml.safeDump(compose))

  const packagesThatNeedRebuilding = allPackages.filter(
    (packageName) => !packagesThatDontNeedRebuilding.includes(packageName)
  )
  if (packagesThatNeedRebuilding.length === 0) {
    console.log('No packages to rebuild. Removing build image creation step.')
    await preventBuildImageFromBeingBuilt()
  } else {
    /*
     * Rebuild also packages that other rebuilt packages are dependant of
     * For example if client needs to be rebuilt, then components also needs to be part of the build image
     */
    const packagesThatRebuiltPackagesArentDependendOn =
      packagesThatDontNeedRebuilding.filter((packageName) =>
        packagesThatNeedRebuilding.some((rebuiltPackage) =>
          isDependencyOf(packageName, rebuiltPackage)
        )
      )
    console.log(
      'Following packages ignored from build image building',
      packagesThatRebuiltPackagesArentDependendOn
    )

    await ignoreFromBuild(packagesThatRebuiltPackagesArentDependendOn)
  }
}

run()
