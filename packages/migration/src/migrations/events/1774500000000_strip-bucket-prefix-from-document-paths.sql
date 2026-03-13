-- Up Migration

-- Helper function to strip bucket prefix from paths in JSONB declaration/annotation columns.
-- Converts FullDocumentPath format ("/bucket-name/event-id/file.png") to DocumentPath ("event-id/file.png").
-- Handles both FileFieldValue (object with "path") and FileFieldWithOptionValue (array of objects with "path").
CREATE OR REPLACE FUNCTION strip_bucket_prefix_from_jsonb_paths(data jsonb) RETURNS jsonb AS $$
DECLARE
  key text;
  val jsonb;
  result jsonb := data;
  arr_elem jsonb;
  new_arr jsonb;
  i int;
BEGIN
  IF data IS NULL THEN
    RETURN NULL;
  END IF;

  FOR key, val IN SELECT * FROM jsonb_each(data)
  LOOP
    -- FileFieldValue: object with a "path" key starting with "/"
    IF jsonb_typeof(val) = 'object'
       AND val ? 'path'
       AND jsonb_typeof(val -> 'path') = 'string'
       AND (val ->> 'path') LIKE '/%'
    THEN
      result := jsonb_set(
        result,
        ARRAY[key, 'path'],
        to_jsonb(regexp_replace(val ->> 'path', '^/[^/]+/', ''))
      );

    -- FileFieldWithOptionValue: array of objects with "path" keys
    ELSIF jsonb_typeof(val) = 'array' THEN
      new_arr := '[]'::jsonb;
      FOR i IN 0..jsonb_array_length(val) - 1
      LOOP
        arr_elem := val -> i;
        IF jsonb_typeof(arr_elem) = 'object'
           AND arr_elem ? 'path'
           AND jsonb_typeof(arr_elem -> 'path') = 'string'
           AND (arr_elem ->> 'path') LIKE '/%'
        THEN
          arr_elem := jsonb_set(
            arr_elem,
            ARRAY['path'],
            to_jsonb(regexp_replace(arr_elem ->> 'path', '^/[^/]+/', ''))
          );
        END IF;
        new_arr := new_arr || jsonb_build_array(arr_elem);
      END LOOP;
      result := jsonb_set(result, ARRAY[key], new_arr);
    END IF;
  END LOOP;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Strip bucket prefix from created_by_signature in event_actions
UPDATE event_actions
SET created_by_signature = regexp_replace(created_by_signature, '^/[^/]+/', '')
WHERE created_by_signature LIKE '/%';

-- Strip bucket prefix from declaration JSONB paths in event_actions
UPDATE event_actions
SET declaration = strip_bucket_prefix_from_jsonb_paths(declaration)
WHERE declaration::text LIKE '%"path":"/%';

-- Strip bucket prefix from annotation JSONB paths in event_actions
UPDATE event_actions
SET annotation = strip_bucket_prefix_from_jsonb_paths(annotation)
WHERE annotation IS NOT NULL
  AND annotation::text LIKE '%"path":"/%';

-- Strip bucket prefix from created_by_signature in event_action_drafts
UPDATE event_action_drafts
SET created_by_signature = regexp_replace(created_by_signature, '^/[^/]+/', '')
WHERE created_by_signature LIKE '/%';

-- Strip bucket prefix from declaration JSONB paths in event_action_drafts
UPDATE event_action_drafts
SET declaration = strip_bucket_prefix_from_jsonb_paths(declaration)
WHERE declaration::text LIKE '%"path":"/%';

-- Strip bucket prefix from annotation JSONB paths in event_action_drafts
UPDATE event_action_drafts
SET annotation = strip_bucket_prefix_from_jsonb_paths(annotation)
WHERE annotation IS NOT NULL
  AND annotation::text LIKE '%"path":"/%';

-- Clean up the helper function
DROP FUNCTION strip_bucket_prefix_from_jsonb_paths;

-- Down Migration
-- No-op: bucket prefix cannot be reliably restored as the bucket name is not known
