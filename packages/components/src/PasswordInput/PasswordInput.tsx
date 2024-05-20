import React, { useState } from 'react'
import { TextInput } from '../TextInput'
import { Icon } from '../Icon'
import { CircleButton } from '../buttons'

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
    setIsVisible(!isVisible)
  }

  return (
    <TextInput
      {...props}
      type={isVisible ? 'text' : 'password'}
      postfix={
        !ignoreVisibility && (
          <CircleButton onClick={toggleVisibility} type="button">
            <Icon name={isVisible ? 'Eye' : 'EyeSlash'} size="small" />
          </CircleButton>
        )
      }
    />
  )
}
