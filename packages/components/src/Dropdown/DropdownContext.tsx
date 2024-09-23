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

import React, { createContext, useContext, useState } from 'react'

interface DropdownContextType {
  isOpen: boolean
  toggleDropdown: () => void
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

  const toggleDropdown = () => setIsOpen((prev) => !prev)

  return (
    <DropdownContext.Provider value={{ isOpen, toggleDropdown }}>
      {children}
    </DropdownContext.Provider>
  )
}
