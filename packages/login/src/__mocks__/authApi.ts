import { config } from '../config'
import { IStepOneData } from '../type/login'
import { resolve } from 'url'
import * as moxios from 'moxios'

const submitStepOne = (data: IStepOneData) => {
  return moxios.stubRequest(resolve(config.AUTH_API_URL, 'authenticate'), {
    status: 200,
    responseText: "{ nonce: '12345' }"
  })
}

export const authApi = {
  submitStepOne
}
