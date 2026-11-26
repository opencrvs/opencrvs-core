# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -e

write=false
outdated=false

for i in "$@"; do
  case $i in
    --outdated)
      outdated=true
      shift
      ;;
    --write)
      write=true
      shift
      ;;
    -*)
      echo "Unknown option $i"
      exit 1
      ;;
    *)
      # lint-staged appends the staged filenames; the check always covers the
      # whole package, so they are ignored.
      ;;
  esac
done

flag=""
if $outdated; then
  flag=--outdated
elif $write; then
  flag=--write
elif [ "$CI" = true ]; then
  flag=--ci
fi

packages="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

status=0

for target in countryconfig-template testland; do
  echo "Checking $target..."
  pnpm exec tsx src/extract-translations.ts "$packages/$target" $flag || status=1
done

exit $status
