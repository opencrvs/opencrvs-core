import * as React from 'react'

export const Plus = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width={142}
    height={142}
    viewBox="20 20 100 100"
    preserveAspectRatio="xMidYMin"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <title>764AA7DC-2C55-4A5C-A80A-2BF48B4458E5</title>
    <defs>
      <rect id="b" x={0} y={0} width={96} height={96} rx={1.27} />
      <filter
        x="-35.9%"
        y="-35.9%"
        width="171.9%"
        height="171.9%"
        filterUnits="objectBoundingBox"
        id="a"
      >
        <feOffset in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur
          stdDeviation={11.5}
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
        />
        <feColorMatrix
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.272588315 0"
          in="shadowBlurOuter1"
        />
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g transform="translate(23 23)">
        <use fill="#000" filter="url(#a)" xlinkHref="#b" />
        <use fill="#5E93ED" xlinkHref="#b" />
      </g>
      <g transform="translate(56 56)" fill="#FFF" fillRule="nonzero">
        <rect x={0.474} y={12.942} width={29.416} height={3.687} rx={1.844} />
        <rect
          transform="rotate(90 15.182 14.785)"
          x={0.474}
          y={12.942}
          width={29.416}
          height={3.687}
          rx={1.844}
        />
      </g>
    </g>
  </svg>
)
