# Administrative hierarchy

1. Administrative hierarchy consists of administrative areas and locations.
2. Administrative areas form the jurisdictional hierarchy of a country.
3. Administrative area may contain locations.
4. Locations are specific places like offices or health facilities. Locations **do not** form independent hierarchy outside of administrative areas.
5. All users must belong to a location.
6. Type of a location is arbitrary\*

\* Until 2.0 is completed, field type `FACILITY` renders locations of type `HEALTH_FACILITY`.

## Renaming, inactivating, and closing a location

1. A location's parent (its administrative area) and type are fixed for life. Renaming or inactivating a location never changes its identity, and records referencing it keep resolving correctly for their own anchor date.
2. Inactivating a location does not move, hide, or reassign anything: records already referencing it stay reachable and processable from any office in the same administrative area, and users assigned to it are not automatically reassigned to another office.
3. Office closure SOP: before a `PUT` marks an office inactive, either clear its Notified/Declared queue by a cut-off date, or stop routing new declarations there until the structure change takes effect. Inactivation does not do this for you — it only stops the office being offered as a _destination_ for new work.
4. There is no re-parenting. A real-world transfer (an office moving between administrative areas) is two separate calls — inactivate the old location, then create a new one under the new parent — not an update to the existing location. Both calls are idempotent and safe to retry: if the create call fails after the inactivate call has already succeeded, retry the create call alone.
