# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
#
# Checks (and where it safely can, fixes) that this machine is ready to develop
# OpenCRVS Core: a supported operating system, the required tooling (Docker,
# Node, pnpm, tmux), a reachable Docker daemon, Docker Compose, and a supported
# Node.js version. It also enables Corepack so pnpm runs at the version pinned
# in package.json.
#
# This is non-destructive: it does not build images, install dependencies, or
# start the stack, so it is safe to run at any time. Because it may run before
# pnpm is configured correctly, invoke it directly rather than through pnpm:
#
#   bash development-environment/check-environment.sh
#
# It is also safe to source from another script that wants the same checks.

set -e

# Resolve the repo root so .nvmrc / package.json resolve no matter which
# directory this is invoked from (works whether executed directly or sourced).
CHECK_ENV_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$CHECK_ENV_DIR/.."

do_version_check() {

   if [ "$1" == "$2" ] ; then
    echo "SAME"
    return "$?"
  fi
   ver1front=`echo $1 | cut -d "." -f -1`
   ver1back=`echo $1 | cut -d "." -f 2-`

   ver2front=`echo $2 | cut -d "." -f -1`
   ver2back=`echo $2 | cut -d "." -f 2-`

   if [ "$ver1front" != "$1" ] || [ "$ver2front" != "$2" ]; then
       if [ "$ver1front" -gt "$ver2front" ] ; then
        echo "GREATER"
        return "$?"
      fi
       if [ "$ver1front" -lt "$ver2front" ] ; then
        echo "LOWER"
        return "$?"
      fi


       [ "$ver1front" == "$1" ] || [ -z "$ver1back" ] && ver1back=0
       [ "$ver2front" == "$2" ] || [ -z "$ver2back" ] && ver2back=0
       do_version_check "$ver1back" "$ver2back"
       return "$?"
   else
      if [ "$1" -gt "$2" ] ; then
        echo "GREATER"
         return "$?"
      else
         echo "LOWER"
         return "$?"
      fi
   fi
}

sleep_if_non_ci() {
  if [ "$CI" != "true" ]; then
    sleep $1
  fi
}

echo
echo -e "\033[32m::::::::::::::::::::: Checking your OpenCRVS environment :::::::::::::::::::::\033[0m"
echo

echo -e "\033[32m:::::::::::::::::::::: Checking your operating system ::::::::::::::::::::::\033[0m"
echo

wslKernelWithUbuntu=false
if  [ -n "$(uname -r | grep microsoft-standard-WSL2)" ] && [ -n "$(cat /etc/os-release | grep Ubuntu)" ]; then
  wslKernelWithUbuntu=true
  echo -e "\033[32m:::::::::::::::: You are running Windows Subsystem for Linux .  Checking distro ::::::::::::::::\033[0m"
  echo
fi

if [  -n "$(uname -a | grep Ubuntu)" ] || [ $wslKernelWithUbuntu == true ]; then
  echo -e "\033[32m:::::::::::::::: You are running Ubuntu.  Checking version ::::::::::::::::\033[0m"
  echo

  OS="UBUNTU"
  ubuntuVersion="$(grep -oP 'VERSION_ID="\K[\d.]+' /etc/os-release)"
  ubuntuVersionTest=$(do_version_check $ubuntuVersion 20.04)
  if [ "$ubuntuVersionTest" == "LOWER" ] ; then
    echo "Sorry your Ubuntu version is not supported.  You must upgrade Ubuntu to 20.04"
    echo "Follow the instructions here: https://ubuntu.com/tutorials/upgrading-ubuntu-desktop#1-before-you-start"
    exit 1
  else
    echo -e "Your Ubuntu version: $ubuntuVersion is \033[32msupported!\033[0m :)"
    echo

    echo -e "\033[32m:::::::: Setting memory requirements for file watch limit and ElasticSearch ::::::::\033[0m"
    echo

    if grep -Fxq "fs.inotify.max_user_watches=524288" /etc/sysctl.conf ; then
        echo "File watch limit already meets requirements."
    else
        echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
    fi

    if grep -Fxq "vm.max_map_count=262144" /etc/sysctl.conf ; then
        echo "Max map count already meets requirements."
    else
        echo vm.max_map_count=262144 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
    fi
  fi
elif [ "$(uname)" == "Darwin" ]; then
  echo -e "\033[32m::::::::::::::::::::::::: You are running Mac OSX. :::::::::::::::::::::::::\033[0m"
  echo
  OS="MAC"
  export NODE_OPTIONS="--dns-result-order=ipv4first"
else
  echo "Sorry your operating system is not supported."
  echo "YOU MUST BE RUNNING A SUPPORTED OS: MAC or UBUNTU > 18.04"
  exit 1
fi

echo -e "\033[32m:::::::: Checking that you have the required dependencies installed ::::::::\033[0m"
echo

# Reads .nvmrc and trims the whitespace
nvmVersion=$(cat .nvmrc | tr -d '[:space:]')

# Reads the pinned pnpm version from the "packageManager" field in package.json
pnpmVersion=$(grep '"packageManager"' package.json | sed -E 's/.*pnpm@([0-9.]+).*/\1/')

# Corepack (bundled with Node) provisions the exact pnpm version pinned in the
# "packageManager" field. Enable it up front so the pnpm checks below resolve to
# the correct version instead of whatever pnpm the developer happens to have.
# Best-effort: if corepack isn't available yet (Node not installed) or the shim
# can't be written (e.g. a system Node install that needs sudo), fall through to
# the manual guidance in the dependency checks below.
if which corepack >/dev/null 2>&1; then
    if corepack enable pnpm >/dev/null 2>&1; then
        echo -e "✅ corepack \033[32menabled — pnpm will use the pinned $pnpmVersion inside this repo\033[0m"
    else
        echo -e "\033[33m⚠️  Could not run 'corepack enable pnpm' automatically (you may need sudo, or a globally-installed pnpm may be shadowing it).\033[0m"
        echo "If the pnpm version check below fails, enable it manually with: corepack enable pnpm"
    fi
    echo
fi

dependencies=( "docker" "node" "pnpm" "tmux")

for i in "${dependencies[@]}"
do
   :
    if which $i >/dev/null; then

        echo -e "✅ $i \033[32minstalled!\033[0m :)"

        if [ $i == "pnpm" ] ; then
            installedPnpm=$(pnpm --version)
            if [ "$installedPnpm" != "$pnpmVersion" ] ; then
                echo -e "\033[33m⚠️  pnpm $installedPnpm is installed, but this project is pinned to pnpm $pnpmVersion (see the \"packageManager\" field in package.json).\033[0m"
                echo "Running a different pnpm version can rewrite pnpm-lock.yaml in an incompatible format."
                echo "The recommended fix is to let Corepack (bundled with Node) manage the version for you:"
                echo
                echo "  corepack enable pnpm"
                echo
                echo "Corepack will then automatically run the pinned pnpm version inside this repo."
                echo "If a globally-installed pnpm still shadows it afterwards, remove that global install (or ensure the Corepack shim comes first on your PATH)."
                # A mismatched major version WILL corrupt the lockfile, so stop here.
                if [ "${installedPnpm%%.*}" != "${pnpmVersion%%.*}" ] ; then
                    echo
                    echo -e "\033[31m::::::::::::::: pnpm major version mismatch - please fix the above before continuing :::::::::::::::\033[0m"
                    echo
                    exit 1
                fi
            fi
        fi

        sleep_if_non_ci 1
    else
        echo -e "OpenCRVS thinks $i is not installed.\r"
        if [ $i == "docker" ] ; then
            if [ $OS == "UBUNTU" ]; then
                echo "You need to install Docker, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker installation."
                echo "Please follow the documentation here: https://docs.docker.com/engine/install/ubuntu/"
            else
                echo "You need to install Docker Desktop for Mac, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your docker installation."
                echo "Please follow the documentation here: https://docs.docker.com/desktop/mac/install/"
            fi
        fi

        if [ $i == "node" ] ; then
            echo "You need to install Node, or if you did, we can't find it and perhaps it is not in your PATH. Please fix your node installation."
            echo "We recommend you install Node $nvmVersion as this release has been tested on that version."
            echo "There are various ways you can install Node.  The easiest way to get Node running with the version of your choice is using Node Version Manager."
            echo "Documentation is here: https://nodejs.org/en/download/package-manager/#nvm.  For example run:\033[0m"
            echo "curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash"
            echo "Then use nvm to install the Node version of choice.  For example run:\033[0m"
            echo
            echo "nvm install $nvmVersion"
            echo
            echo "When the version is installed, use it:"
            echo
            echo "nvm use $nvmVersion"
            echo
            echo "Finally set the version to be the default:"
            echo
            echo "nvm alias default $nvmVersion"
        fi
        if [ $i == "pnpm" ] ; then
           echo "OpenCRVS uses the pnpm package manager for Node."
           echo "This project pins pnpm $pnpmVersion via the \"packageManager\" field in package.json."
           echo "The easiest way to install it is with Corepack, which ships with Node:"
           echo
           echo "  corepack enable pnpm"
           echo
           echo "This will automatically provide the pinned pnpm version inside this repo."
           echo "Alternatively, install pnpm manually following the documentation here: https://pnpm.io/installation"
        fi
        if [ $i == "tmux" ] ; then
          if [ $OS == "UBUNTU" ]; then
              echo "OpenCRVS requires multiple terminal windows open in order to run OpenCRVS Core alongside the default country configuration."
              echo -e "\033[32m::::::::::::: We want to install the tool tmux to do this. :::::::::::::\033[0m"
              echo
              echo -e "\033[32m::::::::::::: Run this command: sudo apt-get install tmux :::::::::::::\033[0m"
          else
              echo "OpenCRVS requires multiple terminal windows open in order to run OpenCRVS Core alongside the default country configuration."
              echo
              echo "We use the tool tmux to do this.  Please install it following the documentation here: https://github.com/tmux/tmux/wiki"
          fi
        fi
        echo
        echo -e "\033[32m::::::::::::::: After $i is installed please try again :::::::::::::::\033[0m"
        echo
        exit 1
    fi
done

###
#
# Check that this user can actually talk to the Docker daemon
#
# Finding `docker` on PATH says nothing about being allowed to use it: on Linux
# a fresh install leaves /var/run/docker.sock owned by the `docker` group, and
# the current user is not in that group until they are added and their session
# is renewed. `pnpm dev` needs the daemon, so without this the first symptom is
# a bare permission error from a compose command well into the run.
#
# Deliberately ordered before the Compose check below, which is answered by the
# CLI alone and so cannot distinguish "no plugin" from "cannot reach daemon".
# Reaching the daemon is the more fundamental of the two, and asking first is
# what lets the permission case get an answer it can act on.
#
# This reports; it does not fix. Adding a user to a group needs sudo, and a
# check that is safe to run at any time should not be changing group
# membership.
#
###

dockerDaemonError=$(docker info 2>&1 >/dev/null) || true

if [ -n "$dockerDaemonError" ]; then
    if echo "$dockerDaemonError" | grep -qi "permission denied"; then
        echo "❌ Docker is installed, but this user is not allowed to use it."
        echo "The Docker socket is readable only by the 'docker' group, and $USER is not in it."

        if [ $OS == "UBUNTU" ]; then
            echo "Add yourself to the group:"
            echo
            echo -e "  \033[32msudo usermod -aG docker $USER\033[0m"
            echo
            echo "Group membership is picked up when your session starts, so log out and"
            echo "back in afterwards (or run 'newgrp docker' in this shell to test it now)."
            echo "Full instructions: https://docs.docker.com/engine/install/linux-postinstall/"
        else
            echo "Please check your Docker Desktop installation:"
            echo "https://docs.docker.com/desktop/mac/install/"
        fi
    else
        echo "❌ Docker is installed, but its daemon is not reachable."
        echo

        if [ $OS == "UBUNTU" ]; then
            echo "Start it with: sudo systemctl start docker"
        else
            echo "Start Docker Desktop and wait for it to report that it is running."
        fi

        echo
        echo "Docker reported:"
        echo "$dockerDaemonError"
    fi

    exit 1
fi

echo -e "The Docker daemon is \033[32mreachable!\033[0m :)"

###
#
# Check if Docker Compose exists
#
###

if ! docker compose version &> /dev/null
then
    echo "Docker Compose is not available in your Docker installation"
    echo "Your Docker version may be too old to include Docker Compose as part of the Docker CLI."

    if [ $OS == "UBUNTU" ]; then
        echo "Please follow the installation instructions here: https://docs.docker.com/engine/install/ubuntu/"
    else
        echo "Please follow the installation instructions here: https://docs.docker.com/desktop/mac/install/"
    fi

    exit 1
fi

###
#
# Check Node.js version
#
###

echo
echo -e "\033[32m:::::: NOW WE NEED TO CHECK THAT YOUR NODE VERSION IS SUPPORTED ::::::\033[0m"
echo

versionCheckOutput=$(npx --yes check-node-version --package --print 2>&1 || true)
currentVersion=$(echo "$versionCheckOutput" | grep 'node:' | awk '{print $2}')

if echo "$versionCheckOutput" | grep -q 'Wanted node version'; then
  echo "❌ Sorry, your Node version is not supported. Your node version is $currentVersion."
  echo "We recommend you install Node version $nvmVersion as this release has been tested on that version."
  echo "Documentation is here: https://nodejs.org/en/download/package-manager/#nvm"
  echo "Then use nvm to install the Node version of choice. For example run:"
  echo "nvm install $nvmVersion"
  exit 1
else
  echo -e "Your Node version: $currentVersion is \033[32msupported!\033[0m :)"
fi

echo
echo -e "\033[32m::::::::::::::::: ✅ Your OpenCRVS environment looks good! :::::::::::::::::\033[0m"
echo

# When run directly (not sourced), point the developer at next steps. `pnpm dev`
# is the whole bootstrap: it starts the shared dependencies, provisions this
# environment's database and runs the stack. See
# docs/adr/0004-storybook-api-docs-and-bootstrap-leave-the-dev-stack.md.
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "You're ready to go. Start the development stack with:"
  echo
  echo -e "  \033[32mpnpm dev\033[0m"
  echo
  echo "Then seed it with data: pnpm seed:dev"
  echo
fi
