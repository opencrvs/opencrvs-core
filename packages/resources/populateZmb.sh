#! /bin/sh

ts-node -r tsconfig-paths/register src/zmb/features/administrative/scripts/prepare-locations.ts
ts-node -r tsconfig-paths/register src/zmb/features/administrative/scripts/assign-admin-structure-to-locations.ts
ts-node -r tsconfig-paths/register src/zmb/features/facilities/scripts/prepare-source-facilities.ts
ts-node -r tsconfig-paths/register src/zmb/features/facilities/scripts/assign-facilities-to-locations.ts