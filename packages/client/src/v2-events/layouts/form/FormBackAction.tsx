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
  useMemo,
  useRef,
  useState
} from 'react'

type BackAction = () => void

interface FormBackActionContextValue {
  back?: BackAction
  setBack: React.Dispatch<React.SetStateAction<BackAction | undefined>>
}

const FormBackActionContext = createContext<FormBackActionContextValue | null>(
  null
)

/**
 * Bridges the form body and the form header. The back navigation lives deep in
 * the form body (`Pages`), while the button that triggers it is rendered by
 * `FormHeader` in the `Frame` header — a sibling subtree. This provider, placed
 * in `FormLayout` around both, lets the body publish a back handler that the
 * header consumes.
 */
export function FormBackActionProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [back, setBack] = useState<BackAction | undefined>(undefined)
  const value = useMemo(() => ({ back, setBack }), [back])

  return (
    <FormBackActionContext.Provider value={value}>
      {children}
    </FormBackActionContext.Provider>
  )
}

/**
 * Write side — called by the component that owns the back navigation (`Pages`).
 * Publishes a back handler into the context, or clears it when `onBack` is
 * undefined or the caller unmounts, so the header never keeps a stale handler.
 *
 * No-ops when there is no provider (e.g. `Pages`/a wizard rendered in isolation
 * in a story or test, outside `FormLayout`) — there is no header to show the
 * button in that case.
 *
 * The published handler is a stable wrapper that always calls the latest
 * `onBack` via a ref. This keeps the context value stable across renders even
 * though `onBack` is a fresh closure each render, so the header only re-renders
 * when the back button appears or disappears — not on every page render.
 */
export function useProvideFormBackAction(onBack?: BackAction) {
  const setBack = useContext(FormBackActionContext)?.setBack
  const latest = useRef(onBack)
  latest.current = onBack

  const hasBack = Boolean(onBack)

  useEffect(() => {
    if (!setBack) {
      return
    }
    const wrapper: BackAction | undefined = hasBack
      ? () => latest.current?.()
      : undefined
    // Updater form: the value we store IS a function, so it must be returned
    // from an updater rather than passed directly (which React would treat as
    // an updater and store its return value instead).
    setBack(() => wrapper)
    return () => setBack(() => undefined)
  }, [hasBack, setBack])
}

/**
 * Read side — called by `FormHeader` to render the back button. Returns
 * `undefined` when there is no provider (e.g. `FormHeader` rendered outside
 * `FormLayout`, such as the duplicate-review header), meaning no back button.
 */
export function useFormBackAction() {
  return useContext(FormBackActionContext)?.back
}
