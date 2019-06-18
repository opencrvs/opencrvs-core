## To generate a new test GraphQL Schema

- Make sure that the server and gateway are running
- Ensure that you have the [GraphQL CLI](https://github.com/graphql-cli/graphql-cli) installed on your machine.
- Use your browser to login to OpenCRVS and copy an authorised token from the URL or from local storage
- Run the following in this folder:

````graphql get-schema \
 --endpoint http://localhost:7070/graphql \
 --header Authorization={your-token} \
 --output schema.graphql```
````
