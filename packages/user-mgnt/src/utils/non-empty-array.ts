export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
  return arr.length > 0
}

export type NonEmptyArray<T> = [T, ...T[]]
