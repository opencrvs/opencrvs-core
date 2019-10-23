import { fieldTransformers } from '@register/pdfRenderer/transformer/fieldTransformer'
import { userTransformers } from '@register/pdfRenderer/transformer/userTransformer'
import { offlineTransformers } from '@register/pdfRenderer/transformer/offlineTransformer'
import { IFunctionTransformer } from './types'

/*
  Transforms fields based on pdf template
 */
export const transformers: IFunctionTransformer = {
  ...fieldTransformers,
  ...userTransformers,
  ...offlineTransformers
}
