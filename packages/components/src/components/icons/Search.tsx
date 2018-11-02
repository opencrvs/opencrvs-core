import * as React from 'react'
import styled from 'styled-components'

const SearchIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={27} height={27} {...props}>
    <title>{`680A405E-312F-4781-85EA-CF6826F06F03-565-000007DCE267B9A2`}</title>
    <g fillRule="nonzero" stroke="#35495D" fill="none">
      <ellipse strokeWidth={2.4} cx={8.5} cy={8.458} rx={8.5} ry={8.458} />
      <path d="M8.5 17.722V29" strokeWidth={3.2} strokeLinecap="round" />
    </g>
  </svg>
)

export const Search = styled(SearchIcon)`
  transform: rotate(-45deg);
`
