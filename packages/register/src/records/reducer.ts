import { loop, Cmd, LoopReducer, Loop } from 'redux-loop'
import * as actions from './actions'
import { storage } from 'src/storage'
import { fetchMyRecords, IMyRecord } from '../utils/transforListData'

export type IMyRecordsState = {
  data: IMyRecord[]
  myRecordsLoaded: boolean
  loadingError: boolean
}

export const initialState: IMyRecordsState = {
  data: [],
  myRecordsLoaded: false,
  loadingError: false
}

export const myRecordsReducer: LoopReducer<IMyRecordsState, actions.Action> = (
  state: IMyRecordsState = initialState,
  action: actions.Action
): IMyRecordsState | Loop<IMyRecordsState, actions.Action> => {
  switch (action.type) {
    case actions.MY_RECORDS_LOAD_FAILED:
      return { ...state, loadingError: true }
    case actions.LOAD_MY_RECORDS:
      return loop(
        {
          ...state
        },
        Cmd.run<
          actions.IGetMyRecordsSuccessAction | actions.IGetMyRecordsFailedAction
        >(storage.getItem, {
          successActionCreator: actions.getMyRecordsSuccess,
          failActionCreator: actions.getMyRecordsFailed,
          args: ['records']
        })
      )
    case actions.MY_RECRODS_LOADED:
      storage.setItem('records', JSON.stringify(action.payload))
      return {
        ...state,
        loadingError: false,
        data: action.payload,
        myRecordsLoaded: true
      }
    case actions.GET_MY_RECORDS_SUCCESS:
      if (navigator.onLine) {
        return loop(
          {
            ...state
          },
          Cmd.run<
            actions.MyRecordsLoadedAction | actions.MyRecordsFailedAction
          >(fetchMyRecords, {
            successActionCreator: actions.myRecordsLoaded,
            failActionCreator: actions.myRecordsFailed
          })
        )
      } else {
        const myRecordsString = action.payload
        const myRecords: IMyRecord[] = JSON.parse(
          myRecordsString ? myRecordsString : '{}'
        )
        return {
          ...state,
          data: myRecords,
          myRecordsLoaded: true
        }
      }
    default:
      return state
  }
}
