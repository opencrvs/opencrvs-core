<!--
 - This Source Code Form is subject to the terms of the Mozilla Public
 - License, v. 2.0. If a copy of the MPL was not distributed with this
 - file, You can obtain one at https://mozilla.org/MPL/2.0/.
 -
 - OpenCRVS is also distributed under the terms of the Civil Registration
 - & Healthcare Disclaimer located at http://opencrvs.org/license.
 -
 - Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
-->

# Location seeding

`source/locations.csv` and `source/administrative-areas.csv` define the base offices/facilities and admin structure served by `/config/locations`. `source/location-versions.csv` and `source/administrative-area-versions.csv` layer version history (renames/inactivations) on top of specific rows from those files, referenced by id.

## Version CSV columns

`locationId` (or `administrativeAreaId`), `effectiveFrom`, `name`, `status`.

- Group rows by their reference id to build one location/admin area's `versions[]` array.
- Leave `effectiveFrom` empty on a version to mean "since creation" — it's the base/first entry and always sorts first.
- Every other version needs a real `effectiveFrom` date (`YYYY-MM-DD`), marking when it took over from the previous one.

## `FUTURE-N` sentinel

Use `FUTURE-N` (e.g. `FUTURE-4`) as `effectiveFrom` for a version that shouldn't be selectable yet. It resolves to _N days from whenever `/config/locations` is actually requested_, not a fixed date — so a "not yet effective" fixture stays not-yet-effective no matter when tests run, instead of quietly going stale once a hardcoded future date passes.
