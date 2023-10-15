const config = {
  config: {
    APPLICATION_NAME: 'Farajaland CRS',
    FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
    DECLARATION_AUDIT_LOCATIONS: 'DISTRICT',
    EXTERNAL_VALIDATION_WORKQUEUE: false,
    BIRTH: {
      REGISTRATION_TARGET: 30,
      LATE_REGISTRATION_TARGET: 365,
      FEE: {
        ON_TIME: 0,
        LATE: 5.5,
        DELAYED: 15
      },
      PRINT_IN_ADVANCE: true
    },
    COUNTRY_LOGO: {
      fileName: 'logo.png',
      file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAACCAYAAABllJ3tAAAABHNCSVQICAgIfAhkiAAAABl0RVh0U29mdHdhcmUAZ25vbWUtc2NyZWVuc2hvdO8Dvz4AAAAXSURBVAiZY1RWVv7PgAcw4ZNkYGBgAABYyAFsic1CfAAAAABJRU5ErkJggg=='
    },
    CURRENCY: {
      languagesAndCountry: ['en-US'],
      isoCode: 'USD'
    },
    DEATH: {
      REGISTRATION_TARGET: 45,
      FEE: {
        ON_TIME: 0,
        DELAYED: 0
      },
      PRINT_IN_ADVANCE: true
    },
    PHONE_NUMBER_PATTERN: '^0(7|9)[0-9]{8}$',
    NID_NUMBER_PATTERN: '^[0-9]{10}$',
    LOGIN_BACKGROUND: {
      backgroundColor: '36304E'
    },
    MARRIAGE: {
      REGISTRATION_TARGET: 45,
      FEE: {
        ON_TIME: 10,
        DELAYED: 45
      },
      PRINT_IN_ADVANCE: true
    },
    MARRIAGE_REGISTRATION: true,
    DATE_OF_BIRTH_UNKNOWN: false,
    INFORMANT_SIGNATURE: true,
    INFORMANT_SIGNATURE_REQUIRED: true,
    USER_NOTIFICATION_DELIVERY_METHOD: 'email',
    INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email'
  },
  certificates: [
    {
      _id: '65098469e84ef7331ae9e7a2',
      svgCode: 'http://localhost:3535/certificates/death',
      svgFilename: 'farajaland-death-certificate-v1.svg',
      user: 'o.admin',
      event: 'death',
      status: 'ACTIVE',
      svgDateUpdated: 1695122537070,
      svgDateCreated: 1695122537070,
      __v: 0
    },
    {
      _id: '65098469e84ef7331ae9e7a4',
      svgCode: 'http://localhost:3535/certificates/marriage',
      svgFilename: 'farajaland-marriage-certificate-v1.svg',
      user: 'o.admin',
      event: 'marriage',
      status: 'ACTIVE',
      svgDateUpdated: 1695122537365,
      svgDateCreated: 1695122537365,
      __v: 0
    },
    {
      _id: '65098469e84ef7331ae9e7a6',
      svgCode: 'http://localhost:3535/certificates/birth',
      svgFilename: 'farajaland-birth-certificate-v1.svg',
      user: 'o.admin',
      event: 'birth',
      status: 'ACTIVE',
      svgDateUpdated: 1695122537670,
      svgDateCreated: 1695122537670,
      __v: 0
    }
  ],
  systems: [
    {
      name: 'DCI',
      status: 'active',
      type: 'RECORD_SEARCH',
      _id: '65251142f292187d78af682b',
      shaSecret: '1edf4978-d428-4364-9440-082d17a5fdec',
      clientId: '31a0796d-a59d-417e-854c-da6f336e7d13',
      settings: {
        webhook: [],
        dailyQuota: 2000
      }
    }
  ]
}

export default config
