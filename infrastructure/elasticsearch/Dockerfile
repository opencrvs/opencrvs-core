FROM docker.elastic.co/elasticsearch/elasticsearch:6.5.4
COPY --chown=elasticsearch:elasticsearch infrastructure/elasticsearch/elasticsearch.yml /usr/share/elasticsearch/config/
COPY --chown=elasticsearch:elasticsearch infrastructure/elasticsearch/elasticsearch.yml /config/
# Test to see if these are created by the volume
# RUN mkdir -p /backups/elasticsearch
# RUN chmod g+rwx /backups/elasticsearch