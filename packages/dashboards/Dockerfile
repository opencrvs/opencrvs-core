FROM metabase/metabase:v0.45.2.1
ADD run.sh /
ADD initialize-database.sh /
ADD update-database.sh /
ADD environment-configuration.sql /
ADD metabase.init.db.sql /

ENV METABASE_JAR=/app/metabase.jar
ENV MB_DB_INIT_SQL_FILE=/metabase.init.db.sql
ENV MB_DB_FILE=/data/metabase/metabase.mv.db
ENV OPENCRVS_ENVIRONMENT_CONFIGURATION_SQL_FILE=/environment-configuration.sql

# Install envsubst
RUN apk update && apk add gettext

ENTRYPOINT ["/bin/sh", "/run.sh"]