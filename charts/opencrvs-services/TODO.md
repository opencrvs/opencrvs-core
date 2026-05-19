# Monitoring

1. Review option of replacing ELK with something more simple

# Data persistence

How can we prevent volumes from removal?
Is `Retain` sufficient for us?

# Add minio-mc container

TODO: Check if container is needed

# TODO
- Add capability to work with private registry:
  Kubernetes should be able to login into container registry, helm chart should have credentials helpers
- Add capability to provide admin login and password for datastores from command line:
  - elasticsearch needs admin creadentials for migration
  - mongodb, elasticsearch, postgres need admin credentials to create OpenCRVS users