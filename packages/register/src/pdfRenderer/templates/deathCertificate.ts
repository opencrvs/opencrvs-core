import { IPDFTemplate } from '@register/pdfRenderer/transformer/types'
import { localFonts } from '@register/pdfRenderer/templates/localFonts'
import {
  SEAL_BD_GOVT,
  DUMMY_SIGNATURE
} from '@opencrvs/register/src/pdfRenderer/templates/logo'

export const template: IPDFTemplate = {
  definition: {
    pageSize: {
      width: 595.28,
      height: 791.89
    },
    info: {
      title: 'Death Registration Certificate'
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
                    image: SEAL_BD_GOVT,
                    fit: [78, 78]
                  },
                  '\n',
                  {
                    text: [
                      {
                        text: 'Death Registration No',
                        style: 'lightHeader'
                      },
                      {
                        text: ' / ',
                        style: 'lightHeader'
                      },
                      {
                        text: 'মৃত্যু নিবন্ধন নং: ',
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
                            text: 'Died on',
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
                            text: 'মৃত্যুবরণ করেন',
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
                            text: 'Place of death',
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
                            text: 'মৃত্যুবরণ স্থান',
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
                  '\n\n\n',
                  {
                    text: 'This event was registered at {registrationLocation}'
                  },
                  {
                    text: '{registrationBnLocation} এ ঘটনাটি নিবন্ধিত হয়েছিল',
                    style: 'bnText'
                  },
                  '\n\n\n\n\n',
                  {
                    table: {
                      widths: ['30%'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            alignment: 'center',
                            image: DUMMY_SIGNATURE,
                            fit: [78, 78]
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
      field: 'registrationNumber',
      operation: 'FieldValue',
      parameters: {
        valueKey: 'registration.registrationNumber'
      }
    },
    {
      field: 'bnRegistrationNumber',
      operation: 'BanglaNumberConversion',
      parameters: {
        valueKey: 'registration.registrationNumber'
      }
    },
    {
      field: 'certificateDate',
      operation: 'DateFieldValue',
      parameters: {
        format: 'DD MMMM YYYY',
        language: 'en'
      }
    },
    {
      field: 'bnCertificateDate',
      operation: 'DateFieldValue',
      parameters: {
        format: 'DD MMMM YYYY',
        language: 'bn'
      }
    },
    {
      field: 'applicantName',
      operation: 'ApplicantName',
      parameters: {
        key: {
          death: 'deceased'
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
          death: 'deceased'
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
          death: 'deathEvent.deathDate'
        },
        format: 'DD MMMM YYYY',
        language: 'en'
      }
    },
    {
      field: 'eventBnDate',
      operation: 'DateFieldValue',
      parameters: {
        key: {
          death: 'deathEvent.deathDate'
        },
        format: 'DD MMMM YYYY',
        language: 'bn'
      }
    },
    {
      field: 'registrationLocation',
      operation: 'FormattedFieldValue',
      parameters: {
        formattedKeys:
          '{registration.regStatus.office.name}, {registration.regStatus.office.address.district}, {registration.regStatus.office.address.state}'
      }
    },
    {
      field: 'registrationBnLocation',
      operation: 'FormattedFieldValue',
      parameters: {
        formattedKeys: '{registration.regStatus.office.alias}'
      }
    },
    {
      field: 'registrarName',
      operation: 'LoggedInUserName',
      baseData: 'userdetails'
    },
    { field: 'role', operation: 'LoggedInUserRole', baseData: 'userdetails' }
  ]
}
