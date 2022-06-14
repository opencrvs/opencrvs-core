/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { Event, Action, IForm } from '@client/forms'
import { getBirthMutationMappings } from '@client/views/DataProvider/birth/mutations'
import { getDeathMutationMappings } from '@client/views/DataProvider/death/mutations'
import { Mutation } from 'react-apollo'
import { IDeclaration } from '@client/declarations'

interface IMutationProviderProps {
  event: Event
  action: Action
  form?: IForm
  declaration?: IDeclaration
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
  declaration?: IDeclaration
) => {
  return (
    MutationMapper[event] &&
    MutationMapper[event](action, payload, form, declaration)
  )
}

export const MutationContext = React.createContext({
  mutation: {},
  loading: false,
  data: undefined
})
class MutationProviderComponent extends React.Component<IProps> {
  getMapping() {
    const { event, action, payload, form, declaration } = this.props
    return getMutationMapping(event, action, payload, form, declaration)
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
