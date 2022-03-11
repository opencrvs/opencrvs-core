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
export const certificateTemplates = {
  birth: {
    definition: {
      pageMargins: [0, 0, 0, 0] as [number, number, number, number],
      info: {
        title: 'Birth Registration Certificate'
      },
      defaultStyle: {
        font: 'notosans'
      },
      content: [],
      styles: {
        lightHeader: {
          fontSize: 18
        },
        boldHeader: {
          fontSize: 18,
          bold: true
        },
        boldText: {
          bold: true
        },
        subHeader: {
          fontSize: 13,
          bold: true
        }
      }
    },
    fonts: {
      en: {
        notosans: {
          normal: 'NotoSans-Light.ttf',
          bold: 'NotoSans-Regular.ttf'
        }
      }
    },
    vfs: {},
    transformers: [
      {
        field: 'registrationNumber',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
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
        field: 'informantName',
        operation: 'InformantName',
        parameters: {
          conditions: [
            {
              key: {
                birth: 'child'
              },
              format: {
                en: ['firstNamesEng', 'familyNameEng']
              }
            }
          ],
          language: 'en'
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
        field: 'placeOfBirth',
        operation: 'OfflineAddress',
        parameters: {
          language: 'en',
          conditions: [
            {
              condition: {
                key: 'child.placeOfBirth',
                values: ['HEALTH_FACILITY']
              },
              addressType: 'facilities',
              addressKey: 'name',
              addresses: {
                countryCode: 'FAR',
                localAddress: '{child.birthLocation}'
              }
            },
            {
              condition: {
                key: 'child.placeOfBirth',
                values: ['PRIVATE_HOME', 'OTHER']
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'child.country',
                localAddress:
                  '{child.district}, {child.state}, {child.country}',
                internationalAddress:
                  '{child.internationalDistrict}, {child.internationalState}, {child.country}'
              }
            }
          ]
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
        field: 'registrarSignature',
        operation: 'LocalRegistrarUserSignature'
      },
      {
        field: 'registrarName',
        operation: 'LocalRegistrarUserName'
      },
      {
        field: 'role',
        operation: 'LocalRegistrarUserRole'
      }
    ]
  },
  death: {
    definition: {
      pageMargins: [0, 0, 0, 0] as [number, number, number, number],
      info: {
        title: 'Death Registration Certificate'
      },
      defaultStyle: {
        font: 'notosans'
      },
      content: [],
      styles: {
        lightHeader: {
          fontSize: 18
        },
        boldHeader: {
          fontSize: 18,
          bold: true
        },
        boldText: {
          bold: true
        },
        subHeader: {
          fontSize: 13,
          bold: true
        }
      }
    },
    fonts: {
      en: {
        notosans: {
          normal: 'NotoSans-Light.ttf',
          bold: 'NotoSans-Regular.ttf'
        }
      }
    },
    vfs: {},
    transformers: [
      {
        field: 'registrationNumber',
        operation: 'FieldValue',
        parameters: {
          valueKey: 'registration.registrationNumber'
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
        field: 'informantName',
        operation: 'InformantName',
        parameters: {
          conditions: [
            {
              key: {
                death: 'deceased'
              },
              format: {
                en: ['firstNamesEng', 'familyNameEng']
              }
            }
          ],
          language: 'en'
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
          language: 'en',
          momentLocale: {
            en: 'locale/en-ie'
          }
        }
      },
      {
        field: 'placeOfDeath',
        operation: 'OfflineAddress',
        parameters: {
          language: 'en',
          conditions: [
            {
              condition: {
                key: 'deathEvent.deathPlaceAddress',
                values: ['PERMANENT']
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'deceased.countryPermanent',
                localAddress:
                  '{deceased.addressLine4Permanent}, {deceased.districtPermanent}, {deceased.statePermanent}, {deceased.countryPermanent}',
                internationalAddress:
                  '{deceased.internationalDistrictPermanent}, {deceased.internationalStatePermanent}, {deceased.countryPermanent}'
              }
            },
            {
              condition: {
                key: 'deathEvent.deathPlaceAddress',
                values: ['CURRENT']
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'deceased.country',
                localAddress:
                  '{deceased.addressLine4}, {deceased.district}, {deceased.state}, {deceased.country}',
                internationalAddress:
                  '{deceased.internationalDistrict}, {deceased.internationalState}, {deceased.country}'
              }
            },
            {
              condition: {
                key: 'deathEvent.deathPlaceAddress',
                values: ['PRIVATE_HOME', 'OTHER']
              },
              addressType: 'locations',
              addressKey: 'name',
              addresses: {
                countryCode: 'deathEvent.country',
                localAddress:
                  '{deathEvent.addressLine4}, {deathEvent.district}, {deathEvent.state}, {deathEvent.country}',
                internationalAddress:
                  '{deathEvent.internationalDistrict}, {deathEvent.internationalState}, {deathEvent.country}'
              }
            },
            {
              condition: {
                key: 'deathEvent.deathPlaceAddress',
                values: ['HEALTH_FACILITY']
              },
              addressType: 'facilities',
              addressKey: 'name',
              addresses: {
                countryCode: 'FAR',
                localAddress: '{deathEvent.deathLocation}'
              }
            }
          ]
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
        field: 'registrarSignature',
        operation: 'LocalRegistrarUserSignature'
      },
      {
        field: 'registrarName',
        operation: 'LocalRegistrarUserName'
      },
      {
        field: 'role',
        operation: 'LocalRegistrarUserRole'
      }
    ]
  }
}
