FROM metabase/metabase:v0.46.6.4

ADD packages/dashboards/run.sh /
ADD packages/dashboards/initialize-database.sh /
ADD packages/dashboards/update-database.sh /
ADD packages/dashboards/environment-configuration.sql /
ADD packages/dashboards/metabase.init.db.sql /

ENV METABASE_JAR=/app/metabase.jar
ENV MB_DB_INIT_SQL_FILE=/metabase.init.db.sql
ENV MB_DB_FILE=/data/metabase/metabase.mv.db
ENV OPENCRVS_ENVIRONMENT_CONFIGURATION_SQL_FILE=/environment-configuration.sql

# Install envsubst, uuidgen
RUN apk update && apk upgrade && apk add --no-cache gettext && apk add --no-cache util-linux

ENTRYPOINT ["/bin/sh", "/run.sh"]
