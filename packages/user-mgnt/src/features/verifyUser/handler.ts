import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import User, {
  IUserModel,
  ISecurityQuestionAnswer
} from '@user-mgnt/model/user'

interface IVerifyPayload {
  mobile: string
}

interface IVerifyResponse {
  mobile: string
  scope: string[]
  status: string
  securityQuestionKey: string
  id: string
  username: string
}

export default async function verifyUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { mobile } = request.payload as IVerifyPayload

  const user: IUserModel | null = await User.findOne({ mobile })

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  const response: IVerifyResponse = {
    mobile: user.mobile,
    scope: user.scope,
    status: user.status,
    securityQuestionKey: getRandomQuestionKey(user.securityQuestionAnswers),
    id: user.id,
    username: user.username
  }

  return response
}

export function getRandomQuestionKey(
  securityQuestionAnswers: ISecurityQuestionAnswer[] | undefined,
  questionKeyToSkip?: string
): string {
  if (!securityQuestionAnswers || securityQuestionAnswers.length === 0) {
    throw new Error('No security questions found')
  }

  const filteredQuestions = questionKeyToSkip
    ? securityQuestionAnswers.filter(
        securityQnA => securityQnA.questionKey !== questionKeyToSkip
      )
    : securityQuestionAnswers
  return filteredQuestions[
    // tslint:disable-next-line
    Math.floor(Math.random() * filteredQuestions.length)
  ].questionKey
}

export const requestSchema = Joi.object({
  mobile: Joi.string().required()
})

export const responseSchema = Joi.object({
  mobile: Joi.string(),
  scope: Joi.array().items(Joi.string()),
  status: Joi.string(),
  securityQuestionKey: Joi.string(),
  id: Joi.string(),
  username: Joi.string()
})
