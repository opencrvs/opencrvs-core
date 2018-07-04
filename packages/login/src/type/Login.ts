export interface IStepOneData {
  mobile: string
  password: string
}

export interface IStepTwoSMSData {
  code1: string
  code2: string
  code3: string
  code4: string
  code5: string
  code6: string
}

export interface IStepTwoData {
  nonce: string
  code: string
}
