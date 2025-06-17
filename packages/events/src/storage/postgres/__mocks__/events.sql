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
-- Name: app; Type: SCHEMA; Schema: -; Owner: -
--

-- CREATE SCHEMA app;


--
-- Name: action_status; Type: TYPE; Schema: app; Owner: -
--

CREATE TYPE public.action_status AS ENUM (
    'Requested',
    'Accepted',
    'Rejected'
);


--
-- Name: action_type; Type: TYPE; Schema: app; Owner: -
--

CREATE TYPE public.action_type AS ENUM (
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
    'REJECT_CORRECTION',
    'APPROVE_CORRECTION',
    'READ',
    'ASSIGN',
    'UNASSIGN'
);


SET default_table_access_method = heap;

--
-- Name: event_action_drafts; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE public.event_action_drafts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id text NOT NULL,
    event_id uuid NOT NULL,
    action_type public.action_type NOT NULL,
    declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
    annotation jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by text NOT NULL,
    created_by_role text NOT NULL,
    created_by_signature text,
    created_at_location uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: event_actions; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE public.event_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_type public.action_type NOT NULL,
    annotation jsonb DEFAULT '{}'::jsonb NOT NULL,
    assigned_to text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at_location uuid,
    created_by text NOT NULL,
    created_by_role text NOT NULL,
    created_by_signature text,
    declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
    event_id uuid NOT NULL,
    original_action_id uuid,
    reason_is_duplicate boolean,
    reason_message text,
    registration_number text,
    status public.action_status NOT NULL,
    transaction_id text NOT NULL,
    CONSTRAINT event_actions_check CHECK ((((action_type = 'ASSIGN'::public.action_type) AND (assigned_to IS NOT NULL)) OR ((action_type = 'UNASSIGN'::public.action_type) AND (assigned_to IS NULL)) OR ((action_type = 'REGISTER'::public.action_type) AND (registration_number IS NOT NULL)) OR ((action_type = 'REJECT'::public.action_type) AND (reason_message IS NOT NULL) AND (reason_message <> ''::text) AND (reason_is_duplicate IS NOT NULL)) OR (NOT (action_type = ANY (ARRAY['ASSIGN'::public.action_type, 'UNASSIGN'::public.action_type, 'REGISTER'::public.action_type, 'REJECT'::public.action_type])))))
);


--
-- Name: events; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    transaction_id text NOT NULL,
    tracking_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: locations; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    external_id text,
    name text NOT NULL,
    parent_id uuid
);


--
-- Name: pgmigrations; Type: TABLE; Schema: app; Owner: -
--

CREATE TABLE public.pgmigrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


--
-- Name: pgmigrations_id_seq; Type: SEQUENCE; Schema: app; Owner: -
--

CREATE SEQUENCE public.pgmigrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pgmigrations_id_seq; Type: SEQUENCE OWNED BY; Schema: app; Owner: -
--

ALTER SEQUENCE public.pgmigrations_id_seq OWNED BY public.pgmigrations.id;


--
-- Name: pgmigrations id; Type: DEFAULT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.pgmigrations ALTER COLUMN id SET DEFAULT nextval('public.pgmigrations_id_seq'::regclass);


--
-- Name: event_action_drafts event_action_drafts_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_action_drafts
    ADD CONSTRAINT event_action_drafts_pkey PRIMARY KEY (id);


--
-- Name: event_action_drafts event_action_drafts_transaction_id_action_type_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_action_drafts
    ADD CONSTRAINT event_action_drafts_transaction_id_action_type_key UNIQUE (transaction_id, action_type);


--
-- Name: event_actions event_actions_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_actions
    ADD CONSTRAINT event_actions_pkey PRIMARY KEY (id);


--
-- Name: event_actions event_actions_registration_number_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_actions
    ADD CONSTRAINT event_actions_registration_number_key UNIQUE (registration_number);


--
-- Name: event_actions event_actions_transaction_id_action_type_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_actions
    ADD CONSTRAINT event_actions_transaction_id_action_type_key UNIQUE (transaction_id, action_type);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events events_tracking_id_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tracking_id_key UNIQUE (tracking_id);


--
-- Name: events events_transaction_id_event_type_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_transaction_id_event_type_key UNIQUE (transaction_id, event_type);


--
-- Name: locations locations_external_id_key; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_external_id_key UNIQUE (external_id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: pgmigrations pgmigrations_pkey; Type: CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.pgmigrations
    ADD CONSTRAINT pgmigrations_pkey PRIMARY KEY (id);


--
-- Name: event_action_drafts event_action_drafts_created_at_location_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_action_drafts
    ADD CONSTRAINT event_action_drafts_created_at_location_fkey FOREIGN KEY (created_at_location) REFERENCES public.locations(id);


--
-- Name: event_action_drafts event_action_drafts_event_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_action_drafts
    ADD CONSTRAINT event_action_drafts_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_actions event_actions_created_at_location_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_actions
    ADD CONSTRAINT event_actions_created_at_location_fkey FOREIGN KEY (created_at_location) REFERENCES public.locations(id);


--
-- Name: event_actions event_actions_event_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_actions
    ADD CONSTRAINT event_actions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: event_actions event_actions_original_action_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.event_actions
    ADD CONSTRAINT event_actions_original_action_id_fkey FOREIGN KEY (original_action_id) REFERENCES public.event_actions(id);


--
-- Name: locations locations_parent_id_fkey; Type: FK CONSTRAINT; Schema: app; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.locations(id);


--
-- PostgreSQL database dump complete
--

