<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [OpenCRVS Dashboards](#opencrvs-dashboards)
    - [Run in development mode](#run-in-development-mode)
    - [Default credentials](#default-credentials)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# OpenCRVS Dashboards

### Run in development mode

By default, Metabase is not started as part of the OpenCRVS stack as running it requires quite a bit of resources. You can use the following commands to use metabase in development:

`yarn start` – Starts Metabase in port http://localhost:4444
`yarn db:shell` - Open a SQL shell for the database Metabase created

### Default credentials

These are the default credentials for logging in to Metabase

- Username: `user@opencrvs.org`
- Password: `m3tabase`
