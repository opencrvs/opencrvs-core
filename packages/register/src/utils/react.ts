export type ComponentProps<C> = C extends React.Component<infer P, any>
  ? P
  : never
