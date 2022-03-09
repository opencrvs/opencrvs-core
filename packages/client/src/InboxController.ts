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
import {
  DOWNLOAD_STATUS,
  IDeclaration,
  modifyDeclaration,
  writeDeclaration,
  createReviewDeclaration
} from '@client/declarations'
import { Action, IForm, IFormData } from '@client/forms'
import { AppStore } from '@client/store'
import { client } from '@client/utils/apolloClient'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'
import ApolloClient, { ApolloError } from 'apollo-client'
import { getRegisterForm } from './forms/register/declaration-selectors'
import { gqlToDraftTransformer } from './transformer'
import { getQueryMapping } from './views/DataProvider/QueryProvider'
import { RequestHandler } from 'mock-apollo-client'
import { DocumentNode } from 'apollo-link'

const INTERVAL_TIME = 5000
const MAX_RETRY_ATTEMPT = 3
const ALLOWED_STATUS_FOR_RETRY = [DOWNLOAD_STATUS.READY_TO_DOWNLOAD.toString()]

interface IActionList {
  [key: string]: string
}

const ACTION_LIST: IActionList = {
  [Action.LOAD_REVIEW_DECLARATION]: Action.LOAD_REVIEW_DECLARATION,
  [Action.LOAD_CERTIFICATE_DECLARATION]: Action.LOAD_CERTIFICATE_DECLARATION
}

const REQUEST_IN_PROGRESS_STATUS: IActionList = {
  [Action.LOAD_REVIEW_DECLARATION]: DOWNLOAD_STATUS.DOWNLOADING,
  [Action.LOAD_CERTIFICATE_DECLARATION]: DOWNLOAD_STATUS.DOWNLOADING
}

const SUCCESS_DOWNLOAD_STATUS: IActionList = {
  [Action.LOAD_REVIEW_DECLARATION]: DOWNLOAD_STATUS.DOWNLOADED,
  [Action.LOAD_CERTIFICATE_DECLARATION]: DOWNLOAD_STATUS.DOWNLOADED
}

export class InboxController {
  private store: AppStore
  public client: ApolloClient<{}> & {
    setRequestHandler: (query: DocumentNode, handler: RequestHandler) => void // used for mocking in tests
  }
  public syncRunning = false

  constructor(store: AppStore) {
    this.store = store
    this.client = client
  }

  public start = () => {
    setInterval(() => {
      this.sync()
    }, INTERVAL_TIME)
  }

  private getDeclarations = () =>
    this.store.getState().declarationsState.declarations || []

  private getDownloadableDeclarations = () => {
    return this.getDeclarations().filter(
      (app: IDeclaration) =>
        app.downloadStatus &&
        ALLOWED_STATUS_FOR_RETRY.includes(app.downloadStatus)
    )
  }

  public sync = async () => {
    if (this.syncRunning) {
      return
    }

    this.syncRunning = true

    const declarations = this.getDownloadableDeclarations()
    for (const declaration of declarations) {
      await this.queryData(declaration)
    }

    this.syncRunning = false
  }

  public queryData = async (declaration: IDeclaration | undefined) => {
    if (!declaration) {
      return
    }

    const declarationAction = ACTION_LIST[declaration.action as string] || null

    const forms = getRegisterForm(this.store.getState())

    const result = getQueryMapping(
      declaration.event,
      // @ts-ignore
      declarationAction
    )
    const { query, dataKey } = result || {
      query: null,
      dataKey: null
    }

    const requestInProgressStatus =
      REQUEST_IN_PROGRESS_STATUS[declaration.action as string] ||
      DOWNLOAD_STATUS.DOWNLOADING
    declaration.downloadStatus = requestInProgressStatus
    this.store.dispatch(modifyDeclaration(declaration))
    this.store.dispatch(writeDeclaration(declaration))

    if (query) {
      try {
        const queryResult = await this.client.query({
          query,
          variables: {
            id: declaration.id
          }
        })
        this.onSuccess(
          declaration,
          forms[declaration.event],
          queryResult.data[dataKey as string]
        )
      } catch (exception) {
        this.onError(declaration, exception)
      }
    }
  }

  private onSuccess = (declaration: IDeclaration, form: IForm, result: any) => {
    const transData: IFormData = gqlToDraftTransformer(form, result)
    const app: IDeclaration = createReviewDeclaration(
      declaration.id,
      transData,
      declaration.event
    )
    app.downloadStatus =
      SUCCESS_DOWNLOAD_STATUS[declaration.action as string] ||
      DOWNLOAD_STATUS.DOWNLOADED
    this.store.dispatch(modifyDeclaration(app))
    this.store.dispatch(writeDeclaration(app))
  }

  private onError = (declaration: IDeclaration, error: ApolloError) => {
    declaration.downloadRetryAttempt =
      (declaration.downloadRetryAttempt || 0) + 1

    if (declaration.downloadRetryAttempt < MAX_RETRY_ATTEMPT) {
      declaration.downloadStatus = DOWNLOAD_STATUS.READY_TO_DOWNLOAD
      this.store.dispatch(modifyDeclaration(declaration))
      this.store.dispatch(writeDeclaration(declaration))
      return
    }

    let status
    if (error.networkError) {
      status = DOWNLOAD_STATUS.FAILED_NETWORK
    } else {
      status = DOWNLOAD_STATUS.FAILED
      Sentry.captureException(error)
    }

    declaration.downloadStatus = status
    this.store.dispatch(modifyDeclaration(declaration))
    this.store.dispatch(writeDeclaration(declaration))
  }
}
