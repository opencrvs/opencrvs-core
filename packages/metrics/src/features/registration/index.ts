export interface IBirthRegistrationPoint extends IPoint {
  current_status: string
  age_in_days: number | undefined
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IPoint {
  time?: string
}

export interface IPointLocation {
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IAuthHeader {
  Authorization: string
}

export interface IBirthRegistrationTags {
  reg_status: string
  gender: string | undefined
}
