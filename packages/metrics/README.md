<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents**

- [Metrics service](#metrics-service)
  - [Dev guide](#dev-guide)
  - [Design details](#design-details)
    - [Adding new metrics later on](#adding-new-metrics-later-on)
  - [Database](#database)
    - [Try it](#try-it)
      - [Test queries](#test-queries)
    - [Browse the data with Chronograf](#browse-the-data-with-chronograf)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Metrics service

A microservice that recieves events from the OpenCRVS system and create, stores and responds to queries about CRVS metrics. This service will be used in the preformance app to fetch data for the various graphs that need to be displayed.

## Dev guide

Start the service with `pnpm start`

Watch the tests with `pnpm test:watch`

When in dev mode swagger API docs are available at `http://localhost:1050/documentation`

## Design details

[Flowdock thread](https://www.flowdock.com/app/plan-international/ways-of-working/threads/3JH4c_aw6_MDyZ6nwwwDbRV_LEh)

The metrics service will contain data that has already been aggregated from received events (new declaration, registration...). The metrics service will get these events from a generic **event service**, that receives events from our workflow mediator, pushing them forward to any service that's subscribed to it.

Some parts (how event service receives and emits events) of this dataflow is documented in the [Integrations API/mediator design document](https://docs.google.com/document/d/1GUmWs7ZBOH9enKMtr9hLj5WKqb1P7HzdX8RfGNrotMs/edit#)

For the example query above, we might store something like this:

| age | count |
| --- | ----- |
| 45d | 12312 |
| 1   | 13506 |
| 2   | 12000 |
| 3   | 12000 |

### Adding new metrics later on

Collecting live events like this has a downside: we cannot predict what kind of metrics we want to show in the future and once we add a new metric, we have no data for it.
In these cases we will write migrations that fetch already stored data from hearth and push it to our metric service.

---

## Database

We've decided to go with [InfluxDB](https://www.influxdata.com/) which is a time series database, designed to store information about metrics and events.

- [InfluxDB Docker image](https://hub.docker.com/_/influxdb/)
- [InfluxDB documentation](https://docs.influxdata.com/influxdb)

### Try it

**Create database**

```sql
CREATE DATABASE "my_database"
```

**Insert test data**

```sql
USE "my_database"
```

```sql
INSERT registration_age,location=london,current_status=declared,gender=m age_in_days=1 1542271267000000000
INSERT registration_age,location=helsinki,current_status=declared,gender=f age_in_days=1 1542271268000000000
INSERT registration_age,location=london,current_status=declared,gender=m age_in_days=2 1542271269000000000
INSERT registration_age,location=tokyo,current_status=declared,gender=f age_in_days=34 1542271270000000000
INSERT registration_age,location=helsinki,current_status=declared,gender=m age_in_days=43 1542271271000000000
INSERT registration_age,location=london,current_status=declared,gender=f age_in_days=5 1542271272000000000
INSERT registration_age,location=london,current_status=registered,gender=f age_in_days=233 1542271273000000000
INSERT registration_age,location=tokyo,current_status=registered,gender=m age_in_days=125 1542271274000000000
INSERT registration_age,location=london,current_status=registered,gender=f age_in_days=5 1542271275000000000
INSERT registration_age,location=london,current_status=registered,gender=m age_in_days=23 1542271276000000000
INSERT registration_age,location=tokyo,current_status=registered,gender=m age_in_days=601 1542271277000000000
INSERT registration_age,location=london,current_status=registered,gender=f age_in_days=62 1542271278000000000
INSERT registration_age,location=london,current_status=registered,gender=m age_in_days=6 1542271279000000000
INSERT registration_age,location=helsinki,current_status=registered,gender=m age_in_days=400 1542271280000000000
```

#### Test queries

**Number of registered males in London within 45d**

```sql
> SELECT COUNT(*) FROM registration_age WHERE age_in_days < 45 AND location = 'london' AND gender='m'
name: registration_age
time count_age_in_days
---- -----------------
0    4
```

**Number of children registered at the age of X (grouping)**

For this query, you first need to add `age_in_years` column to the test data. You can modify the query above to add the column. InfluxDB doesn't support `GROUP BY` keyword for anything except for `time` field and tags, so doing a subquery for first dynamically calculating the years from the days would not work.

```sql
> select * from registration_age
name: registration_age
time                age_in_days age_in_years current_status gender location
----                ----------- ------------ -------------- ------ --------
1542271268000000000 1           0            declared       f      helsinki
1542271269000000000 2           0            declared       m      london
1542271270000000000 34          0            declared       f      tokyo
1542271271000000000 43          0            declared       m      helsinki
1542271272000000000 5           0            declared       f      london
1542271273000000000 233         1            registered     f      london
1542271274000000000 125         0            registered     m      tokyo
1542271275000000000 5           0            registered     f      london
1542271276000000000 23          0            registered     m      london
1542271277000000000 601         2            registered     m      tokyo
1542271278000000000 62          0            registered     f      london
1542271279000000000 6           0            registered     m      london
1542271280000000000 400         1            registered     m      helsinki

> SELECT COUNT(*) FROM registration_age GROUP BY age_in_years
name: registration_age
tags: age_in_years=0
time count_age_in_days
---- -----------------
0    10

name: registration_age
tags: age_in_years=1
time count_age_in_days
---- -----------------
0    2

name: registration_age
tags: age_in_years=2
time count_age_in_days
---- -----------------
0    1
```

### Browse the data with [Chronograf](https://www.influxdata.com/time-series-platform/chronograf/)

- Run `docker run -p 5656:8888 quay.io/influxdb/chronograf`
- Open up http://localhost:5656
- The UI will now ask you for connection details. Using `localhost:8086` does NOT work here, and will not connect. Instead you have to use `<your local ip>:8086`
