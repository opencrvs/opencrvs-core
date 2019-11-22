/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
export const template = {
  birth: {
    definition: {
      pageSize: {
        width: 595.28,
        height: 900
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
                  border: [false, false, false, false],
                  stack: [
                    {
                      text: [
                        {
                          text: 'গণপ্রজাতন্ত্রী বাংলাদেশ',
                          alignment: 'center',
                          style: 'bnBoldHeader'
                        },
                        '\n',
                        {
                          text: "(People's Republic of Bangladesh)"
                        },
                        '\n',
                        {
                          text: 'জন্ম ও মৃত্যু নিবন্ধকের কার্যালয়/',
                          style: 'bnBoldHeader'
                        },
                        {
                          text: 'Office of Birth and Death Registrar',
                          style: 'boldHeader'
                        },
                        '\n',
                        {
                          text: '{crvsOfficeLocationBnName}, ',
                          style: 'bnText'
                        },
                        {
                          text: 'উপজেলা/থানাঃ {crvsOfficeUpazilaBnName}',
                          style: 'bnText'
                        },
                        '\n',
                        {
                          text: 'জেলাঃ {crvsOfficeDistrictBnName}, ',
                          style: 'bnText'
                        },
                        {
                          text: 'বাংলাদেশ ।',
                          style: 'bnText'
                        },
                        '\n',
                        {
                          text: 'জন্ম নিবন্ধন সনদ/',
                          style: 'bnBoldHeader'
                        },
                        {
                          text: 'Birth Registration Certificate',
                          style: 'boldHeader'
                        }
                      ],
                      alignment: 'center'
                    },
                    '\n',
                    {
                      text: [
                        {
                          text: '[বিধি ৯ ও ১০ দ্রষ্টব্য]',
                          style: 'boldBnText'
                        },
                        '\n',
                        {
                          text: '(জন্ম নিবন্ধন বহি হইতে উদ্ধৃত)',
                          style: 'bnText'
                        }
                      ],
                      alignment: 'center'
                    },
                    '\n',
                    {
                      table: {
                        widths: ['20%', '18%', '62%'],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              text: [
                                {
                                  text: 'নিবন্ধন বহি নংঃ',
                                  style: 'boldBnText'
                                },
                                '\n\n',
                                {
                                  text: '(Register no)'
                                }
                              ]
                            },
                            {
                              text: ''
                            },
                            {
                              border: [false, false, false, false],
                              alignment: 'right',
                              text: [
                                {
                                  text: 'সনদ প্রদানের তারিখঃ ',
                                  style: 'boldBnText'
                                },
                                {
                                  text: '{certificationDate}',
                                  style: 'boldText'
                                },
                                '\n',
                                {
                                  text:
                                    'Date of issuance of certificate (dd/mm/yyyy)'
                                }
                              ]
                            }
                          ]
                        ]
                      }
                    },
                    {
                      margin: [0, 5, 0, 5],
                      text: [
                        {
                          text: 'Date of registration (dd/mm/yyyy) : '
                        },
                        {
                          text: '{registrationDate}',
                          style: 'boldText'
                        }
                      ]
                    },
                    {
                      table: {
                        widths: [
                          '49%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%',
                          '3%'
                        ],
                        body: [
                          [
                            {
                              text: [
                                {
                                  text: 'জন্ম নিবন্ধন নম্বর',
                                  style: 'boldBnText'
                                },
                                '\n',
                                {
                                  text: '(Birth Registration Number)'
                                }
                              ]
                            },
                            {
                              text: '{registrationNumberChar1}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar2}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar3}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar4}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar5}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar6}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar7}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar8}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar9}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar10}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar11}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar12}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar13}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar14}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar15}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar16}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            },
                            {
                              text: '{registrationNumberChar17}',
                              style: 'boldText',
                              margin: [0, 8, 0, 0]
                            }
                          ]
                        ]
                      }
                    },
                    {
                      margin: [0, 5, 0, 0],
                      text: [
                        {
                          text: 'নাম (বাংলায়) :    ',
                          style: 'bnText'
                        },
                        {
                          text: '{childBnFullName}',
                          style: 'boldBnText'
                        }
                      ]
                    },
                    {
                      text: [
                        {
                          text: 'Name (In capital letter) :    '
                        },
                        {
                          text: '{childFullNameInCapital}',
                          style: 'boldText'
                        }
                      ]
                    },
                    {
                      margin: [-5, 8, 0, 0],
                      table: {
                        widths: [
                          '34%',
                          '5%',
                          '5%',
                          '3%',
                          '5%',
                          '5%',
                          '3%',
                          '5%',
                          '5%',
                          '5%',
                          '5%',
                          '20%'
                        ],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              text: {
                                text: 'জন্ম তারিখঃ',
                                style: 'boldBnText'
                              }
                            },
                            {
                              text: '{childBirthDateChar1}',
                              alignment: 'center',
                              style: 'boldText'
                            },
                            {
                              text: '{childBirthDateChar2}',
                              alignment: 'center',
                              style: 'boldText'
                            },
                            {
                              text: '',
                              fillColor: 'black'
                            },
                            {
                              text: '{childBirthDateChar4}',
                              alignment: 'center',
                              style: 'boldText'
                            },
                            {
                              text: '{childBirthDateChar5}',
                              alignment: 'center',
                              style: 'boldText'
                            },
                            {
                              text: '',
                              fillColor: 'black'
                            },
                            {
                              text: '{childBirthDateChar7}',
                              alignment: 'center',
                              style: 'boldText'
                            },
                            {
                              text: '{childBirthDateChar8}',
                              alignment: 'center',
                              style: 'boldText'
                            },
                            {
                              text: '{childBirthDateChar9}',
                              alignment: 'center',
                              style: 'boldText'
                            },
                            {
                              text: '{childBirthDateChar10}',
                              alignment: 'center',
                              style: 'boldText'
                            },
                            {
                              border: [false, false, false, false],
                              alignment: 'center',
                              text: [
                                {
                                  text: 'Sex: '
                                },
                                {
                                  text: '{childSex}',
                                  style: 'boldText'
                                }
                              ]
                            }
                          ]
                        ]
                      }
                    },
                    {
                      margin: [-5, 0, 0, 0],
                      table: {
                        widths: ['30%', '10%', '20%', '22%', '18%'],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              text: '(Date of Birth in number)'
                            },
                            {
                              border: [false, false, false, false],
                              alignment: 'center',
                              text: [
                                {
                                  text: 'দিন',
                                  style: 'bnText'
                                },
                                {
                                  text: '(Day)'
                                }
                              ]
                            },
                            {
                              border: [false, false, false, false],
                              alignment: 'center',
                              text: [
                                {
                                  text: 'মাস',
                                  style: 'bnText'
                                },
                                {
                                  text: '(Month)'
                                }
                              ]
                            },
                            {
                              border: [false, false, false, false],
                              alignment: 'center',
                              text: [
                                {
                                  text: 'বছর',
                                  style: 'bnText'
                                },
                                {
                                  text: '(Year)'
                                }
                              ]
                            },
                            {
                              border: [false, false, false, false],
                              alignment: 'center',
                              text: '(লিঙ্গ)',
                              style: 'bnText'
                            }
                          ]
                        ]
                      }
                    },
                    {
                      margin: [0, 5, 0, 0],
                      text: [
                        {
                          text: 'কথায় ',
                          style: 'bnText'
                        },
                        {
                          text: '(In words) :    '
                        },
                        {
                          text: '{childFormatedBirthDate}',
                          style: 'boldText'
                        }
                      ]
                    },
                    {
                      margin: [-5, 5, 0, 0],
                      table: {
                        widths: ['13%', '5%', '15%', '5%', '62%'],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              text: 'পিতা-মাতার',
                              style: 'bnText'
                            },
                            {
                              text: '{bnBirthNumber}',
                              style: 'boldBnText',
                              alignment: 'center'
                            },
                            {
                              border: [false, false, false, false],
                              text: ' তম সন্তান   /',
                              style: 'bnText'
                            },
                            {
                              text: '{birthNumber}',
                              style: 'boldText',
                              alignment: 'center'
                            },
                            {
                              border: [false, false, false, false],
                              text: ' th child of Parents.'
                            }
                          ]
                        ]
                      }
                    },
                    {
                      margin: [0, 5, 0, 0],
                      text: [
                        {
                          text: 'জন্ম স্থান ',
                          style: 'bnText'
                        },
                        {
                          text: '(Place of Birth) :    '
                        },
                        {
                          text: '{birthDistrictOrForiegnCountry}',
                          style: 'boldText'
                        }
                      ]
                    },
                    {
                      margin: [0, 5, 0, 0],
                      text: [
                        {
                          text: 'স্থায়ী ঠিকানা ',
                          style: 'bnText'
                        },
                        {
                          text: '(Permanent Address) :    '
                        },
                        {
                          text: '{motherPermanentAddress}',
                          style: 'boldText'
                        }
                      ]
                    },
                    {
                      margin: [0, 5, 0, 0],
                      table: {
                        widths: ['40%', '60%'],
                        body: [
                          [
                            {
                              text: [
                                {
                                  text: 'পিতার নাম / ',
                                  style: 'bnText'
                                },
                                {
                                  text: "Father's Name"
                                }
                              ]
                            },
                            {
                              text: '{fatherFullNameInCapital}',
                              style: 'boldText'
                            }
                          ],
                          [
                            {
                              text: [
                                {
                                  text: 'জন্ম নিবন্ধন নম্বর / ',
                                  style: 'bnText'
                                },
                                {
                                  text: 'BRN'
                                }
                              ]
                            },
                            {
                              margin: [-5, -3, 0, -3],
                              table: {
                                widths: [
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%'
                                ],
                                body: [
                                  [
                                    {
                                      text: '{fatherBRNChar1}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar2}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar3}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar4}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar5}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar6}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar7}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar8}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar9}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar10}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar11}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar12}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar13}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar14}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar15}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar16}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherBRNChar17}',
                                      style: 'boldText'
                                    }
                                  ]
                                ]
                              }
                            }
                          ],
                          [
                            {
                              text: [
                                {
                                  text: 'জাতীয় পরিচয়পত্র নম্বর / ',
                                  style: 'bnText'
                                },
                                {
                                  text: 'NID'
                                }
                              ]
                            },
                            {
                              margin: [-5, -3, 0, -3],
                              table: {
                                widths: [
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%'
                                ],
                                body: [
                                  [
                                    {
                                      text: '{fatherNIDChar1}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar2}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar3}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar4}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar5}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar6}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar7}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar8}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar9}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar10}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar11}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar12}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar13}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar14}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar15}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar16}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{fatherNIDChar17}',
                                      style: 'boldText'
                                    }
                                  ]
                                ]
                              }
                            }
                          ],
                          [
                            {
                              text: [
                                {
                                  text: 'বিদেশীদের ক্ষেত্রে জাতীয়তা / ',
                                  style: 'bnText'
                                },
                                {
                                  text: 'Nationality for foreigners'
                                }
                              ]
                            },
                            {
                              margin: [0, 5, 0, 0],
                              text: '{fatherForiegnCountry}',
                              style: 'boldText'
                            }
                          ]
                        ]
                      }
                    },
                    {
                      margin: [0, 5, 0, 0],
                      table: {
                        widths: ['40%', '60%'],
                        body: [
                          [
                            {
                              text: [
                                {
                                  text: 'মাতার নাম / ',
                                  style: 'bnText'
                                },
                                {
                                  text: "Mother's Name"
                                }
                              ]
                            },
                            {
                              text: '{motherFullNameInCapital}',
                              style: 'boldText'
                            }
                          ],
                          [
                            {
                              text: [
                                {
                                  text: 'জন্ম নিবন্ধন নম্বর / ',
                                  style: 'bnText'
                                },
                                {
                                  text: 'BRN'
                                }
                              ]
                            },
                            {
                              margin: [-5, -3, 0, -3],
                              table: {
                                widths: [
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%'
                                ],
                                body: [
                                  [
                                    {
                                      text: '{motherBRNChar1}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar2}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar3}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar4}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar5}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar6}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar7}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar8}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar9}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar10}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar11}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar12}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar13}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar14}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar15}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar16}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherBRNChar17}',
                                      style: 'boldText'
                                    }
                                  ]
                                ]
                              }
                            }
                          ],
                          [
                            {
                              text: [
                                {
                                  text: 'জাতীয় পরিচয়পত্র নম্বর / ',
                                  style: 'bnText'
                                },
                                {
                                  text: 'NID'
                                }
                              ]
                            },
                            {
                              margin: [-5, -3, 0, -3],
                              table: {
                                widths: [
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6.2%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%',
                                  '6%'
                                ],
                                body: [
                                  [
                                    {
                                      text: '{motherNIDChar1}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar2}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar3}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar4}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar5}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar6}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar7}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar8}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar9}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar10}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar11}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar12}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar13}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar14}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar15}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar16}',
                                      style: 'boldText'
                                    },
                                    {
                                      text: '{motherNIDChar17}',
                                      style: 'boldText'
                                    }
                                  ]
                                ]
                              }
                            }
                          ],
                          [
                            {
                              text: [
                                {
                                  text: 'বিদেশীদের ক্ষেত্রে জাতীয়তা / ',
                                  style: 'bnText'
                                },
                                {
                                  text: 'Nationality for foreigners'
                                }
                              ]
                            },
                            {
                              margin: [0, 5, 0, 0],
                              text: '{motherForeignCountry}',
                              style: 'boldText'
                            }
                          ]
                        ]
                      }
                    },
                    {
                      margin: [-5, 5, 0, 0],
                      table: {
                        widths: ['30%', '18%', '28%', '27%'],
                        body: [
                          [
                            {
                              border: [false, false, false, false],
                              canvas: [
                                {
                                  type: 'rect',
                                  x: 28,
                                  y: 0,
                                  w: 75,
                                  h: 75,
                                  lineWidth: 1,
                                  dash: { length: 2, space: 3 },
                                  r: 100
                                }
                              ]
                            },
                            {
                              border: [false, false, false, false],
                              text: ''
                            },
                            {
                              border: [false, false, false, false],
                              text: ''
                            },
                            {
                              border: [false, false, false, false],
                              text: ''
                            }
                          ],
                          [
                            {
                              border: [false, false, false, false],
                              text: [
                                {
                                  text: 'নিবন্ধকের কার্যালয়ের সিলমোহর',
                                  style: 'bnBoldFooter'
                                },
                                '\n',
                                {
                                  text: "(Seal of Registrar's Office)",
                                  style: 'boldFooter'
                                }
                              ]
                            },
                            {
                              border: [false, false, false, false],
                              text: [
                                {
                                  text: 'প্রস্তুতকারীর স্বাক্ষর',
                                  style: 'bnBoldFooter'
                                },
                                '\n',
                                {
                                  text: '(Prepared by)',
                                  style: 'boldFooter'
                                }
                              ]
                            },
                            {
                              border: [false, false, false, false],
                              text: [
                                {
                                  text: 'যাচাইকারীর নাম, স্বাক্ষর ও সিল',
                                  style: 'bnBoldFooter'
                                },
                                '\n',
                                {
                                  margin: [50, 0, 0, 0],
                                  text: '(Verified by)',
                                  style: 'boldFooter'
                                }
                              ]
                            },
                            {
                              border: [false, false, false, false],
                              text: [
                                {
                                  text: 'নিবন্ধকের স্বাক্ষর ও নামসহ সিল',
                                  style: 'bnBoldFooter'
                                },
                                '\n',
                                {
                                  text: '(Signature of the Registrar)',
                                  style: 'boldFooter'
                                }
                              ]
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
        boldHeader: {
          fontSize: 15,
          bold: true
        },
        bnBoldHeader: {
          fontSize: 15,
          bold: true,
          font: 'notosansbn'
        },
        boldFooter: {
          fontSize: 10,
          bold: true
        },
        bnBoldFooter: {
          fontSize: 10,
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
        }
      }
    },
    transformers: [
      {
        field: 'crvsOfficeLocationBnName',
        operation: 'CRVSOfficeName',
        parameters: {
          language: 'bn'
        }
      },
      {
        field: 'crvsOfficeUpazilaBnName',
        operation: 'CRVSLocationName',
        parameters: {
          language: 'bn',
          jurisdictionType: 'UPAZILA'
        }
      },
      {
        field: 'crvsOfficeDistrictBnName',
        operation: 'CRVSLocationName',
        parameters: {
          language: 'bn',
          jurisdictionType: 'DISTRICT'
        }
      },
      {
        field: 'certificationDate',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          momentLocale: {
            en: 'locale/en-ie'
          }
        }
      },
      {
        field: 'registrationDate',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'registration.regStatus.statusDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        }
      },
      {
        field: 'registrationNumberChar1',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 0
      },
      {
        field: 'registrationNumberChar2',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 1
      },
      {
        field: 'registrationNumberChar3',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 2
      },
      {
        field: 'registrationNumberChar4',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 3
      },
      {
        field: 'registrationNumberChar5',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 4
      },
      {
        field: 'registrationNumberChar6',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 5
      },
      {
        field: 'registrationNumberChar7',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 6
      },
      {
        field: 'registrationNumberChar8',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 7
      },
      {
        field: 'registrationNumberChar9',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 8
      },
      {
        field: 'registrationNumberChar10',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 9
      },
      {
        field: 'registrationNumberChar11',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 10
      },
      {
        field: 'registrationNumberChar12',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 11
      },
      {
        field: 'registrationNumberChar13',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 12
      },
      {
        field: 'registrationNumberChar14',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 13
      },
      {
        field: 'registrationNumberChar15',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 14
      },
      {
        field: 'registrationNumberChar16',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 15
      },
      {
        field: 'registrationNumberChar17',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
        },
        valueIndex: 16
      },
      {
        field: 'childBnFullName',
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
        field: 'childFullNameInCapital',
        operation: 'ApplicantName',
        parameters: {
          key: {
            birth: 'child'
          },
          format: {
            en: ['firstNamesEng', 'familyNameEng']
          },
          allCapital: true,
          language: 'en'
        }
      },
      {
        field: 'childBirthDateChar1',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 0
      },
      {
        field: 'childBirthDateChar1',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 0
      },
      {
        field: 'childBirthDateChar1',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 0
      },
      {
        field: 'childBirthDateChar2',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 1
      },
      {
        field: 'childBirthDateChar4',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 3
      },
      {
        field: 'childBirthDateChar5',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 4
      },
      {
        field: 'childBirthDateChar7',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 6
      },
      {
        field: 'childBirthDateChar8',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 7
      },
      {
        field: 'childBirthDateChar9',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 8
      },
      {
        field: 'childBirthDateChar10',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD/MM/YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        },
        valueIndex: 9
      },
      {
        field: 'childSex',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'child.gender'
        }
      },
      {
        field: 'childFormatedBirthDate',
        operation: 'DateFieldValue',
        parameters: {
          format: 'DD MMMM, YYYY',
          language: 'en',
          key: {
            birth: 'child.childBirthDate'
          },
          momentLocale: {
            en: 'locale/en-ie'
          }
        }
      },
      {
        field: 'bnBirthNumber',
        operation: 'NumberConversion',
        parameters: {
          valueKey: 'child.multipleBirth',
          conversionMap: {
            '0': '০',
            '1': '১',
            '2': '২',
            '3': '৩',
            '4': '৪',
            '5': '৫',
            '6': '৬',
            '7': '৭',
            '8': '৮',
            '9': '৯'
          }
        }
      },
      {
        field: 'birthNumber',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'child.multipleBirth'
        }
      },
      {
        field: 'birthDistrictOrForiegnCountry',
        operation: 'OfflineAddress',
        parameters: {
          language: 'en',
          conditionalKeys: [
            {
              condition: {
                key: 'child.placeOfBirth',
                matchValues: ['HEALTH_FACILITY']
              },
              addressType: 'facilities',
              addressKey: 'name',
              addresses: {
                countryCode: 'BGD',
                localAddress: '{child.birthLocation}'
              }
            },
            {
              condition: {
                key: 'child.placeOfBirth',
                matchValues: ['PRIVATE_HOME', 'OTHER']
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'child.country',
                localAddress: '{child.district}',
                internationalAddress: '{child.country}'
              }
            }
          ]
        }
      },
      {
        field: 'motherPermanentAddress',
        operation: 'OfflineAddress',
        parameters: {
          language: 'en',
          conditionalKeys: [
            {
              condition: {
                default: true
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'mother.countryPermanent',
                localAddress:
                  '{mother.addressLine4Permanent}, {mother.districtPermanent}, {mother.statePermanent}, {mother.countryPermanent}',
                internationalAddress:
                  '{mother.internationalDistrictPermanent}, {mother.internationalStatePermanent}, {mother.countryPermanent}'
              }
            }
          ]
        }
      },
      {
        field: 'fatherFullNameInCapital',
        operation: 'ApplicantName',
        parameters: {
          key: {
            birth: 'father'
          },
          format: {
            en: ['firstNamesEng', 'familyNameEng']
          },
          allCapital: true,
          language: 'en'
        }
      },
      {
        field: 'fatherBRNChar1',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 0
      },
      {
        field: 'fatherBRNChar2',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 1
      },
      {
        field: 'fatherBRNChar3',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 2
      },
      {
        field: 'fatherBRNChar4',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 3
      },
      {
        field: 'fatherBRNChar5',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 4
      },
      {
        field: 'fatherBRNChar6',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 5
      },
      {
        field: 'fatherBRNChar7',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 6
      },
      {
        field: 'fatherBRNChar8',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 7
      },
      {
        field: 'fatherBRNChar9',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 8
      },
      {
        field: 'fatherBRNChar10',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 9
      },
      {
        field: 'fatherBRNChar11',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 10
      },
      {
        field: 'fatherBRNChar12',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 11
      },
      {
        field: 'fatherBRNChar13',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 12
      },
      {
        field: 'fatherBRNChar14',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 13
      },
      {
        field: 'fatherBRNChar15',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 14
      },
      {
        field: 'fatherBRNChar16',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 15
      },
      {
        field: 'fatherBRNChar17',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'father.iD'
        },
        valueIndex: 16
      },
      {
        field: 'fatherNIDChar1',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 0
      },
      {
        field: 'fatherNIDChar2',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 1
      },
      {
        field: 'fatherNIDChar3',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 2
      },
      {
        field: 'fatherNIDChar4',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 3
      },
      {
        field: 'fatherNIDChar5',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 4
      },
      {
        field: 'fatherNIDChar6',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 5
      },
      {
        field: 'fatherNIDChar7',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 6
      },
      {
        field: 'fatherNIDChar8',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 7
      },
      {
        field: 'fatherNIDChar9',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 8
      },
      {
        field: 'fatherNIDChar10',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 9
      },
      {
        field: 'fatherNIDChar11',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 10
      },
      {
        field: 'fatherNIDChar12',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 11
      },
      {
        field: 'fatherNIDChar13',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 12
      },
      {
        field: 'fatherNIDChar14',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 13
      },
      {
        field: 'fatherNIDChar15',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 14
      },
      {
        field: 'fatherNIDChar16',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 15
      },
      {
        field: 'fatherNIDChar17',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'father.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'father.iD'
        },
        valueIndex: 16
      },
      {
        field: 'fatherForiegnCountry',
        operation: 'OfflineAddress',
        parameters: {
          language: 'en',
          conditionalKeys: [
            {
              condition: {
                default: true
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'father.countryPermanent',
                localAddress: '',
                internationalAddress: '{father.countryPermanent}'
              }
            }
          ]
        }
      },
      {
        field: 'motherFullNameInCapital',
        operation: 'ApplicantName',
        parameters: {
          key: {
            birth: 'mother'
          },
          format: {
            en: ['firstNamesEng', 'familyNameEng']
          },
          allCapital: true,
          language: 'en'
        }
      },
      {
        field: 'motherBRNChar1',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 0
      },
      {
        field: 'motherBRNChar2',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 1
      },
      {
        field: 'motherBRNChar3',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 2
      },
      {
        field: 'motherBRNChar4',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 3
      },
      {
        field: 'motherBRNChar5',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 4
      },
      {
        field: 'motherBRNChar6',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 5
      },
      {
        field: 'motherBRNChar7',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 6
      },
      {
        field: 'motherBRNChar8',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 7
      },
      {
        field: 'motherBRNChar9',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 8
      },
      {
        field: 'motherBRNChar10',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 9
      },
      {
        field: 'motherBRNChar11',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 10
      },
      {
        field: 'motherBRNChar12',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 11
      },
      {
        field: 'motherBRNChar13',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 12
      },
      {
        field: 'motherBRNChar14',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 13
      },
      {
        field: 'motherBRNChar15',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 14
      },
      {
        field: 'motherBRNChar16',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 15
      },
      {
        field: 'motherBRNChar17',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'BIRTH_REGISTRATION_NUMBER',
          idValueKey: 'mother.iD'
        },
        valueIndex: 16
      },
      {
        field: 'motherNIDChar1',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 0
      },
      {
        field: 'motherNIDChar2',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 1
      },
      {
        field: 'motherNIDChar3',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 2
      },
      {
        field: 'motherNIDChar4',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 3
      },
      {
        field: 'motherNIDChar5',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 4
      },
      {
        field: 'motherNIDChar6',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 5
      },
      {
        field: 'motherNIDChar7',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 6
      },
      {
        field: 'motherNIDChar8',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 7
      },
      {
        field: 'motherNIDChar9',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 8
      },
      {
        field: 'motherNIDChar10',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 9
      },
      {
        field: 'motherNIDChar11',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 10
      },
      {
        field: 'motherNIDChar12',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 11
      },
      {
        field: 'motherNIDChar13',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 12
      },
      {
        field: 'motherNIDChar14',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 13
      },
      {
        field: 'motherNIDChar15',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 14
      },
      {
        field: 'motherNIDChar16',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 15
      },
      {
        field: 'motherNIDChar17',
        operation: 'IdentifierValue',
        parameters: {
          idTypeKey: 'mother.iDType',
          idTypeValue: 'NATIONAL_ID',
          idValueKey: 'mother.iD'
        },
        valueIndex: 16
      },
      {
        field: 'motherForeignCountry',
        operation: 'OfflineAddress',
        parameters: {
          language: 'en',
          conditionalKeys: [
            {
              condition: {
                default: true
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'mother.countryPermanent',
                localAddress: '',
                internationalAddress: '{mother.countryPermanent}'
              }
            }
          ]
        }
      }
    ],
    fonts: {
      bn: {
        notosans: {
          normal: 'NotoSansBengali-Light.ttf',
          regular: 'NotoSansBengali-Light.ttf',
          bold: 'NotoSansBengali-Regular.ttf'
        },
        notosanscurrency: {
          normal: 'NotoSansBengali-Light.ttf',
          regular: 'NotoSansBengali-Light.ttf',
          bold: 'NotoSansBengali-Light.ttf'
        },
        notosanslocation: {
          normal: 'NotoSans-Light.ttf',
          regular: 'NotoSans-Light.ttf',
          bold: 'NotoSans-Regular.ttf'
        },
        notosansbn: {
          normal: 'NotoSansBengali-Light.ttf',
          regular: 'NotoSansBengali-Light.ttf',
          bold: 'NotoSansBengali-Regular.ttf'
        }
      },
      en: {
        notosanscurrency: {
          normal: 'NotoSansBengali-Light.ttf',
          regular: 'NotoSansBengali-Light.ttf',
          bold: 'NotoSansBengali-Light.ttf'
        },
        notosans: {
          normal: 'NotoSans-Light.ttf',
          regular: 'NotoSans-Light.ttf',
          bold: 'NotoSans-Regular.ttf'
        },
        notosanslocation: {
          normal: 'NotoSans-Light.ttf',
          regular: 'NotoSans-Light.ttf',
          bold: 'NotoSans-Regular.ttf'
        },
        notosansbn: {
          normal: 'NotoSansBengali-Light.ttf',
          regular: 'NotoSansBengali-Light.ttf',
          bold: 'NotoSansBengali-Regular.ttf'
        }
      }
    },
    vfs: {}
  }
}
