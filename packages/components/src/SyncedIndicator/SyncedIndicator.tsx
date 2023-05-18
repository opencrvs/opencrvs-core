import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

type SyncedIndicatorProps = {
  isLoading: boolean
  hasError: boolean
}

type SyncedIndicator = 'synced' | 'syncing' | 'error' | 'offline'

const SyncedIndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const Label = styled.div<{
  $type?: SyncedIndicator
}>`
  ${({ theme }) => theme.fonts.bold12}
  color: ${({ $type, theme }) => {
    switch ($type) {
      case 'synced':
        return theme.colors.positiveDark
      case 'syncing':
        return theme.colors.grey400
      case 'error':
        return theme.colors.negativeDark
      case 'offline':
        return theme.colors.negativeDark
      default:
        return ''
    }
  }};
`

const Circle = styled.div<{
  $type?: SyncedIndicator
}>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $type, theme }) => {
    switch ($type) {
      case 'synced':
        return theme.colors.positiveDark
      case 'syncing':
        return theme.colors.grey400
      case 'error':
        return theme.colors.negativeDark
      case 'offline':
        return theme.colors.negativeDark
      default:
        return ''
    }
  }};
`

export function SyncedIndicator({ isLoading, hasError }: SyncedIndicatorProps) {
  const [type, setType] = useState<SyncedIndicator>('offline')
  const [loadingStart, setLoadingStart] = useState<Date | null>(null)
  const [statusLabel, setStatusLabel] = useState<string>('')

  useEffect(() => {
    let timerId: number | null = null

    if (hasError) {
      setType('error')
      setStatusLabel('No connection')
    } else if (isLoading) {
      setType('syncing')
      setStatusLabel('Checking for new records...')
      setLoadingStart(new Date())
    } else if (loadingStart) {
      const elapsed = new Date().getTime() - loadingStart.getTime()
      const remaining = Math.max(0, 2500 - elapsed)
      timerId = window.setTimeout(() => {
        setType('synced')
        setStatusLabel('Synced')
      }, remaining)
    } else {
      setType('synced')
      setStatusLabel('Synced')
    }

    return () => {
      if (timerId) {
        window.clearTimeout(timerId)
      }
    }
  }, [isLoading, hasError])

  return (
    <SyncedIndicatorContainer>
      <Circle $type={type} />
      <Label $type={type}>{statusLabel}</Label>
    </SyncedIndicatorContainer>
  )
}
