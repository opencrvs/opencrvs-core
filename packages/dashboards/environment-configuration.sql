UPDATE
  PUBLIC.SETTING
SET
  VALUE = '$OPENCRVS_METABASE_SITE_NAME'
where
  KEY = 'site-name';

UPDATE
  PUBLIC.SETTING
SET
  VALUE = '$OPENCRVS_METABASE_SITE_URL'
where
  KEY = 'site-url';

UPDATE
  PUBLIC.SETTING
SET
  VALUE = '{"cdc1d5eb-c7f8-8b01-b296-eda34d06b6da":{"name":"$OPENCRVS_METABASE_MAP_NAME","url":"$OPENCRVS_METABASE_MAP_URL","region_key":"$OPENCRVS_METABASE_MAP_REGION_KEY","region_name":"$OPENCRVS_METABASE_MAP_REGION_NAME"}}'
where
  KEY = 'custom-geojson';

UPDATE
  PUBLIC.METABASE_DATABASE
SET
  DETAILS = '{"additional-options":null,"ssl":false,"use-srv":false,"let-user-control-scheduling":null,"authdb":"$OPENCRVS_METABASE_DB_AUTH_DB","port":27017,"advanced-options":true,"dbname":"performance","use-connection-uri":false,"host":"$OPENCRVS_METABASE_DB_HOST","tunnel-enabled":false,"pass":"$OPENCRVS_METABASE_DB_PASS","version":"4.4.18","user":"$OPENCRVS_METABASE_DB_USER","client-ssl-key-value":null}'
WHERE
  NAME = 'Performance';