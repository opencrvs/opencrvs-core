import { fieldTransformers } from '@register/pdfRenderer/transformer/fieldTransformer'
import { userTransformers } from '@register/pdfRenderer/transformer/userTransformer'
import { serviceTransformers } from '@register/pdfRenderer/transformer/serviceTransformer'
import { IFunctionTransformer } from './types'

/*
  Transforms fields mentioned on pdf template
 */
export const transformers: IFunctionTransformer = {
  ...fieldTransformers,
  ...userTransformers,
  ...serviceTransformers
}
