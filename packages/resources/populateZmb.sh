#! /bin/sh

ts-node -r tsconfig-paths/register src/zmb/features/administrative/scripts/prepare-locations.ts
ts-node -r tsconfig-paths/register src/zmb/features/administrative/scripts/assign-admin-structure-to-locations.ts