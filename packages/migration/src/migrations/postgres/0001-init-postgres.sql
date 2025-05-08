CREATE DATABASE events;
CREATE USER events_user WITH ENCRYPTED PASSWORD 'password';
GRANT CONNECT ON DATABASE events TO events_user;

\connect events

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO events_user;
CREATE SCHEMA secure AUTHORIZATION events_user;
