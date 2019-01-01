import {
  compose,
  createStore as createReduxStore,
  applyMiddleware,
  AnyAction,
  Store,
  StoreEnhancer
} from 'redux'
import { createBrowserHistory, History } from 'history'
import { combineReducers, install, StoreCreator, getModel } from 'redux-loop'
import {
  routerReducer,
  routerMiddleware,
  RouterState
} from 'react-router-redux'

import { profileReducer, ProfileState } from './profile/profileReducer'

import { intlReducer, IntlState } from './i18n/reducer'
import { draftsReducer, IDraftsState } from 'src/drafts'
import {
  reviewReducer,
  IReviewFormState
} from '@opencrvs/register/src/forms/register/reviewReducer'
import {
  registerFormReducer,
  IRegisterFormState
} from './forms/register/reducer'
import { navigationReducer, INavigationState } from 'src/navigation'
import {
  notificationReducer,
  NotificationState
} from 'src/notification/reducer'
import {
  IRejectState,
  rejectReducer
} from '@opencrvs/register/src/review/reducer'
import {
  IPrintFormState,
  printReducer
} from './views/PrintCertificate/printReducer'

export interface IStoreState {
  profile: ProfileState
  router: RouterState
  i18n: IntlState
  drafts: IDraftsState
  registerForm: IRegisterFormState
  navigation: INavigationState
  notification: NotificationState
  reviewForm: IReviewFormState
  printCertificateForm: IPrintFormState
  reject: IRejectState
}

const reducers = combineReducers<IStoreState>({
  profile: profileReducer,
  router: routerReducer,
  i18n: intlReducer,
  drafts: draftsReducer,
  registerForm: registerFormReducer,
  navigation: navigationReducer,
  notification: notificationReducer,
  reviewForm: reviewReducer,
  reject: rejectReducer,
  printCertificateForm: printReducer
})

const enhancedCreateStore = createReduxStore as StoreCreator

export type AppStore = Store<IStoreState, AnyAction>

export const createStore = (): { store: AppStore; history: History } => {
  const history = createBrowserHistory()
  const middleware = routerMiddleware(history)

  const enhancer = compose(
    install(),
    applyMiddleware(middleware),
    // tslint:disable no-any
    typeof (window as any).__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
      ? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
      : (f: any) => f
    // tslint:enable no-any
  ) as StoreEnhancer<IStoreState>

  const store = enhancedCreateStore<IStoreState, AnyAction>(
    reducers,
    getModel(reducers(undefined, { type: 'NOOP' })),
    enhancer
  )
  return { store, history }
}
