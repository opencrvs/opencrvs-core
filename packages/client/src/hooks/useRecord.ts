import { IStoreState } from '@client/store'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

export function useRecord() {
  const declarations = useSelector(
    (state: IStoreState) => state.declarationsState.declarations
  )

  return useMemo(
    () => ({
      findById(id: string) {
        return declarations.find((declaration) => declaration.id === id)
      }
    }),
    [declarations]
  )
}
