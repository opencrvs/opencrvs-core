CREATE DATABASE events;

CREATE ROLE events_migrator WITH LOGIN PASSWORD 'migrator_password';
CREATE ROLE events_app WITH LOGIN PASSWORD 'app_password';

GRANT CONNECT ON DATABASE events TO events_migrator, events_app;

\connect events

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM events_migrator;

CREATE SCHEMA app AUTHORIZATION events_migrator;

ALTER ROLE events_migrator SET search_path = app;
ALTER ROLE events_app SET search_path = app;
