import { generateOpenApiDocument } from 'trpc-to-openapi'
import * as yaml from 'yaml'
import { appRouter } from './router/router'

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'OpenCRVS API',
  version: '1.8.0',
  baseUrl: 'http://localhost:3000'
})

console.log(yaml.stringify(openApiDocument))
