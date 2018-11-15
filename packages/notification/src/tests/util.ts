export function createServerWithEnvironment(env: any) {
  jest.resetModules()
  process.env = { ...process.env, ...env }
  return require('../').createServer()
}
