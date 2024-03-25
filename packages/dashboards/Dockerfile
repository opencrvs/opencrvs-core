FROM metabase/metabase:v0.46.6.4@sha256:95c60db0c87c5da9cb81f6aefd0cd548fe2c14ff8c8dcba2ea58a338865cdbd9
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
RUN apk update && apk upgrade && apk add --no-cache gettext

ENTRYPOINT ["/bin/sh", "/run.sh"]