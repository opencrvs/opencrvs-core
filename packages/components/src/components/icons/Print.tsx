import * as React from 'react'

export const Print = (props: React.HTMLAttributes<SVGElement>) => (
  <svg width={76} height={76} {...props}>
    <defs>
      <path
        d="M2.2 0h45.6A2.2 2.2 0 0 1 50 2.2v45.6a2.2 2.2 0 0 1-2.2 2.2H2.2A2.2 2.2 0 0 1 0 47.8V2.2A2.2 2.2 0 0 1 2.2 0z"
        id="prefix__b"
      />
      <filter
        x="-39%"
        y="-39%"
        width="178%"
        height="178%"
        filterUnits="objectBoundingBox"
        id="prefix__a"
      >
        <feOffset in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur
          stdDeviation={6.5}
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
        />
        <feColorMatrix
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.147927989 0"
          in="shadowBlurOuter1"
        />
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g transform="translate(13 13)">
        <use fill="#000" filter="url(#prefix__a)" xlinkHref="#prefix__b" />
        <use fill="#5E93ED" xlinkHref="#prefix__b" />
      </g>
      <g transform="translate(21 23)" fillRule="nonzero">
        <path fill="#5E93ED" d="M9 17h8v11H9z" />
        <path
          d="M1 5h32a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm.8 1.8v14.4h30.4V6.8H1.8z"
          fill="#FFF"
        />
        <path
          d="M8.8 5h16.4V2.6H8.8V5zM8 .8h18a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"
          fill="#FFF"
        />
        <rect fill="#FFF" x={4} y={15} width={26} height={2} rx={1} />
        <rect fill="#FFF" x={24} y={10} width={6} height={2} rx={1} />
        <path fill="#5E93ED" d="M8 16h18v13H8z" />
        <path
          d="M8.8 16.8v11.4h16.4V16.8M27 16v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V16"
          fill="#FFF"
        />
      </g>
    </g>
  </svg>
)
