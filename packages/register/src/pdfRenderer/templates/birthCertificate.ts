import { IPDFTemplate } from '@register/pdfRenderer/transformer/types'
import { localFonts } from '@register/pdfRenderer/templates/localFonts'

export const template: IPDFTemplate = {
  definition: {
    pageSize: {
      width: 595.28,
      height: 791.89
    },
    info: {
      title: 'Birth Registration Certificate'
    },
    defaultStyle: {
      font: 'notosans'
    },
    content: [
      {
        table: {
          widths: ['100%'],
          body: [
            [
              {
                margin: [30, 25, 30, 25],
                stack: [
                  {
                    image: '{countryLogo}',
                    fit: [78, 78]
                  },
                  '\n',
                  {
                    text: [
                      {
                        text: 'Birth Registration No',
                        style: 'lightHeader'
                      },
                      {
                        text: ' / ',
                        style: 'lightHeader'
                      },
                      {
                        text: 'জন্ম নিবন্ধন নং: ',
                        style: 'bnLightHeader'
                      }
                    ]
                  },
                  {
                    text: [
                      {
                        text: '{registrationNumber}',
                        style: 'boldHeader'
                      },
                      {
                        text: ' / ',
                        style: 'boldHeader'
                      },
                      {
                        text: '{bnRegistrationNumber}',
                        style: 'bnBoldHeader'
                      }
                    ]
                  },
                  '\n',
                  {
                    text: [
                      {
                        text:
                          'Date of issuance of certificate: {certificateDate}'
                      }
                    ]
                  },
                  {
                    text: [
                      {
                        text: 'সনদ প্রদানের তারিখ: {bnCertificateDate}',
                        style: 'bnText'
                      }
                    ]
                  },
                  '\n',
                  {
                    canvas: [
                      {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 445,
                        y2: 0,
                        lineWidth: 1,
                        color: '#DADEDF'
                      }
                    ]
                  },
                  '\n',
                  {
                    table: {
                      widths: ['28%', '72%'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            text: 'This is to certify that',
                            style: 'boldText'
                          },
                          {
                            border: [false, false, false, false],
                            text: '{applicantName}',
                            style: 'subHeader'
                          }
                        ],
                        [
                          {
                            border: [false, false, false, false],
                            text: 'এটি প্রত্যয়ন করা হয় যে',
                            style: 'bnText'
                          },
                          {
                            border: [false, false, false, false],
                            text: '{applicantBnName}',
                            style: 'bnSubHeader'
                          }
                        ],
                        [
                          {
                            border: [false, false, false, false],
                            text: '\n'
                          },
                          {
                            border: [false, false, false, false],
                            text: '\n'
                          }
                        ],
                        [
                          {
                            border: [false, false, false, false],
                            text: 'Was born on',
                            style: 'boldText'
                          },
                          {
                            border: [false, false, false, false],
                            text: '{eventDate}',
                            style: 'subHeader'
                          }
                        ],
                        [
                          {
                            border: [false, false, false, false],
                            text: 'জন্মগ্রহণ করেন',
                            style: 'bnText'
                          },
                          {
                            border: [false, false, false, false],
                            text: '{eventBnDate}',
                            style: 'bnSubHeader'
                          }
                        ],
                        [
                          {
                            border: [false, false, false, false],
                            text: '\n'
                          },
                          {
                            border: [false, false, false, false],
                            text: '\n'
                          }
                        ],
                        [
                          {
                            border: [false, false, false, false],
                            text: 'Place of birth',
                            style: 'boldText'
                          },
                          {
                            border: [false, false, false, false],
                            text: 'Dhaka Medical Hospital, Dhaka',
                            style: 'subHeader'
                          }
                        ],
                        [
                          {
                            border: [false, false, false, false],
                            text: 'জন্মস্থান',
                            style: 'bnText'
                          },
                          {
                            border: [false, false, false, false],
                            text: 'ঢাকা মেডিকেল হসপিটাল, ঢাকা',
                            style: 'bnSubHeader'
                          }
                        ]
                      ]
                    }
                  },
                  '\n',
                  {
                    canvas: [
                      {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 445,
                        y2: 0,
                        lineWidth: 1,
                        color: '#DADEDF'
                      }
                    ]
                  },
                  '\n\n',
                  {
                    text: 'This event was registered at {registrationLocation}'
                  },
                  {
                    text: '{registrationBnLocation} এ ঘটনাটি নিবন্ধিত হয়েছিল',
                    style: 'bnText'
                  },
                  '\n',
                  {
                    text:
                      'Entitling them to all the rights of children born on Bangladesh soil'
                  },
                  {
                    text:
                      'বাংলাদেশের মাটিতে জন্মগ্রহণকারী শিশুদের সকল অধিকারের জন্য এনটাইটেল করা হল',
                    style: 'bnText'
                  },
                  '\n\n\n',
                  {
                    table: {
                      widths: ['30%'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            alignment: 'center',
                            image: '{registrarSignature}',
                            fit: [78, 50]
                          }
                        ],
                        [
                          {
                            border: [false, false, false, false],
                            canvas: [
                              {
                                type: 'line',
                                x1: 0,
                                y1: 0,
                                x2: 150,
                                y2: 0,
                                lineWidth: 0.5,
                                color: '#DADEDF'
                              }
                            ]
                          }
                        ],
                        [
                          {
                            border: [false, false, false, false],
                            alignment: 'center',
                            text: '{registrarName} ({role})'
                          }
                        ]
                      ]
                    }
                  }
                ]
              }
            ]
          ]
        }
      }
    ],
    styles: {
      lightHeader: {
        fontSize: 18
      },
      boldHeader: {
        fontSize: 18,
        bold: true
      },
      bnLightHeader: {
        fontSize: 18,
        font: 'notosansbn'
      },
      bnBoldHeader: {
        fontSize: 18,
        bold: true,
        font: 'notosansbn'
      },
      bnText: {
        font: 'notosansbn'
      },
      boldText: {
        bold: true
      },
      boldBnText: {
        bold: true,
        font: 'notosansbn'
      },
      subHeader: {
        fontSize: 13,
        bold: true
      },
      bnSubHeader: {
        fontSize: 12,
        bold: true,
        font: 'notosansbn'
      }
    }
  },
  fonts: localFonts.fonts,
  vfs: localFonts.vfs,
  transformers: [
    {
      field: 'countryLogo',
      operation: 'OfflineCompanyLogo',
      baseData: 'resource'
    },
    {
      field: 'registrationNumber',
      operation: 'FieldValue',
      parameters: {
        valueKey: 'registration.registrationNumber'
      }
    },
    {
      field: 'bnRegistrationNumber',
      operation: 'NumberConversion',
      parameters: {
        valueKey: 'registration.registrationNumber',
        conversionMap: {
          0: '০',
          1: '১',
          2: '২',
          3: '৩',
          4: '৪',
          5: '৫',
          6: '৬',
          7: '৭',
          8: '৮',
          9: '৯'
        }
      }
    },
    {
      field: 'certificateDate',
      operation: 'DateFieldValue',
      parameters: {
        format: 'DD MMMM YYYY',
        language: 'en',
        momentLocale: {
          en: 'locale/en-ie'
        }
      }
    },
    {
      field: 'bnCertificateDate',
      operation: 'DateFieldValue',
      parameters: {
        format: 'DD MMMM YYYY',
        language: 'bn',
        momentLocale: {
          bn: 'locale/bn'
        }
      }
    },
    {
      field: 'applicantName',
      operation: 'ApplicantName',
      parameters: {
        key: {
          birth: 'child'
        },
        format: {
          en: ['firstNamesEng', 'familyNameEng']
        },
        language: 'en'
      }
    },
    {
      field: 'applicantBnName',
      operation: 'ApplicantName',
      parameters: {
        key: {
          birth: 'child'
        },
        format: {
          bn: ['firstNames', 'familyName']
        },
        language: 'bn'
      }
    },
    {
      field: 'eventDate',
      operation: 'DateFieldValue',
      parameters: {
        key: {
          birth: 'child.childBirthDate'
        },
        format: 'DD MMMM YYYY',
        language: 'en',
        momentLocale: {
          en: 'locale/en-ie'
        }
      }
    },
    {
      field: 'eventBnDate',
      operation: 'DateFieldValue',
      parameters: {
        key: {
          birth: 'child.childBirthDate'
        },
        format: 'DD MMMM YYYY',
        language: 'bn',
        momentLocale: {
          bn: 'locale/bn'
        }
      }
    },
    {
      field: 'registrationLocation',
      operation: 'FormattedFieldValue',
      parameters: {
        formattedKeys:
          '{registration.regStatus.officeName}, {registration.regStatus.officeAddressLevel3}, {registration.regStatus.officeAddressLevel4}'
      }
    },
    {
      field: 'registrationBnLocation',
      operation: 'FormattedFieldValue',
      parameters: {
        formattedKeys: '{registration.regStatus.officeAlias}'
      }
    },
    {
      field: 'registrarSignature',
      operation: 'LoggedInUserSignature',
      baseData: 'userdetails'
    },
    {
      field: 'registrarName',
      operation: 'LoggedInUserName',
      baseData: 'userdetails'
    },
    { field: 'role', operation: 'LoggedInUserRole', baseData: 'userdetails' }
  ]
}
