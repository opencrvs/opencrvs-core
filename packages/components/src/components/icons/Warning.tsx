import * as React from 'react'

export const Warning = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width={33}
    height={33}
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <defs>
      <circle id="warningB" cx={9.5} cy={9.5} r={9.5} />
      <filter
        x="-55.3%"
        y="-55.3%"
        width="210.5%"
        height="210.5%"
        filterUnits="objectBoundingBox"
        id="warningA"
      >
        <feMorphology
          radius={0.5}
          operator="dilate"
          in="SourceAlpha"
          result="shadowSpreadOuter1"
        />
        <feOffset in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
        <feGaussianBlur
          stdDeviation={3}
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
        />
        <feColorMatrix
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.114639946 0"
          in="shadowBlurOuter1"
        />
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g transform="translate(7 7)">
        <use fill="#000" filter="url(#warningA)" xlinkHref="#warningB" />
        <use fill="#D77160" xlinkHref="#warningB" />
      </g>
      <g stroke="#FFF" strokeLinecap="round" strokeWidth={2.1}>
        <path d="M16.5 11.574v5.63M16.5 20.722v.704" />
      </g>
    </g>
  </svg>
)
