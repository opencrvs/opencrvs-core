#! /bin/sh

ts-node -r tsconfig-paths/register src/bgd/features/administrative/scripts/assign-admin-structure-to-locations.ts
ts-node -r tsconfig-paths/register src/bgd/features/administrative/scripts/assign-geodata-to-locations.ts
ts-node -r tsconfig-paths/register src/bgd/features/administrative/scripts/update-location-data.ts
ts-node -r tsconfig-paths/register src/bgd/features/facilities/scripts/prepare-source-facilities.ts
ts-node -r tsconfig-paths/register src/bgd/features/facilities/scripts/assign-facilities-to-locations.ts
ts-node -r tsconfig-paths/register src/bgd/features/employees/scripts/prepare-source-employees.ts
ts-node -r tsconfig-paths/register src/bgd/features/employees/scripts/assign-employees-to-practitioners.ts
ts-node -r tsconfig-paths/register src/bgd/features/administrative/scripts/prepare-statistical-data.ts
ts-node -r tsconfig-paths/register src/bgd/features/administrative/scripts/add-statistical-data.ts
ts-node -r tsconfig-paths/register src/bgd/features/administrative/scripts/update-statistical-data.ts
