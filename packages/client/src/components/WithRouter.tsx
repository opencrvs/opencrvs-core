import {
  useLocation,
  useNavigate,
  useParams,
  RouterProps,
  RouteProps,
  Location,
  NavigateFunction,
  Params,
  useMatch
} from 'react-router-dom'
import * as React from 'react'

/**
 * Custom withRouter component implemented using react-router-dom hooks
 * withRouter was deprecated in react-router-dom v6
 * @param Component
 * @returns
 */

export type RouteComponentProps<T = {}> = {
  router: {
    location: Location
    navigate: NavigateFunction
    params: Readonly<Params<string>>
    match: { params: Readonly<Params<string>> }
  }
} & T

export function withRouter<ComponentProps extends RouteComponentProps>(
  Component: React.ComponentType<ComponentProps>
) {
  function ComponentWithRouterProp(props: Omit<ComponentProps, 'router'>) {
    const location = useLocation()
    const navigate = useNavigate()
    const params = useParams()

    const match = { params }
    // console.log('match', match)
    // console.log('params', params)
    console.log(props)
    return (
      <Component
        {...(props as ComponentProps)}
        router={{ location, navigate, params, match }}
      />
    )
  }

  return ComponentWithRouterProp
}
