import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { Event, Action, IForm } from 'forms'
import { getBirthMutationMappings } from './birth/mutations'
import { getDeathMutationMappings } from './death/mutations'
import { Mutation } from 'react-apollo'
import { IDraft } from 'drafts'

interface IMutationProviderProps {
  event: Event
  action: Action
  form?: IForm
  draft?: IDraft
  payload?: any
  onCompleted: (data: any) => void
  onError?: (error: any) => void
}
type IProps = IMutationProviderProps & InjectedIntlProps
/* Need to add mappings for events here */
const MutationMapper = {
  [Event.BIRTH]: getBirthMutationMappings,
  [Event.DEATH]: getDeathMutationMappings
}

export const MutationContext = React.createContext({
  mutation: {},
  loading: false,
  data: undefined
})
class MutationProviderComponent extends React.Component<IProps> {
  getMapping() {
    const { event, action, payload, form, draft } = this.props
    return (
      MutationMapper[event] &&
      MutationMapper[event](action, payload, form, draft)
    )
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
        onCompleted={data => onCompleted(data[eventMutationMapping.dataKey])}
        onError={onError}
      >
        {(submitMutation, { loading, data }) => {
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
