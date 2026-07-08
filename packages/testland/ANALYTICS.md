# OpenCRVS Analytics Documentation

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Sources](#data-sources)
- [How Data Flows to Metabase](#how-data-flows-to-metabase)
- [Available Data in Example Setup](#available-data-in-example-setup)
- [Deployment](#deployment)
- [Development and Dashboard Management](#development-and-dashboard-management)
- [Why Analytics Data is Not Backed Up](#why-analytics-data-is-not-backed-up)
- [Configuration](#configuration)
- [Development Commands](#development-commands)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Overview

OpenCRVS provides comprehensive analytics capabilities through **Metabase**, an open-source business intelligence platform. This system allows stakeholders to visualize and analyze civil registration data through interactive dashboards, charts, and reports.

The analytics system is designed to:
- Track vital events (births, deaths, etc.) and registration statistics
- Provide insights for decision-making and reporting
- Support data-driven improvements to civil registration processes
- Export non-PII datasets as CSV

## Architecture

The analytics system consists of several key components:

```
┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  OpenCRVS Core   │───▶│   Country config │───▶│    Metabase     │
│  Action trigger  │    │   Analytics DB   │    │   Dashboards    │
└──────────────────┘    └──────────────────┘    └─────────────────┘
```

1. **OpenCRVS Core Services**: Submits all performed event actions to country config
2. **PostgreSQL Analytics Database**: Stores processed analytics data in country-defined database. By default this is in PostgreSQL in `analytics` schema
3. **Metabase**: Connects to PostgreSQL and provides visualization capabilities

## Data Sources

OpenCRVS collects analytics data from multiple sources:

### Event Data
- **Birth registrations**: Demographics, locations, registration timing
- **Death registrations**: Cause of death, demographics, locations
- **Custom events**: Additional event types (e.g., tennis club memberships in the example)
- **Registration status**: Draft, registered, certified states
- **Action history**: Workflow actions and state transitions

Country config receives full event documents and can decide which fields should be written into the analytics database and which are PII.

### Configuration-Driven Analytics
The example country config implementation uses configurable analytics fields marked with `analytics: true` in form configurations:

```typescript
// Only fields marked with analytics: true are included
field: {
  id: 'childDetails.firstName',
  analytics: true,  // This field will be tracked
  // ... other field properties
}
```

## How Data Flows to Metabase

1. **Event Processing**: When an event receives an action in OpenCRVS (registration, status changes, etc.), country config HTTP action hooks are triggered and the system processes the action through the analytics pipeline defined in `src/analytics/analytics.ts`

2. **Data Extraction**: The analytics service extracts relevant fields from event documents based on form configuration (only fields marked with `analytics: true`)

3. **Data Transformation**: Raw event data is transformed and enriched with additional calculated metrics (e.g., registration delays, demographic statistics).

4. **Database Storage**: Processed data is stored in PostgreSQL in the `analytics` schema, specifically in the `event_actions` table

5. **Metabase Connection**: Metabase connects directly to the PostgreSQL database using configured credentials and queries the analytics schema

6. **Dashboard Rendering**: Pre-configured dashboards and queries in Metabase visualize the data through charts, tables, and maps

## Deployment

### Production Deployment
Metabase is deployed as a Docker service defined in `infrastructure/docker-compose.deploy.yml`:

```yaml
dashboards:
  image: metabase/metabase:v0.56.4
  volumes:
    - /opt/opencrvs/infrastructure/metabase/metabase.init.db.sql:/metabase.init.db.sql
    - /opt/opencrvs/infrastructure/metabase/run.sh:/run.sh
    # ... other configuration files
  environment:
    # Database connection settings
    - METABASE_DATABASE_HOST=${METABASE_DATABASE_HOST:-postgres}
    - METABASE_DATABASE_NAME=${METABASE_DATABASE_NAME:-events}
    - METABASE_DATABASE_USER=${METABASE_DATABASE_USER:-events_analytics}
    # ... other environment variables
```

### Environment Configuration
The deployment uses environment-specific configurations:
- `infrastructure/metabase/environment-configuration.sql`: Database connections and admin users. **This file does not need to be changed**.
- Environment variables for database credentials and site settings
- Map configurations for geographic visualizations

## Development and Dashboard Management

### ⚠️ Critical: Development vs Production Changes

**Important**: Changes made directly in deployed Metabase environments (staging, production) **WILL NOT PERSIST** and will be reset during the next deployment.

To make persistent dashboard changes:

1. **Work in Development Mode**: Always make changes in your local development environment first
2. **Modify the Source**: Update `infrastructure/metabase/metabase.init.db.sql` by running and using Metabase locally. When you stop the local metabase, all Metabase configuration is stored to this file.
3. **Version Control**: Commit changes to ensure they're deployed to all environments
4. **Deploy**: Changes will only persist across environments when included in the initialization database

### Development Workflow

```bash
# Start Metabase in development mode
yarn metabase

# Access at http://localhost:4444
# Default credentials:
# Username: user@opencrvs.org
# Password: m3tabase
```

### Making Dashboard Changes

1. **Create/modify dashboards** in development Metabase UI
2. **Export the changes** by updating stopping the process
3. **Commit changes** to version control
4. **Deploy** to propagate changes to all environments

### Development Commands

```bash
# Start Metabase in development
yarn metabase

# Clear all analytics data
yarn db:clear:all
```
## Why Analytics Data is Not Backed Up

Analytics data in OpenCRVS is **intentionally not included in backup procedures** for several important reasons:

### 1. **Regenerative Nature**
Analytics data can be completely regenerated from the primary data sources. The analytics tables are derived views of the operational data, not the source of truth.

### 2. **Performance Considerations**
- Analytics databases can be very large (GB to TB scale)
- Including them in backups would significantly increase backup time and storage requirements
- Restore operations would be much slower

## Configuration

### Database Connection
Metabase connects to PostgreSQL using these environment variables:
- `METABASE_DATABASE_HOST`: Database host (default: postgres)
- `METABASE_DATABASE_PORT`: Database port (default: 5432)
- `METABASE_DATABASE_NAME`: Database name (default: events)
- `METABASE_DATABASE_USER`: Database user (default: events_analytics)
- `METABASE_DATABASE_PASSWORD`: Database password

### Analytics Schema
The analytics data is stored in the PostgreSQL `analytics` schema, primarily in:
- `analytics.event_actions`: Main table containing processed event data and action histories

### Map Visualizations
Geographic visualizations use:
- `OPENCRVS_METABASE_MAP_NAME`: Map display name
- `OPENCRVS_METABASE_MAP_URL`: GeoJSON source URL
- `OPENCRVS_METABASE_MAP_REGION_KEY`: Key field for geographic regions
- `OPENCRVS_METABASE_MAP_REGION_NAME`: Display name for regions
