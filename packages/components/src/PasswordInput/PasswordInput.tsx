import React, { useState } from 'react'
import { Button } from '../Button'
import { TextInput } from '../TextInput'
import { Icon } from '../Icon'

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  touched?: boolean
  ignoreVisibility?: boolean
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  ignoreVisibility,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsVisible(!isVisible)
  }

  return (
    <TextInput
      {...props}
      type={isVisible ? 'text' : 'password'}
      postfix={
        !ignoreVisibility && (
          <Button size="small" onClick={toggleVisibility} type="icon">
            <Icon name={isVisible ? 'Eye' : 'EyeSlash'} size="small" />
          </Button>
        )
      }
    />
  )
}
