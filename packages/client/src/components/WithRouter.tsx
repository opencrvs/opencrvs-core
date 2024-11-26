import {
  useLocation,
  useNavigate,
  useParams,
  Location,
  NavigateFunction,
  Params
} from 'react-router-dom'
import * as React from 'react'

export type RouteComponentProps<T = {}> = {
  router: {
    location: Location
    navigate: NavigateFunction
    params: Readonly<Params<string>>
    match: { params: Readonly<Params<string>> }
  }
} & T

/**
 * Custom withRouter component implemented using react-router-dom hooks
 * withRouter was deprecated in react-router-dom v6
 *
 */
export function withRouter<ComponentProps extends RouteComponentProps>(
  Component: React.ComponentType<ComponentProps>
) {
  function ComponentWithRouterProp(props: Omit<ComponentProps, 'router'>) {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()

    const match = { params }
    return (
      <Component
        {...(props as ComponentProps)}
        router={{ location, navigate, params, match }}
      />
    )
  }

  return ComponentWithRouterProp
}
