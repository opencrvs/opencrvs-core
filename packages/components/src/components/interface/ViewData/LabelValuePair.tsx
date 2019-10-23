import * as React from 'react'
import styled from 'styled-components'

const Label = styled.span`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle}
`
const Value = styled.span`
  ${({ theme }) => theme.fonts.bigBodyStyle}
`
interface IInfo {
  label: string
  value: string
}

export function LabelValuePair({ label, value }: IInfo) {
  return (
    <div>
      <Label>{label}: </Label>
      <Value>{value}</Value>
    </div>
  )
}
