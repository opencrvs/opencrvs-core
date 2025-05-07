--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: secure; Type: SCHEMA; Schema: -; Owner: events_user
--

CREATE SCHEMA secure;


ALTER SCHEMA secure OWNER TO events_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: event_actions; Type: TABLE; Schema: secure; Owner: events_user
--

CREATE TABLE secure.event_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    type text NOT NULL,
    declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text NOT NULL,
    transaction_id text NOT NULL,
    created_by uuid NOT NULL,
    created_at_location text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE secure.event_actions OWNER TO events_user;

--
-- Name: events; Type: TABLE; Schema: secure; Owner: events_user
--

CREATE TABLE secure.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id text NOT NULL,
    type text NOT NULL,
    data jsonb NOT NULL,
    tracking_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE secure.events OWNER TO events_user;

--
-- Name: users; Type: TABLE; Schema: secure; Owner: events_user
--

CREATE TABLE secure.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    mobile text,
    password_hash text NOT NULL,
    salt text NOT NULL,
    role text NOT NULL,
    primary_office_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    inactivated_at timestamp with time zone
);


ALTER TABLE secure.users OWNER TO events_user;

--
-- Name: event_actions event_actions_pkey; Type: CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.event_actions
    ADD CONSTRAINT event_actions_pkey PRIMARY KEY (id);


--
-- Name: event_actions event_actions_transaction_id_key; Type: CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.event_actions
    ADD CONSTRAINT event_actions_transaction_id_key UNIQUE (transaction_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events events_tracking_id_key; Type: CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.events
    ADD CONSTRAINT events_tracking_id_key UNIQUE (tracking_id);


--
-- Name: events events_transaction_id_key; Type: CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.events
    ADD CONSTRAINT events_transaction_id_key UNIQUE (transaction_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_mobile_key; Type: CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.users
    ADD CONSTRAINT users_mobile_key UNIQUE (mobile);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: event_actions event_actions_created_by_fkey; Type: FK CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.event_actions
    ADD CONSTRAINT event_actions_created_by_fkey FOREIGN KEY (created_by) REFERENCES secure.users(id);


--
-- Name: event_actions event_actions_event_id_fkey; Type: FK CONSTRAINT; Schema: secure; Owner: events_user
--

ALTER TABLE ONLY secure.event_actions
    ADD CONSTRAINT event_actions_event_id_fkey FOREIGN KEY (event_id) REFERENCES secure.events(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO events_user;


--
-- PostgreSQL database dump complete
--

