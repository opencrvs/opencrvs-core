import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { Event, Action, IForm } from 'src/forms'
import { getBirthMutationMappings } from './birth/mutations'
import { Mutation } from 'react-apollo'
import { IDraft } from 'src/drafts'

interface IMutationProviderProps {
  event: Event
  action: Action
  form?: IForm
  draft?: IDraft
  payload?: any
  onCompleted: (data: any) => void
}
type IProps = IMutationProviderProps & InjectedIntlProps
const MutationMapper = {
  [Event.BIRTH]: getBirthMutationMappings
}
export const MutationContext = React.createContext({
  mutation: {},
  loading: false,
  data: undefined
})
class MutationProviderView extends React.Component<IProps> {
  getMutationMapping() {
    const { event, action, payload, form, draft } = this.props
    const eventMutationMapping =
      MutationMapper[event] &&
      MutationMapper[event](action, payload, form, draft)
    if (!eventMutationMapping) {
      return null
    }
    return eventMutationMapping
  }

  render() {
    const { onCompleted } = this.props
    const eventMutationMapping = this.getMutationMapping()
    if (!eventMutationMapping) {
      return null
    }
    return (
      <Mutation
        mutation={eventMutationMapping.mutation}
        variables={eventMutationMapping.variables || null}
        onCompleted={data => onCompleted(data[eventMutationMapping.dataKey])}
      >
        {(submitMutation, { loading, data }) => {
          return (
            <MutationContext.Provider
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

export const MutationProvider = injectIntl(MutationProviderView)
