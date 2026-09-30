# @opencrvs/mosip

Helpers for wiring an OpenCRVS country configuration to the MOSIP integration
API. Published to npm at core's version, and consumed by country configs as
`@opencrvs/mosip` — see `packages/testland` for a worked example.

The service these helpers talk to is [`packages/mosip-api`](../mosip-api), and
the mock MOSIP and e-Signet servers used in development and e2e are
[`packages/mosip-mock`](../mosip-mock) and
[`packages/esignet-mock`](../esignet-mock). All three are deployed by the
`charts/opencrvs-mosip` Helm chart.
