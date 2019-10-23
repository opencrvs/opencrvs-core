import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { Event, Action, IForm } from '@register/forms'
import { getBirthMutationMappings } from '@register/views/DataProvider/birth/mutations'
import { getDeathMutationMappings } from '@register/views/DataProvider/death/mutations'
import { Mutation } from 'react-apollo'
import { IApplication } from '@register/applications'

interface IMutationProviderProps {
  event: Event
  action: Action
  form?: IForm
  application?: IApplication
  payload?: any
  onCompleted: (data: any) => void
  onError?: (error: any) => void
}
type IProps = IMutationProviderProps & IntlShapeProps
/* Need to add mappings for events here */
const MutationMapper = {
  [Event.BIRTH]: getBirthMutationMappings,
  [Event.DEATH]: getDeathMutationMappings
}

export const getMutationMapping = (
  event: Event,
  action: Action,
  payload?: any,
  form?: IForm,
  application?: IApplication
) => {
  return (
    MutationMapper[event] &&
    MutationMapper[event](action, payload, form, application)
  )
}

export const MutationContext = React.createContext({
  mutation: {},
  loading: false,
  data: undefined
})
class MutationProviderComponent extends React.Component<IProps> {
  getMapping() {
    const { event, action, payload, form, application } = this.props
    return getMutationMapping(event, action, payload, form, application)
  }

  render() {
    const { onCompleted, onError } = this.props
    const eventMutationMapping = this.getMapping()
    if (!eventMutationMapping) {
      return null
    }
    return (
      <Mutation
        mutation={eventMutationMapping.mutation}
        variables={eventMutationMapping.variables || null}
        onCompleted={(data: any) =>
          onCompleted(data[eventMutationMapping.dataKey])
        }
        onError={onError}
      >
        {(
          submitMutation: any,
          { loading, data }: { loading: any; data?: any }
        ) => {
          return (
            <MutationContext.Provider
              // @ts-ignore
              value={{ mutation: submitMutation, loading, data }}
            >
              {this.props.children}
            </MutationContext.Provider>
          )
        }}
      </Mutation>
    )
  }
}

export const MutationProvider = injectIntl(MutationProviderComponent)
