type KnownExtensionType = {
  'http://opencrvs.org/specs/extension/regLastUser': {
    url: 'http://opencrvs.org/specs/extension/regLastUser'
    valueReference: {
      reference: `${string}/${string}`
    }
  }
  'http://opencrvs.org/specs/extension/paymentDetails': {
    url: 'http://opencrvs.org/specs/extension/paymentDetails'
    valueReference: {
      reference: string
    }
  }
}

export function findExtension<T extends keyof KnownExtensionType>(
  url: T,
  extensions: fhir3.Extension[]
): KnownExtensionType[T] | undefined {
  return extensions.find(
    (obj: fhir3.Extension): obj is KnownExtensionType[T] => {
      return obj.url === url
    }
  )
}
