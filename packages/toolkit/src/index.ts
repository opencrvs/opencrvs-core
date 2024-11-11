export type Noop = () => void

export const noop: Noop = () => {
  console.log('noop')
}
