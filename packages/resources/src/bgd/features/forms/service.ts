const register = require('./register.json')

export async function getForms(): Promise<{}> {
  return { ...register }
}
