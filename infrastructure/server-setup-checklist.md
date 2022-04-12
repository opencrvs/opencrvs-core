# Server setup checklist

## ElasticSearch / Kibana

### Alerts

- Alert rules configured in `https://kibana.<host>/app/management/insightsAndAlerting/triggersActions/rules`
  - You should see alerts tagged as "opencrvs-builtin"
  - These alerts should be created and updated on every deployment. If not, check logs of the `setup-kibana-alerts` service.

### Server metrics

- Statistics shown for all servers in `https://kibana.<host>/app/metrics/inventory`

### Data retention

- Both APM and Metricbeat use a 7 day rollover policy
  - Navigate to `https://kibana.<host>/app/management/data/index_lifecycle_management/policies`. Here you should see a policy named `apm-rollover-7-days` with 5 linked indices. You should also see a policy named `metricbeat-opencrvs-rollover-policy` with X linked indices. The former is for APM and the latter for Metricbeat. Both of these policies are configured to use a maximum of 20Gb of disk space and retain data for one week.
