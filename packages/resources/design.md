<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

- [Configuring OpenCRVS for your country](#configuring-opencrvs-for-your-country)
  - [GET `/assets/<file.png>`](#get-assetsfilepng)
  - [GET `/definitions` 🔒](#get-definitions-)
  - [POST `/generate/<brn|drn>` 🔒](#post-generatebrndrn-)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Configuring OpenCRVS for your country

OpenCRVS is designed to be highly configurable. It achieves this by loading a number of resources that it needs from a separate 'resource' service. The code in this folder is for that service. It provides the following endpoints:

```
GET /assets/<file.png>
  - for loading country specific public assets e.g. logos

GET /definitions
  - for loading the core definitions that drive the look for the webapp, this contains form definitions, language files and certification deplates

POST /generate/<brn|drn>
  - this endpoint generates registration number and can be replaces with your countries implementation.
```

## GET `/assets/<file.png>`

This will serve raw assets like images via an unprotected endpoint so these may be displayed without logging in.

## GET `/definitions` 🔒

The `/definitions` endpoint will return JSON with the following format:

```json
{
  "forms": {
    "registerForm": {
      "birth": {
        ...
      },
      "death": {
        ...
      }
    },
    "createUser": {
      ...
    }
  },
  "languages": [
    {
      "lang": "en",
      "displayName": "English",
      "messages": {}
    }
  ],
  "pdfs": {
    "birth": { ... },
    "death": { ... },
    "receipt": { ... }
  }
}
```

## POST `/generate/<brn|drn>` 🔒

Calls to this endpoint will generate a registration number. return the following structure.

```json
{
  "result": "XYZ"
}
```
