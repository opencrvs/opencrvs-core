import { storage } from '@client/storage'
import { UserDetails } from '@client/utils/userUtils'

export interface IUserData {
  userID: string
  userPIN?: string
}

export async function getCurrentUserID(): Promise<string> {
  const userDetails = await storage.getItem('USER_DETAILS')

  if (!userDetails) {
    return ''
  }
  return (JSON.parse(userDetails) as UserDetails).userMgntUserID || ''
}
