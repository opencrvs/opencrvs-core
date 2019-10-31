<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  

- [Environment Variables](#environment-variables)
- [Running the styleguide](#running-the-styleguide)
- [Making changes to the styleguide](#making-changes-to-the-styleguide)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Environment Variables

```
REACT_APP_COUNTRY = gbr
REACT_APP_LANGUAGE = en
```

For REACT_APP_COUNTRY, use lowercase two-letter [ISO "Alpha-3" country code](https://unstats.un.org/unsd/methodology/m49/)

E.G. test by setting to "bgd" for bangladesh

For REACT_APP_LANGUAGE, use lowercase two-letter [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

## Running the styleguide

```
yarn start
```

to launch project with nodemon running.

## Making changes to the styleguide

During development to add new styles, create a module in the components folder, and then run the following command to build the module into the lib directory:

```
yarn build
```

To then use the component in development of OpenCRVS, you will need to re-install all dependencies by running this command in the OpenCRVS application root directory:

```
yarn --force
```

The component will not be available to other developers until a successful pull request has been merged into master and the style been submitted to NPM.
