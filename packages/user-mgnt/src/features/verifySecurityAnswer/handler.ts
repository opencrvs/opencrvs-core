import * as Hapi from 'hapi'
import * as Joi from 'joi'
import { unauthorized, conflict } from 'boom'
import User, { IUserModel } from '@user-mgnt/model/user'
import { generateHash } from '@user-mgnt/utils/hash'
import { logger } from '@user-mgnt/logger'
import { getRandomQuestionKey } from '@user-mgnt/features/verifyUser/handler'
import { isNonEmptyArray } from '@user-mgnt/utils/non-empty-array'

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

  const questionAnswers = user.securityQuestionAnswers || []

  const isCorrect = questionAnswers.some(
    securityQNA =>
      securityQNA.questionKey === payload.questionKey &&
      generateHash(payload.answer.toLowerCase(), user.salt) ===
        securityQNA.answerHash
  )

  if (
    !user.securityQuestionAnswers ||
    !isNonEmptyArray(user.securityQuestionAnswers)
  ) {
    logger.error(`Unable to get security questions for user: ${payload.userId}`)
    throw conflict("User doesn't have security questions")
  }

  return {
    matched: isCorrect,
    questionKey: isCorrect
      ? payload.questionKey
      : getRandomQuestionKey(user.securityQuestionAnswers, payload.questionKey)
  }
}

export const verifySecurityRequestSchema = Joi.object({
  userId: Joi.string().required(),
  questionKey: Joi.string().required(),
  answer: Joi.string().required()
})

export const verifySecurityResponseSchema = Joi.object({
  matched: Joi.bool(),
  questionKey: Joi.string()
})
