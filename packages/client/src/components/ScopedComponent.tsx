import React from 'react'
import { usePermissions } from '@client/hooks/useAuthorization'
import { Scope } from '@opencrvs/commons/build/dist/scopes'

interface ScopeComponentProps {
  scopes?: Scope[]
  denyScopes?: Scope[]
  children: React.ReactNode
}

const ScopedComponent: React.FC<ScopeComponentProps> = ({
  scopes,
  denyScopes,
  children
}) => {
  const { hasAnyScope } = usePermissions()
  const hasRequiredScope = !scopes || hasAnyScope(scopes)
  const hasDeniedScope = denyScopes && hasAnyScope(denyScopes)

  return hasRequiredScope && !hasDeniedScope ? <>{children}</> : null
}

export default ScopedComponent
