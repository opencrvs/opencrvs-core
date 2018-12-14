import * as React from 'react'

export const ThreeDots = (
  props: React.HTMLAttributes<SVGElement> & { expanded?: boolean }
) => {
  const { expanded, ...otherProps } = props
  return (
    <svg width={18} height={4} {...otherProps}>
      <title>
        {'DE5AAF36-C3B3-4FCC-A86F-7BC8626A2110-611-000003C1AF3BA489'}
      </title>
      <g fill="#58727E" fillRule="nonzero">
        <circle cx={2} cy={2} r={2} />
        <circle opacity={0.8} cx={9} cy={2} r={2} />
        <circle opacity={0.5} cx={16} cy={2} r={2} />
      </g>
    </svg>
  )
}
