import { GQLHumanName, GQLComment } from '@opencrvs/gateway/src/graphql/schema'

interface INamesMap {
  [key: string]: string
}

export const createNamesMap = (names: GQLHumanName[]): INamesMap =>
  names.filter(Boolean).reduce((prevNamesMap: INamesMap, name) => {
    if (!name.use) {
      /* eslint-disable no-string-literal */
      prevNamesMap['default'] = `${name.firstNames} ${
        /* eslint-enable no-string-literal */
        name.familyName
      }`.trim()
      return prevNamesMap
    }

    prevNamesMap[name.use] = `${name.firstNames} ${name.familyName}`.trim()
    return prevNamesMap
  }, {})

export const extractCommentFragmentValue = (
  comments: GQLComment[],
  fragmentItem: string
): string => {
  let fragmentValue = ''

  for (const comment of comments) {
    if (comment.comment) {
      const commentFragments = comment.comment.split('&')
      for (const fragment of commentFragments) {
        if (fragment.includes(`${fragmentItem}=`)) {
          fragmentValue = fragment.replace(`${fragmentItem}=`, '')
          break
        }
      }
    }

    if (fragmentValue.length > 0) {
      break
    }
  }

  return fragmentValue
}

export const sentenceCase = (str: string): string =>
  str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
