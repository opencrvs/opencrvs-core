# OpenCRVS Resources Module

One of the key dependencies for OpenCRVS is a reference data source. This source is likely to be bespoke for every implementing nation. The resources package contains scripts to import all reference data required for OpenCRVS.

The categories of the reference data are as follows:

- Administrative divisions _(A portion of a country delineated for the purpose of administration, allowing registrations to be coupled to location and staff, with GeoJSON map data that enables an interactive map of the country, in the performance appllication.)_
- Facilities _(The places where civil registration and vital events such as births/deaths occur)_
- Employees _(The staff required to undertake the functions of civil registration)_

The features in this package are designed to import and convert the reference data above into the FHIR standard, then populate the OpenCRVS [Hearth](https://github.com/jembi/hearth) NoSQL database, via the OpenCRVS [OpenHIM](http://openhim.org/) interoperability layer.

Given the [variety of administrative divisions between nations](https://en.wikipedia.org/wiki/List_of_administrative_divisions_by_country), and the unique nature of the organisational, local government operational structure of a nation, ... and given the variety of digital capabilities and stages of digital readiness of a nation, ...

... OpenCRVS does not attempt to prescribe the style or nature of it's resource dependencies. Instead it is encouraged that this package be bespokely implementated, according to a nation's needs during installation.

Some governments, _(as in the case of the government of Bangladesh),_ may have a central repository for some reference data accessible via APIs.

Other governments may supply the data in a spreadsheet format.

What OpenCRVS does provide, is an example approach and scripts showing how this data can be imported. Additionally OpenCRVS provides a FHIR standard for each of these categories.

By following the examples in the features of this package, and by converting the reference data into FHIR, OpenCRVS illustrates a scalable approach to digitising and making interoperable, the administrative and operational data of a nation.

**Strategically, OpenCRVS will include in its content management system the capability to manage all of these resources.**

---

## Administrative

This feature, imports and converts the administrative divisions for a country into [FHIR Location](https://www.hl7.org/fhir/location.html) objects, applies a GeoJSON map to each location and then saves the data to FHIR. The process can be interrupted to export a CSV file for manual cross-checking.

[This FHIR standard is followed.](https://github.com/jembi/opencrvs-fhir-templates/blob/master/admin-structure/admin-structure-resource.jsonc)

---

## Facilities

This feature, imports and converts civil registration offices and health facilities into [FHIR Location](https://www.hl7.org/fhir/location.html) objects. Each facility must have a unique id.

[This FHIR standard is followed.](https://github.com/jembi/opencrvs-fhir-templates/blob/master/offices/offices-resource.jsonc)

---

## Employees

This feature, imports and converts a test user and employee list from a csv file into [FHIR Practitioner](https://www.hl7.org/fhir/practitioner.html) and [FHIR PractitionerRole](https://www.hl7.org/fhir/practitionerrole.html) objects to manage permissions and map registrations to staff members, so that their performance can be tracked. The facility id for the users working location must match a facility unique id

[This FHIR standard is followed.](https://github.com/jembi/opencrvs-fhir-templates/blob/master/employee/employee-resource.jsonc)

---

### Developer commands

Once all data sources have been readied, then a single command should be able to be run by a developer, in order to populate a local or production OpenCRVS environment with the necessary reference data.

**Populate OpenCRVS with reference data**

<!-- prettier-ignore -->
```yarn populate```

---

**Ensuring readiness of data sources**

Running the populate command runs the following commands sequentially. Each should be individually confirmed to be working as expected during code review, before publishing a countries resources package to master:

<!-- prettier-ignore -->
```yarn save:locations```

Imports administrative divisions from a relevant source _(For Bangladesh, this is the A2I API,)_ converts the data into [FHIR Location](https://www.hl7.org/fhir/location.html) objects, using the [OpenCRVS interpretation](https://github.com/jembi/opencrvs-fhir-templates/blob/master/admin-structure/admin-structure-resource.jsonc), and saves JSON files for applying GeoJSON map data later into the extension array. Some custom fields for the country can be utilised in the description or identifier fields.

<!-- prettier-ignore -->
```yarn assign:geo-data```

Loads the FHIR Location data from the JSON, and compares the names of the individual locations with a source GeoJSON map from [humdata.org](https://data.humdata.org/dataset/administrative-boundaries-of-bangladesh-as-of-2015). If the names match, then the appropriate GeoJSON map is applied to the Location [extension array](https://github.com/jembi/opencrvs-fhir-templates/blob/master/admin-structure/admin-structure-resource.jsonc#L36). Warnings will be listed for any location which the script has been unable to confidently map GeoJSON data.

<!-- prettier-ignore -->
```yarn update:locations```

Once the GeoJSON has been assigned to the location objects, then all the updated location objects are loaded into Hearth.

<!-- prettier-ignore -->
```yarn prep:facilities```

As an example of how to prepare data from a CSV file, this script converts a facility CSV file into JSON. The standard is flexible, and in this example satisfies the project management requirements for Bangladesh.

<!-- prettier-ignore -->
```yarn save:facilities```

Converts the facilities JSON file into [FHIR Location](https://www.hl7.org/fhir/location.html) objects, using the [OpenCRVS interpretation](https://github.com/jembi/opencrvs-fhir-templates/blob/master/admin-structure/admin-structure-resource.jsonc) for buildings, setting the [type](https://github.com/jembi/opencrvs-fhir-templates/blob/master/offices/offices-resource.jsonc#L18) of building appropriately.

<!-- prettier-ignore -->
```yarn prep:employees```

As an example of how to prepare data from a CSV file, this script converts an employee list CSV file into JSON. The standard is flexible, and in this example satisfies the project management and test requirements for Bangladesh. The list is a test list based on the users and permissions in the [user-mgnt package.](https://github.com/jembi/OpenCRVS/blob/master/packages/user-mgnt/resources/populate.ts)

<!-- prettier-ignore -->
```yarn save:employees```

Converts the employees JSON file into [FHIR Practitioner](https://www.hl7.org/fhir/practitioner.html) and [FHIR PractitionerRole](https://www.hl7.org/fhir/practitionerrole.html) objects, using the [OpenCRVS interpretation](https://github.com/jembi/opencrvs-fhir-templates/blob/master/employee/employee-resource.jsonc) for employees, setting the [code](https://github.com/jembi/opencrvs-fhir-templates/blob/master/employee/employee-resource.jsonc#L38) of the employee's role appropriately and also critically [listing the working locations](https://github.com/jembi/opencrvs-fhir-templates/blob/master/employee/employee-resource.jsonc#L43) of the employee. These can be buildins or administrative divisions. Ideally they should include both in the array.

---

### Optional Project Manager command for administrative divisions. Customisable for other features of reference data such as employees or offices.

<!-- prettier-ignore -->
```yarn generate:csv```

It is likely that there will be inconsistencies between the GeoJSON and source Location list names. Also it is likely that either Location data set may be incomplete. Therefore it is likely that manual checks may need to be completed in order to update administrative divisions. This script outputs Location data to a CSV file as an example for this purpose.
