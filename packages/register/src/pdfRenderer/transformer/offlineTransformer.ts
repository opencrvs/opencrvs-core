import { IntlShape } from 'react-intl'
import {
  IFunctionTransformer,
  TransformableData
} from '@register/pdfRenderer/transformer/types'
import { IOfflineData } from '@register/offline/reducer'

export const offlineTransformers: IFunctionTransformer = {
  /*
    OfflineCompanyLogo provides the company logo from offline data.    
  */
  OfflineCompanyLogo: (data: TransformableData, intl: IntlShape) => {
    return (data as IOfflineData).assets.logo
  }
}
