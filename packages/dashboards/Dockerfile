FROM metabase/metabase:v0.46.6.1@sha256:5fd48fa55f6492d7366d1fa3ac783216950af7b9659bc23099db5a8723c96361
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