export interface BirthRegistrationPoint extends Point {
  current_status: string
  gender: string | undefined
  age_in_days: number | undefined
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface Point {
  time?: string
}

export interface PointLocation {
  locationLevel5?: string
  locationLevel4?: string
  locationLevel3?: string
  locationLevel2?: string
}

export interface IAuthHeader {
  Authorization: string
}
