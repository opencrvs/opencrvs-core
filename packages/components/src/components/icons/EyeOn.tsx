import * as React from 'react'

export const EyeOn = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.75 9C1.75 9 4.75 3 10 3C15.25 3 18.25 9 18.25 9C18.25 9 15.25 15 10 15C4.75 15 1.75 9 1.75 9Z"
      stroke="#4C68C1"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 11.25C11.2426 11.25 12.25 10.2426 12.25 9C12.25 7.75736 11.2426 6.75 10 6.75C8.75736 6.75 7.75 7.75736 7.75 9C7.75 10.2426 8.75736 11.25 10 11.25Z"
      stroke="#4C68C1"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
