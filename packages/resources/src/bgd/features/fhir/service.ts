export function createPersonEntry(
  nid: number,
  name: string,
  nameEng: string,
  gender: string
) {
  return {
    name: [
      {
        use: 'en',
        family: nameEng
      },
      {
        use: 'bn',
        family: name
      }
    ],
    gender
  }
}
