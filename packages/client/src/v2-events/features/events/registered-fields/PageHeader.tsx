import React from 'react'
import { SubHeader } from '@opencrvs/components'

function PageHeaderInput({ children }: { children: React.ReactNode }) {
  return <SubHeader>{children}</SubHeader>
}

export const PageHeader = {
  Input: PageHeaderInput,
  Output: null
}
