#### `yarn new:migration migration-name`
This will create a new migration named `migration-name` prepended with the current
timestamp in the migrations folder. The script will have 2 functions exported, `up` and
`down`. We need to write the new migration procedure in the `up` function and a 
procedure to revert those changes in `down`.

#### `yarn start`
This will run all the pending migrations.

#### `yarn status`
This will show status for the migration scripts defined in the migrations folder.

Note: This package requires `mongodb` to be running

