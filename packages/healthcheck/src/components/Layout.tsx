import { Frame } from '@opencrvs/components/lib/Frame'
import React from 'react'
import Sidebar from './Sidebar'
import DynamicAppBar from './DynamicAppBar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Frame
      header={<DynamicAppBar />}
      navigation={<Sidebar />}
      skipToContentText="Skip to main content"
    >
      {children}
    </Frame>
  )
}
