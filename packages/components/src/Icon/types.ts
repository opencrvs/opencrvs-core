import { ReactElement } from 'react'

type CustomIconProps = {
  size: number
  color: string
} & React.HTMLAttributes<SVGElement>

export type CustomIcon = (props: CustomIconProps) => ReactElement<SVGSVGElement>
