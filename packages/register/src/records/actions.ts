import { IMyRecord } from '../utils/transforListData'

export const LOAD_MY_RECORDS = 'MY_RECORDS/LOAD'
type LoadMyRecords = {
  type: typeof LOAD_MY_RECORDS
}

export const MY_RECORDS_LOAD_FAILED = 'MY_RECORDS/LOAD_FAILED'
export type MyRecordsFailedAction = {
  type: typeof MY_RECORDS_LOAD_FAILED
  payload: Error
}

export const MY_RECRODS_LOADED = 'MY_RECORDS/LOADED'
export type MyRecordsLoadedAction = {
  type: typeof MY_RECRODS_LOADED
  payload: any
}

export const GET_MY_RECORDS_SUCCESS = 'MY_RECORDS/GET_MY_RECORDS_SUCCESS'
export type IGetMyRecordsSuccessAction = {
  type: typeof GET_MY_RECORDS_SUCCESS
  payload: string
}
export const GET_MY_RECORDS_FAILED = 'OMY_RECORDS/GET_MY_RECORDS_FAILED'
export type IGetMyRecordsFailedAction = {
  type: typeof GET_MY_RECORDS_FAILED
}

export type Action =
  | LoadMyRecords
  | MyRecordsLoadedAction
  | MyRecordsFailedAction
  | IGetMyRecordsSuccessAction
  | IGetMyRecordsFailedAction

export const getMyRecords = () => ({
  type: LOAD_MY_RECORDS
})

export const myRecordsLoaded = (
  payloadData: IMyRecord[]
): MyRecordsLoadedAction => ({
  type: MY_RECRODS_LOADED,
  payload: payloadData
})

export const myRecordsFailed = (error: Error): MyRecordsFailedAction => ({
  type: MY_RECORDS_LOAD_FAILED,
  payload: error
})

export const getMyRecordsSuccess = (
  response: string
): IGetMyRecordsSuccessAction => ({
  type: GET_MY_RECORDS_SUCCESS,
  payload: response
})

export const getMyRecordsFailed = (): IGetMyRecordsFailedAction => ({
  type: GET_MY_RECORDS_FAILED
})
