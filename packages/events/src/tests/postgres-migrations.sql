--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)


-- Started on 2025-08-18 09:50:00 UTC

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
-- Name: app; Type: SCHEMA; Schema: -; Owner: events_migrator
--

CREATE SCHEMA app;


ALTER SCHEMA app OWNER TO events_migrator;

--
-- Name: action_status; Type: TYPE; Schema: app; Owner: events_migrator
--

CREATE TYPE app.action_status AS ENUM (
    'Requested',
    'Accepted',
    'Rejected'
);


ALTER TYPE app.action_status OWNER TO events_migrator;

--
-- Name: action_type; Type: TYPE; Schema: app; Owner: events_migrator
--

CREATE TYPE app.action_type AS ENUM (
    'CREATE',
    'NOTIFY',
    'DECLARE',
    'VALIDATE',
    'REGISTER',
    'DETECT_DUPLICATE',
    'REJECT',
    'MARKED_AS_DUPLICATE',
    'ARCHIVE',
    'PRINT_CERTIFICATE',
    'REQUEST_CORRECTION',
    'CORRECT',
    'REJECT_CORRECTION',
    'APPROVE_CORRECTION',
    'READ',
    'ASSIGN',
    'UNASSIGN'
);


ALTER TYPE app.action_type OWNER TO events_migrator;

--
-- Name: user_type; Type: TYPE; Schema: app; Owner: events_migrator
--

CREATE TYPE app.user_type AS ENUM (
    'system',
    'user'
);


ALTER TYPE app.user_type OWNER TO events_migrator;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: event_action_drafts; Type: TABLE; Schema: app; Owner: events_migrator
--

CREATE TABLE app.event_action_drafts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id text NOT NULL,
    event_id uuid NOT NULL,
    action_type app.action_type NOT NULL,
    declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
    annotation jsonb,
    created_by text NOT NULL,
    created_by_role text NOT NULL,
    created_by_user_type app.user_type NOT NULL,
    created_by_signature text,
    created_at_location uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.event_action_drafts OWNER TO events_migrator;

--
-- Name: TABLE event_action_drafts; Type: COMMENT; Schema: app; Owner: events_migrator
--

COMMENT ON TABLE app.event_action_drafts IS 'Stores user-specific drafts of event-related actions. Drafts use client-supplied transaction_id for idempotency. Declaration fields may be incomplete. Each draft is owned exclusively by created_by.';


--
-- Name: event_actions; Type: TABLE; Schema: app; Owner: events_migrator
--

CREATE TABLE app.event_actions (
    action_type app.action_type NOT NULL,
    annotation jsonb,
    assigned_to text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at_location uuid,
    created_by text NOT NULL,
    created_by_role text NOT NULL,
    created_by_signature text,
    created_by_user_type app.user_type NOT NULL,
    declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
    event_id uuid NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    original_action_id uuid,
    reason_is_duplicate boolean,
    reason_message text,
    registration_number text,
    request_id text,
    status app.action_status NOT NULL,
    transaction_id text NOT NULL,
    content jsonb,
    CONSTRAINT event_actions_check CHECK ((((action_type = 'ASSIGN'::app.action_type) AND (assigned_to IS NOT NULL)) OR ((action_type = 'UNASSIGN'::app.action_type) AND (assigned_to IS NULL)) OR ((action_type = 'REGISTER'::app.action_type) AND (status = 'Accepted'::app.action_status) AND (registration_number IS NOT NULL)) OR ((action_type = 'REGISTER'::app.action_type) AND (status = 'Requested'::app.action_status) AND (registration_number IS NULL)) OR ((action_type = 'REGISTER'::app.action_type) AND (status = 'Rejected'::app.action_status) AND (registration_number IS NULL)) OR ((action_type = 'REJECT'::app.action_type) AND ((reason_message IS NULL) OR (reason_message <> ''::text)) AND (reason_is_duplicate IS NOT NULL)) OR ((action_type = 'REJECT_CORRECTION'::app.action_type) AND (request_id IS NOT NULL)) OR ((action_type = 'APPROVE_CORRECTION'::app.action_type) AND (request_id IS NOT NULL)) OR (action_type <> ALL (ARRAY['ASSIGN'::app.action_type, 'UNASSIGN'::app.action_type, 'REGISTER'::app.action_type, 'REJECT'::app.action_type, 'REJECT_CORRECTION'::app.action_type, 'APPROVE_CORRECTION'::app.action_type]))))
);


ALTER TABLE app.event_actions OWNER TO events_migrator;

--
-- Name: TABLE event_actions; Type: COMMENT; Schema: app; Owner: events_migrator
--

COMMENT ON TABLE app.event_actions IS 'Stores actions performed on life events, including client-supplied transaction_id for idempotency. Event actions cannot be updated or deleted by the application database user. The same transaction id can only create action of one type. Each action is linked to a specific event.';


--
-- Name: COLUMN event_actions.original_action_id; Type: COMMENT; Schema: app; Owner: events_migrator
--

COMMENT ON COLUMN app.event_actions.original_action_id IS 'References the original action if this is an asynchronous confirmation of it.';


--
-- Name: events; Type: TABLE; Schema: app; Owner: events_migrator
--

CREATE TABLE app.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    transaction_id text NOT NULL,
    tracking_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE app.events OWNER TO events_migrator;

--
-- Name: TABLE events; Type: COMMENT; Schema: app; Owner: events_migrator
--

COMMENT ON TABLE app.events IS 'Stores life events associated with individuals, identified by tracking_id. Each event includes a type, structured data payload, and a client-supplied transaction_id to ensure idempotency.';


--
-- Name: locations; Type: TABLE; Schema: app; Owner: events_migrator
--

CREATE TABLE app.locations (
    id uuid NOT NULL,
    name text NOT NULL,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE app.locations OWNER TO events_migrator;

--
-- Name: pgmigrations; Type: TABLE; Schema: app; Owner: events_migrator
--

CREATE TABLE app.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


ALTER TABLE app.pgmigrations OWNER TO events_migrator;

--
-- Name: pgmigrations_id_seq; Type: SEQUENCE; Schema: app; Owner: events_migrator
--

CREATE SEQUENCE app.pgmigrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE app.pgmigrations_id_seq OWNER TO events_migrator;

--
-- Name: pgmigrations_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: events_migrator
--

ALTER SEQUENCE app.pgmigrations_id_seq OWNED BY app.pgmigrations.id;


--
-- Name: pgmigrations id; Type: DEFAULT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.pgmigrations ALTER COLUMN id SET DEFAULT nextval('app.pgmigrations_id_seq'::regclass);


--
-- Name: event_action_drafts event_action_drafts_event_id_created_by_key; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_action_drafts
    ADD CONSTRAINT event_action_drafts_event_id_created_by_key UNIQUE (event_id, created_by);


--
-- Name: event_action_drafts event_action_drafts_pkey; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_action_drafts
    ADD CONSTRAINT event_action_drafts_pkey PRIMARY KEY (id);


--
-- Name: event_actions event_actions_pkey; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_actions
    ADD CONSTRAINT event_actions_pkey PRIMARY KEY (id);


--
-- Name: event_actions event_actions_registration_number_key; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_actions
    ADD CONSTRAINT event_actions_registration_number_key UNIQUE (registration_number);


--
-- Name: event_actions event_actions_transaction_id_action_type_status_key; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_actions
    ADD CONSTRAINT event_actions_transaction_id_action_type_status_key UNIQUE (transaction_id, action_type, status);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events events_tracking_id_key; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.events
    ADD CONSTRAINT events_tracking_id_key UNIQUE (tracking_id);


--
-- Name: events events_transaction_id_event_type_key; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.events
    ADD CONSTRAINT events_transaction_id_event_type_key UNIQUE (transaction_id, event_type);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: pgmigrations pgmigrations_pkey; Type: CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.pgmigrations
    ADD CONSTRAINT pgmigrations_pkey PRIMARY KEY (id);


--
-- Name: event_action_drafts event_action_drafts_created_at_location_fkey; Type: FK CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_action_drafts
    ADD CONSTRAINT event_action_drafts_created_at_location_fkey FOREIGN KEY (created_at_location) REFERENCES app.locations(id);


--
-- Name: event_action_drafts event_action_drafts_event_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_action_drafts
    ADD CONSTRAINT event_action_drafts_event_id_fkey FOREIGN KEY (event_id) REFERENCES app.events(id) ON DELETE CASCADE;


--
-- Name: event_actions event_actions_created_at_location_fkey; Type: FK CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_actions
    ADD CONSTRAINT event_actions_created_at_location_fkey FOREIGN KEY (created_at_location) REFERENCES app.locations(id);


--
-- Name: event_actions event_actions_event_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_actions
    ADD CONSTRAINT event_actions_event_id_fkey FOREIGN KEY (event_id) REFERENCES app.events(id);


--
-- Name: event_actions event_actions_original_action_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.event_actions
    ADD CONSTRAINT event_actions_original_action_id_fkey FOREIGN KEY (original_action_id) REFERENCES app.event_actions(id);


--
-- Name: locations locations_parent_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: events_migrator
--

ALTER TABLE ONLY app.locations
    ADD CONSTRAINT locations_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES app.locations(id);


--
-- Name: SCHEMA app; Type: ACL; Schema: -; Owner: events_migrator
--

GRANT USAGE ON SCHEMA app TO events_app;


--
-- Name: TABLE event_action_drafts; Type: ACL; Schema: app; Owner: events_migrator
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.event_action_drafts TO events_app;


--
-- Name: TABLE event_actions; Type: ACL; Schema: app; Owner: events_migrator
--

GRANT SELECT,INSERT,DELETE ON TABLE app.event_actions TO events_app;


--
-- Name: TABLE events; Type: ACL; Schema: app; Owner: events_migrator
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.events TO events_app;


--
-- Name: TABLE locations; Type: ACL; Schema: app; Owner: events_migrator
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE app.locations TO events_app;


-- Completed on 2025-08-18 09:50:01 UTC

--
-- PostgreSQL database dump complete
--

