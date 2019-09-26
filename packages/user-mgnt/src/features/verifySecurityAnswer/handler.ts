import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized } from 'boom'
import User, { IUserModel } from '@user-mgnt/model/user'
import { generateHash } from '@user-mgnt/utils/hash'
import { logger } from '@user-mgnt/logger'

interface IVerifySecurityAnswer {
  userId: string
  questionKey: string
  answer: string
}

export default async function verifySecurityAnswer(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IVerifySecurityAnswer

  const user: IUserModel | null = await User.findById(payload.userId)
  if (!user) {
    logger.error(`No user details found by given userid: ${payload.userId}`)
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  const answers = user.securityQuestionAnswers || []

  const isCorrect = answers.some(
    securityQNA =>
      securityQNA.questionKey === payload.questionKey &&
      generateHash(payload.answer.toLowerCase(), user.salt) ===
        securityQNA.answerHash
  )

  if (isCorrect) {
    return h.response().code(200)
  }
  return unauthorized()
}

export const verifySecurityRequestSchema = Joi.object({
  userId: Joi.string().required(),
  questionKey: Joi.string().required(),
  answer: Joi.string().required()
})
