// https://dnlytras.com/blog/nominal-types
declare const __nominal__type: unique symbol
export type Nominal<Type, Identifier extends string> = Type & {
  readonly [__nominal__type]: Identifier
}

declare const __nominal__type__2: unique symbol

export type NestedNominal<
  K extends { readonly [__nominal__type]: any },
  Identifier extends string
> = Omit<K, typeof __nominal__type> & {
  readonly [__nominal__type]: Identifier
  readonly [__nominal__type__2]: K[typeof __nominal__type]
}
