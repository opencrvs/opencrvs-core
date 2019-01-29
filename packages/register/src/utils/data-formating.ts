import { GQLHumanName } from '@opencrvs/gateway/src/graphql/schema'

export const createNamesMap = (names: GQLHumanName[]) =>
  names.filter(Boolean).reduce((prevNamesMap, name) => {
    if (!name.use) {
      /* tslint:disable:no-string-literal */
      prevNamesMap['default'] = `${name.firstNames} ${
        /* tslint:enable:no-string-literal */
        name.familyName
      }`.trim()
      return prevNamesMap
    }

    prevNamesMap[name.use] = `${name.firstNames} ${name.familyName}`.trim()
    return prevNamesMap
  }, {})
