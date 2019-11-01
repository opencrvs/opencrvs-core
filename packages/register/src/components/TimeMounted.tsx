import React, { useState, useEffect } from 'react'

interface IProps {
  onUnmount: (duration: number) => void // in milliseconds
  children?: React.ReactNode
}

export function TimeMounted(props: IProps) {
  const [startTime] = useState(new Date())
  const { onUnmount } = props

  useEffect(() => {
    return () => onUnmount(new Date().getTime() - startTime.getTime())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime])

  return <>{props.children}</>
}
