const adminStructuresBundle = {
  resourceType: 'Bundle',
  id: '14523142-3531-49b5-a5dd-43e758977751',
  meta: {
    lastUpdated: '2023-10-15T12:20:25.355+00:00'
  },
  type: 'searchset',
  total: 20,
  link: [
    {
      relation: 'self',
      url: 'http://gateway.farajaland-staging.opencrvs.org/location?type=ADMIN_STRUCTURE&_count=0'
    },
    {
      relation: 'next',
      url: 'http://gateway.farajaland-staging.opencrvs.org/location?type=ADMIN_STRUCTURE&_count=0&_getpagesoffset=0'
    }
  ],
  entry: [
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/019f9e08-4180-4ce6-a842-47bbc0c40037/_history/a8683869-1efb-44e3-803d-60df4147b982',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_AWn3s2RqgAN'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE'
          }
        ],
        name: 'Central',
        alias: ['Central'],
        description: 'AWn3s2RqgAN',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":40000},{"2008":40000},{"2009":40000},{"2010":40000},{"2011":40000},{"2012":40000},{"2013":40000},{"2014":40000},{"2015":40000},{"2016":40000},{"2017":40000},{"2018":40000},{"2019":40000},{"2020":40000},{"2021":40000},{"2022":60000},{"2023":80000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:03.896+00:00',
          versionId: 'a8683869-1efb-44e3-803d-60df4147b982'
        },
        id: '019f9e08-4180-4ce6-a842-47bbc0c40037'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/fb8e19a3-a191-404c-a6ad-58e7963c1d57/_history/1cf17ccb-b6d5-41ef-a75b-7be09b3a4241',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_oEBf29y8JP8'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Ibombo',
        alias: ['Ibombo'],
        description: 'oEBf29y8JP8',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/019f9e08-4180-4ce6-a842-47bbc0c40037'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:03.972+00:00',
          versionId: '1cf17ccb-b6d5-41ef-a75b-7be09b3a4241'
        },
        id: 'fb8e19a3-a191-404c-a6ad-58e7963c1d57'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/4a8bb234-7f6d-41f1-bdf3-c1a66c15ef90/_history/c1044721-039e-400d-80c8-991944851cc5',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_KozcEjeTyuD'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE'
          }
        ],
        name: 'Sulaka',
        alias: ['Sulaka'],
        description: 'KozcEjeTyuD',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":40000},{"2008":40000},{"2009":40000},{"2010":40000},{"2011":40000},{"2012":40000},{"2013":40000},{"2014":40000},{"2015":40000},{"2016":40000},{"2017":40000},{"2018":40000},{"2019":40000},{"2020":40000},{"2021":40000},{"2022":60000},{"2023":80000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:03.979+00:00',
          versionId: 'c1044721-039e-400d-80c8-991944851cc5'
        },
        id: '4a8bb234-7f6d-41f1-bdf3-c1a66c15ef90'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/eccc3649-de15-4a05-97cf-5e93ed76d5bd/_history/e6df4b6f-247e-4d47-9a1f-e0d571e8db2e',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_HPGiE9Jjh2r'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Ilanga',
        alias: ['Ilanga'],
        description: 'HPGiE9Jjh2r',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/4a8bb234-7f6d-41f1-bdf3-c1a66c15ef90'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:03.987+00:00',
          versionId: 'e6df4b6f-247e-4d47-9a1f-e0d571e8db2e'
        },
        id: 'eccc3649-de15-4a05-97cf-5e93ed76d5bd'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/64376f98-51ff-4eb8-9469-b7744498751d/_history/4be0b8ad-2f2c-4521-8fd2-643c4002f388',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_B1u1bVtIA92'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE'
          }
        ],
        name: 'Pualula',
        alias: ['Pualula'],
        description: 'B1u1bVtIA92',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":40000},{"2008":40000},{"2009":40000},{"2010":40000},{"2011":40000},{"2012":40000},{"2013":40000},{"2014":40000},{"2015":40000},{"2016":40000},{"2017":40000},{"2018":40000},{"2019":40000},{"2020":40000},{"2021":40000},{"2022":60000},{"2023":80000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:03.993+00:00',
          versionId: '4be0b8ad-2f2c-4521-8fd2-643c4002f388'
        },
        id: '64376f98-51ff-4eb8-9469-b7744498751d'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/a75bc569-5180-405f-b5eb-035928ca1ce8/_history/81a9d83c-2ca6-4ae5-b3b6-f113cb86a9e3',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_BxrIbNW7f3K'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Embe',
        alias: ['Embe'],
        description: 'BxrIbNW7f3K',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/64376f98-51ff-4eb8-9469-b7744498751d'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.000+00:00',
          versionId: '81a9d83c-2ca6-4ae5-b3b6-f113cb86a9e3'
        },
        id: 'a75bc569-5180-405f-b5eb-035928ca1ce8'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/601df776-ab2d-4a64-8b0d-931f3d08d6b9/_history/493974ed-f64b-4f94-a608-3259233e7078',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_dbTLdTi7s8F'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'STATE'
          }
        ],
        name: 'Chuminga',
        alias: ['Chuminga'],
        description: 'dbTLdTi7s8F',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/0'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":20000},{"2008":20000},{"2009":20000},{"2010":20000},{"2011":20000},{"2012":20000},{"2013":20000},{"2014":20000},{"2015":20000},{"2016":20000},{"2017":20000},{"2018":20000},{"2019":20000},{"2020":20000},{"2021":20000},{"2022":30000},{"2023":40000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":40000},{"2008":40000},{"2009":40000},{"2010":40000},{"2011":40000},{"2012":40000},{"2013":40000},{"2014":40000},{"2015":40000},{"2016":40000},{"2017":40000},{"2018":40000},{"2019":40000},{"2020":40000},{"2021":40000},{"2022":60000},{"2023":80000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.006+00:00',
          versionId: '493974ed-f64b-4f94-a608-3259233e7078'
        },
        id: '601df776-ab2d-4a64-8b0d-931f3d08d6b9'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/eab2b33a-861c-4f3a-be9b-9d95b0e5268b/_history/dca9f218-52b6-48f9-8915-a4c4e2eb537c',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_SQT8xjbvWwf'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Ama',
        alias: ['Ama'],
        description: 'SQT8xjbvWwf',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/601df776-ab2d-4a64-8b0d-931f3d08d6b9'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.012+00:00',
          versionId: 'dca9f218-52b6-48f9-8915-a4c4e2eb537c'
        },
        id: 'eab2b33a-861c-4f3a-be9b-9d95b0e5268b'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/f96d652f-f075-4ed8-9b3f-2dd3244a5cc1/_history/cbb87f93-e965-4862-a684-9145a2a48350',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_ntoX1PkiWri'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Isamba',
        alias: ['Isamba'],
        description: 'ntoX1PkiWri',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/019f9e08-4180-4ce6-a842-47bbc0c40037'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.019+00:00',
          versionId: 'cbb87f93-e965-4862-a684-9145a2a48350'
        },
        id: 'f96d652f-f075-4ed8-9b3f-2dd3244a5cc1'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/dfd1794f-f5ff-4c33-a3e9-3a2431ed0d43/_history/5eac3aad-a866-4e05-abe3-247488d4eedf',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_SvFNQpplnch'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Irundu',
        alias: ['Irundu'],
        description: 'SvFNQpplnch',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/4a8bb234-7f6d-41f1-bdf3-c1a66c15ef90'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.027+00:00',
          versionId: '5eac3aad-a866-4e05-abe3-247488d4eedf'
        },
        id: 'dfd1794f-f5ff-4c33-a3e9-3a2431ed0d43'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/422dcec4-ff28-46b6-8930-8e55d51be3db/_history/2e3d81bc-4896-4cf8-a762-a8e1e9a49a23',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_NLjvK1QsrN3'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Ienge',
        alias: ['Ienge'],
        description: 'NLjvK1QsrN3',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/64376f98-51ff-4eb8-9469-b7744498751d'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.036+00:00',
          versionId: '2e3d81bc-4896-4cf8-a762-a8e1e9a49a23'
        },
        id: '422dcec4-ff28-46b6-8930-8e55d51be3db'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/8f12a4bb-b37b-443b-93dc-3182228042fb/_history/4b8c44cf-e62b-4b60-8453-aa38501dc856',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_hywxVKv48Xp'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Nsali',
        alias: ['Nsali'],
        description: 'hywxVKv48Xp',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/601df776-ab2d-4a64-8b0d-931f3d08d6b9'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.051+00:00',
          versionId: '4b8c44cf-e62b-4b60-8453-aa38501dc856'
        },
        id: '8f12a4bb-b37b-443b-93dc-3182228042fb'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/16c1c76d-4367-4df1-9b85-73df138b12b3/_history/c3f3b869-85ac-4cd1-b2d8-a8959a18f96a',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_QTtxiWj8ONP'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Itambo',
        alias: ['Itambo'],
        description: 'QTtxiWj8ONP',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/019f9e08-4180-4ce6-a842-47bbc0c40037'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.057+00:00',
          versionId: 'c3f3b869-85ac-4cd1-b2d8-a8959a18f96a'
        },
        id: '16c1c76d-4367-4df1-9b85-73df138b12b3'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/6eda7a13-adec-4d62-862c-db41ee477433/_history/a943c8f8-9816-4399-ab90-fcd7ed3fc38d',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_Oapn6R4rt3D'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Zobwe',
        alias: ['Zobwe'],
        description: 'Oapn6R4rt3D',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/4a8bb234-7f6d-41f1-bdf3-c1a66c15ef90'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.063+00:00',
          versionId: 'a943c8f8-9816-4399-ab90-fcd7ed3fc38d'
        },
        id: '6eda7a13-adec-4d62-862c-db41ee477433'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/0af46752-96c5-44d6-b960-8a2b35c00752/_history/d1fe5bd1-0605-4c9c-be93-5909d93a8e6e',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_idR0pJWLqcR'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Funabuli',
        alias: ['Funabuli'],
        description: 'idR0pJWLqcR',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/64376f98-51ff-4eb8-9469-b7744498751d'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.069+00:00',
          versionId: 'd1fe5bd1-0605-4c9c-be93-5909d93a8e6e'
        },
        id: '0af46752-96c5-44d6-b960-8a2b35c00752'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/97ae691f-2720-41ab-857f-6cebd0a585ef/_history/972987d1-aba2-4b36-b5c2-f96a2adbb971',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_jCJxK8sFH40'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Soka',
        alias: ['Soka'],
        description: 'jCJxK8sFH40',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/601df776-ab2d-4a64-8b0d-931f3d08d6b9'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.078+00:00',
          versionId: '972987d1-aba2-4b36-b5c2-f96a2adbb971'
        },
        id: '97ae691f-2720-41ab-857f-6cebd0a585ef'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/cb4d1918-122e-442b-8f2a-ba887cea5bf6/_history/f4059af1-b3d6-49ce-a87f-f068fc15038f',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_ydyJb1RAy4U'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Ezhi',
        alias: ['Ezhi'],
        description: 'ydyJb1RAy4U',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/019f9e08-4180-4ce6-a842-47bbc0c40037'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.085+00:00',
          versionId: 'f4059af1-b3d6-49ce-a87f-f068fc15038f'
        },
        id: 'cb4d1918-122e-442b-8f2a-ba887cea5bf6'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/913df5f4-3a52-445b-9fe5-9aef93bc9914/_history/709ac408-469b-4e22-af98-a3a42bf48a41',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_nO68NTtcdw2'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Afue',
        alias: ['Afue'],
        description: 'nO68NTtcdw2',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/4a8bb234-7f6d-41f1-bdf3-c1a66c15ef90'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.093+00:00',
          versionId: '709ac408-469b-4e22-af98-a3a42bf48a41'
        },
        id: '913df5f4-3a52-445b-9fe5-9aef93bc9914'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/84ee7199-2b04-46dd-b1e3-3537867a89a4/_history/eaab3a49-374c-4616-8047-d79163e8a60e',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_FuvOOwvBw0p'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Pili',
        alias: ['Pili'],
        description: 'FuvOOwvBw0p',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/64376f98-51ff-4eb8-9469-b7744498751d'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.106+00:00',
          versionId: 'eaab3a49-374c-4616-8047-d79163e8a60e'
        },
        id: '84ee7199-2b04-46dd-b1e3-3537867a89a4'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    },
    {
      fullUrl:
        'http://gateway.farajaland-staging.opencrvs.org/location/5d55580d-3bfd-44ae-b5da-6f4a4e297872/_history/7ac20a72-1a7f-4327-9dd6-1a07b078eee8',
      resource: {
        resourceType: 'Location',
        identifier: [
          {
            system: 'http://opencrvs.org/specs/id/statistical-code',
            value: 'ADMIN_STRUCTURE_R22tRIhdm5Y'
          },
          {
            system: 'http://opencrvs.org/specs/id/jurisdiction-type',
            value: 'DISTRICT'
          }
        ],
        name: 'Chibiya',
        alias: ['Chibiya'],
        description: 'R22tRIhdm5Y',
        status: 'active',
        mode: 'instance',
        partOf: {
          reference: 'Location/601df776-ab2d-4a64-8b0d-931f3d08d6b9'
        },
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/location-type',
              code: 'ADMIN_STRUCTURE'
            }
          ]
        },
        physicalType: {
          coding: [
            {
              code: 'jdn',
              display: 'Jurisdiction'
            }
          ]
        },
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
            valueAttachment: {
              contentType: 'application/geo+json',
              data: '<base64>'
            }
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-male-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-female-populations',
            valueString:
              '[{"2007":5000},{"2008":5000},{"2009":5000},{"2010":5000},{"2011":5000},{"2012":5000},{"2013":5000},{"2014":5000},{"2015":5000},{"2016":5000},{"2017":5000},{"2018":5000},{"2019":5000},{"2020":5000},{"2021":5000},{"2022":7500},{"2023":10000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-total-populations',
            valueString:
              '[{"2007":10000},{"2008":10000},{"2009":10000},{"2010":10000},{"2011":10000},{"2012":10000},{"2013":10000},{"2014":10000},{"2015":10000},{"2016":10000},{"2017":10000},{"2018":10000},{"2019":10000},{"2020":10000},{"2021":10000},{"2022":15000},{"2023":20000}]'
          },
          {
            url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
            valueString:
              '[{"2007":5},{"2008":5},{"2009":5},{"2010":5},{"2011":5},{"2012":5},{"2013":5},{"2014":5},{"2015":5},{"2016":5},{"2017":5},{"2018":5},{"2019":5},{"2020":5},{"2021":5},{"2022":7.5},{"2023":10}]'
          }
        ],
        meta: {
          lastUpdated: '2023-09-19T11:22:04.116+00:00',
          versionId: '7ac20a72-1a7f-4327-9dd6-1a07b078eee8'
        },
        id: '5d55580d-3bfd-44ae-b5da-6f4a4e297872'
      },
      request: {
        method: 'POST',
        url: 'Location'
      }
    }
  ]
}
export default adminStructuresBundle
