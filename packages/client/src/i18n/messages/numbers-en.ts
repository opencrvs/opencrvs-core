export const ordianals = [
  'zeroth',
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
  'thirteenth',
  'fourteenth',
  'fifteenth',
  'sixteenth',
  'seventeenth',
  'eighteenth',
  'nineteenth',
  'twentieth',
  'twenty-first',
  'twenty-second',
  'twenty-third',
  'twenty-fourth',
  'twenty-fifth',
  'twenty-sixth',
  'twenty-seventh',
  'twenty-eighth',
  'twenty-ninth',
  'thirtieth',
  'thirty-first'
]

export const decades = [
  { 17: 'seventeen' },
  { 18: 'eighteen' },
  { 19: 'nineteen' },
  { 20: 'twenty' },
  { 21: 'twenty-one' }
]

export const months = Array(12)
  .fill(undefined)
  .map((_, i) =>
    new Date(1970, i).toLocaleString('en', {
      month: 'long'
    })
  )
