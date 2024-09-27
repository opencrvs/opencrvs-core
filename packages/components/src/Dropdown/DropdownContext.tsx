/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

interface DropdownContextType {
  isOpen: boolean
  toggleDropdown: () => void
  closeDropdown: () => void
  addItemRef: (item: HTMLLIElement | null) => void
  handleKeyDown: (e: React.KeyboardEvent) => void
}

const DropdownContext = createContext<DropdownContextType | undefined>(
  undefined
)

export const useDropdown = () => {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider')
  }
  return context
}

export const DropdownProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  const addItemRef = (item: HTMLLIElement | null) => {
    if (item && item.tabIndex === 0 && !itemRefs.current.includes(item)) {
      itemRefs.current.push(item)
      if (itemRefs.current.length === 1) itemRefs.current[0]?.focus()
    }
  }

  const closeDropdown = () => isOpen && toggleDropdown()

  const toggleDropdown = () => {
    itemRefs.current = []
    if (!isOpen) {
      setFocusedIndex(-1)
    }
    setIsOpen((prev) => !prev)
  }

  const getNextIndex = (last: number) => {
    return Math.min(last + 1, itemRefs.current.length - 1)
  }

  const getPreviousIndex = (last: number) => {
    return Math.max(last - 1, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault()
    if (e.key === 'ArrowDown') {
      setFocusedIndex(getNextIndex)
    } else if (e.key === 'ArrowUp') {
      setFocusedIndex(getPreviousIndex)
    }
  }

  useEffect(() => {
    if (focusedIndex !== null && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex])

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        toggleDropdown,
        closeDropdown,
        addItemRef,
        handleKeyDown
      }}
    >
      {children}
    </DropdownContext.Provider>
  )
}
