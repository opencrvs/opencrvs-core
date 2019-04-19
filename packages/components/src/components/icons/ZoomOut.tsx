import * as React from 'react'

export const ZoomOut = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={24} height={24} fill="none" {...props}>
    <path d="M4 12h16" stroke="#4C68C1" strokeWidth={2} strokeLinecap="round" />
  </svg>
)

export default ZoomOut
