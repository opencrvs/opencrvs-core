# OpenCRVS FHIR types

The purpose of these types is to, as accurately and strictly as possible, describe the data structures OpenCRVS creates, manipulates and stores in its database. In most cases this means that the types defined here are stricter than the default fhir3 types.

### Design principles

1. If we know a field exists, it should not be optional even if its optional in the FHIR spec. Making as many fields we can non-nullable benefits us in many ways:

- Developers can trust the data they are handling.
- Data is easier to read and manipulate. No need to do `task?.requester?.reference` if we've defined all of those fields mandatory.

2. Types act as documentation . If we know task sometimes has the "requested" field (think correction request) and sometimes doesn't (registered event) we are clearly talking about two distinct Task types – CorrectionRequestedTask and RegisteredTask. Why would this not be documented in our code?
