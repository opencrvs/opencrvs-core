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
import { client } from '@client/utils/apolloClient'
import { REGISTRATION_HOME_QUERY } from '@client/views/RegistrationHome/queries'
import { IQueryData } from '@client/views/RegistrationHome/RegistrationHome'
import ApolloClient, { ApolloError } from 'apollo-client'
import { AppStore, createStore } from './store'
import { updateRegistrarWorkQueue, IWorkqueue } from './applications'
import { Dispatch } from 'redux'

const COUNT = 10

export class ListSyncController {
  private dispatch: Dispatch
  private workqueueLoading: boolean
  private client: ApolloClient<{}>
  private locationId: string = ''
  private reviewStatuses: string[] = []
  private inProgressSkip: number = 0
  private reviewSkip: number = 0
  private rejectSkip: number = 0
  private approvalSkip: number = 0
  private printSkip: number = 0

  constructor(
    dispatch: Dispatch,
    workqueueLoading: boolean,
    locationId: string,
    reviewStatuses: string[],
    inProgressSkip: number,
    reviewSkip: number,
    rejectSkip: number,
    approvalSkip: number,
    printSkip: number
  ) {
    this.dispatch = dispatch
    this.workqueueLoading = workqueueLoading
    this.client = client
    this.locationId = locationId
    this.reviewStatuses = reviewStatuses
    this.inProgressSkip = inProgressSkip
    this.reviewSkip = reviewSkip
    this.rejectSkip = rejectSkip
    this.approvalSkip = approvalSkip
    this.printSkip = printSkip
  }

  public start = () => {
    if (this.workqueueLoading) {
      this.dispatch(updateRegistrarWorkQueue(true, false))
      this.sync()
    }
  }

  private sync = async () => {
    this.queryData()
  }

  public queryData = async () => {
    try {
      const queryResult = await this.client.query({
        query: REGISTRATION_HOME_QUERY,
        variables: {
          locationIds: [this.locationId],
          count: 10,
          reviewStatuses: this.reviewStatuses,
          inProgressSkip: this.inProgressSkip,
          reviewSkip: this.reviewSkip,
          rejectSkip: this.rejectSkip,
          approvalSkip: this.approvalSkip,
          printSkip: this.printSkip
        }
      })
      this.onSuccess(queryResult.data)
    } catch (exception) {
      this.onError(exception)
    }
  }

  private onSuccess = (result: IQueryData) => {
    this.dispatch(updateRegistrarWorkQueue(false, false, result))
  }

  private onError = (error: ApolloError) => {
    this.dispatch(updateRegistrarWorkQueue(false, true))
  }
}
