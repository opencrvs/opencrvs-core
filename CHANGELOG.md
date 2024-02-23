## [1.3.3](https://github.com/opencrvs/opencrvs-core/compare/v1.3.2...v1.3.3) (TBD)

## Breaking changes

## New features

- #### New handlebars serving the location ids of the admin level locations
  Apart from the new handlebars, a couple more improvements were introduced:
  - stricter type for locations in client
  - **"location"** handlebar helper can now resolve offices & facilities
  - restrict the properties exposed through **"location"** handlebar helper
  - remove deprecated **DIVISION** & **UNION** from client

## Bug fixes

- #### Fix location seeding scripts throwing error when there are too many source locations from the country config
  Locations are now seeded in smaller segments instead of one big collection. The newer approach has improved performance to a significant extent and also clears the interruption caused for a large number of country config locations
- Filter user information such as usernames and authentication codes from server logs
- Core not recognizing "occupation" as an optional field for deceased
- Unassign declaration from a user if the declaration has already been proceeded through the workqueues by a separate user

## Dependency upgrades
- #### Metabase from v0.45.2.1 to v0.46.6.1

See [Releases](https://github.com/opencrvs/opencrvs-core/releases) for release notes of older releases.
