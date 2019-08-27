import { fieldTransformers } from '@register/pdfRenderer/transformer/fieldTransformer'
import { userTransformers } from '@register/pdfRenderer/transformer/userTransformer'
import { IFunctionTransformer } from './types'

/*
  Transforms fields based on pdf template
 */
export const transformers: IFunctionTransformer = {
  ...fieldTransformers,
  ...userTransformers
}
