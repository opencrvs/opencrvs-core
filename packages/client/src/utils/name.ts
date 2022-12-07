import { upperFirst, toLower } from 'lodash'

const startCase = (str: string) =>
  str
    .split(' ')
    .map((x) => upperFirst(toLower(x)))
    .join(' ')

// Expects to receive a name in surname, firstname middlename - format
export function formatName(name: string) {
  return name.split(', ').map(startCase).join(', ')
}
