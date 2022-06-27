<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents** _generated with [DocToc](https://github.com/thlorenz/doctoc)_

- [Data types](#data-types)
- [Properties of default.ts](#properties-of-registerjson)
- [registerForm](#registerform)
- [birth](#birth)
- [death](#death)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Data types

We are using some data types and they maintain a hierarchical relation between themselves. These types are currently defined in `/packages/client/src/forms/index.ts`

1.  **`IForm:`** IForm lies in the highest level in the hierarchy of form field definitions. It has an array of `IFormSection` in the sections property. For instance, `registerForm.birth` is an `IForm`.

2.  **`IFormSection:`** `IFormSection` holds all the field definitions of a corresponding `section`. A form has several sections and they are important for structuring form data. The sections are ordered in accordance with a visual representation. So, they play an important role in both the data and the view layer of the form. An `IFormSection` has several properties.
    > Note: Question mark beside the property means it is optional, otherwise the property is mandatory.

- 1.  **`id:`** Unique identifier of a section within a `IForm`. Usually it indicates the property where all section data should consist when submitting. It can also be named otherwise with the help of a section-wise mapping.

* 2.  **`viewType:`** `viewType` describes whether the form should be represented as a form input or only view (in our case, RegisterForm / CollectorForm or ReviewForm / PreviewForm). It has four possible values: form, review, preview and hidden.
* 3.  **`title:`** Title shown above the form section.
* 4.  **`optional?:`** A section can be optional. It indicates whether a section is optional or not.
* 5.  **`name:`** It is used to hold the title of the corresponding tab if the section has any.
* 6.  **`groups:`** Consists of an array of groups. A group is used as a view group for fields and displays a part of a section. It only has presentational significance and no impact on section data. Groups have a type of `IFormSectionGroup`.
* 7.  **`mapping?:`** Stands for section-wise mapping and has a type of `IFormSectionMapping`. More will be discussed in the mapping section.
* 8.  **`disabled?:`** Indicates whether the section is disabled or not.
* 9.  **`hasDocumentSection?:`** It tells whether the section has a corresponding document section or not.
* 10. **`notice?:`** Used to display a warning text under the label.

3.  **`IFormSectionGroup:`** As earlier mentioned, a group is used as a view group of fields and shows a part of a section. A group is visually equivalent to a partial section. It holds field definitions of that part of the section. So, a section does not have fields as its direct children rather it has to have groups that contain several fields as direct children. It also has some features like `previewGroup`, conditionals. An `IFormSectionGroup` has id as its unique identifier. It has a property named fields in which an array of IFormField is provided. Actually, IFormField is a union of all fields. That means any field is an IFormField; it can be TEXT, TEL, RADIO_GROUP, etc. IFormField inherits IFormFieldBase type.

    It has a `preventContinueIfError` prop. It has the boolean value true users cannot get past this view group with a validation error or left out a required field. This group consists of several fields which are mentioned below.

4.  **`IFormFieldBase:`** This type is the base type of all fields. That means any property of this type is applicable to all fields. It has the following properties.

- 1.  **`name:`** Identifier of the field. Typically unique for one group but sometimes it is okay to have a group that can have fields having the same names if they do not appear at the same time.
- 2.  **`type:`** Input type of the field. It can be TEXT, SELECT_WITH_OPTIONS, etc.
- 3.  **`label:`** The label for the input field.
- 4.  **`tooltip?:`** Tooltip text for the field.
- 5.  **`validate:`** This prop holds an array of validator function references from the codebase. A reference is just an object with the operation and optional parameters prop. That means the field value is processed through that function and gives errors if validation fails.
- 6.  **`required?:`** If the field is required then set this to true. So, when the field is left unfilled, it gives a validation error.
- 7.  **`prefix?:`** When there is a text to show at the start of input, this prop is used.
- 8.  **`postfix?:`** It is used when there is a text to show at the end of the input. For instance, for taking input of a person’s weight we have to show the unit, which is one of the use cases where postfix can be applied.
- 9.  **`disabled?:`** The field is disabled when it is set to true.
- 10. **`initialValue?:`** When the field requires a value during generation before input, this prop is used.
- 11. **`extraValue?:`** Actually this property is needed when we need more information for mapping/ tracking with the original value of the field. Currently, we are using it in the document field, nested field and reasons not applying fields. The reasons for extraValue is like:

      Suppose we need to upload a national id doc for mother/father but we have only the value like `national_id`. How could we track whose dock is this? So we need to pass an `extraValue` like mother father/vice-versa with the field itself so the corresponding mapping could recognize whose document this is.

      For `nestedFields` with `nestedRadioFieldTransformer` mapping, we need to pass `optionValue` as `extraValue` to recognize which option is selected. The reason is as all the options in `nestedField` are processed during the mutation mapping so we need to stop processing other options that are not selected.

      The same sort of logic for reasons fields also because we need to know who is not applying for what. That is why we need to pass father/mother/etc as `extraValue`.

- 12. **`conditionals?:`** It keeps an array of `IConditionals`. `IConditional` is an object where it has a prop named expression which is a text containing a [javascript expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators). The condition lies in that expression. It is evaluated (with eval) when rendering the fields and conditionally shows/hides the field.
- 13. **`description?:`** Description text to show under the label.
- 14. **`placeholder?:`** Placeholder text for the input.
- 15. **`mapping?:`** It contains an object of `IFormFieldMapping` type. As the name goes, the property does the job of mapping data when submission (mutation) and retrieval (query) at field level. The reason for the mapping function is that the format of the data in graphql is different than the format of the form and the data of the form needs to be transformed. It has two properties: query and mutation.

  - **`query:`** Name of the `query` transformer method in operation property.

  - **`mutation:`** Name of the `mutation` transformer method in operation property.

- 17. **`hideAsterisk?:`** Required fields always show a red asterisk. This prop hides the asterisk even if the field is required.
- 18. **`hideHeader?:`** It hides the label. It can be used when a group has only one field and we want to show the group title only.
- 19. **`mode?:`** This prop indicates theme mode. The container component where the input field is implemented may be in a dark or light theme. This property enables theme mode to be passed to the field to adapt styles accordingly.
- 20. **`hidden?:`** This property is set to `true` if we want the field to be hidden.
- 21. **`previewGroup?:`** This prop takes the id of the preview group. An `IFormSectionGroup` can have multiple preview groups in its `previewGroups` property. Each preview group object has its respective ids.
- 22. **`nestedFields?:`** This field accepts an object map of field arrays that and the keys of the object are all possible values of that field. That means nested fields appear below the field when the corresponding key is the value of the field.
- 23. **`hideValueInPreview?:`** Hides the value on the review page.
- 24. **`ignoreBottomMargin?:`** If we need to remove space between any 2 fields then we need to set this prop value to `true` in the first field. If there are 3 fields we need to set the value to `true` in the first two fields. Actually it set value fields bottom margin to `0px` if set to `true`.
- 25. **`readonly?:`** If this is set `true`, users cannot change its value in the review page.
- 26. **`hideInPreview?:`** Setting this property true hides this field in the review page, although the value still persists in the form data.
- 27. **`ignoreNestedFieldWrappingInPreview?:`** If it is set to `true`, it ignores nested field wrapping when transforming the value.
- 28. **`ignoreFieldLabelOnErrorMessage?:`** It is set to `true`, the fields of a preview group do not show their respective error messages if they have, they show a collective error message instead.
- 29. **`reviewOverrides?:`** This block of configuration is used if we want display a field from one section with another section on the review section. This only affects the review screen, not the section pages view. This configuration consists of total 8 proiperties.
  - **`residingSection:`** ID of the section the field actually belongs to.
  - **`reference:`** This is basically the location where we want the field to appear on the review screen. Reference object consist of `sectionID`, `groupID`, `fieldName`.
  - **`position:`** Optional property, the value of `position` should be either `before` or `after`. It decides either our element appears before the reference element of after.
  - **`labelAs:`** An optional propoerty, Just incase we want to change the label as well.
  - **`conditionals:`** Optional property. Same as any other condition, but this condition applies should the element be displayed on the new location or not. It satisfied it will be displayed to the new location other wise it not change it's location.

### Properties of default.ts

Going through all properties of default.ts below

### registerForm

This object has all the form definitions of corresponding events i.e. birth, death. This object only applies for event declaration forms.

### birth

This object holds sections for birth declaration forms. All sections are contained in sections prop. The sections are ordered as shown below.

1.  ### `registration`
    The registration section has several groups as listed below.

- #### `informant-relation`

  It is a conditional group and it is only visible when someone else is applying for birth (in other words, `presentAtBirthRegistration` equals “OTHER” in draft). This condition is defined in the conditional prop.

  - #### `informant`

    This field has a type of `RADIO_GROUP_WITH_NESTED_FIELDS`. It has a property size and its value large makes it appear bigger than the regular radio option. Similar to radio group but it has an additional feature that shows or hides nested input fields upon selected radio option. The map of the fields against selected values is defined in nestedFields property. For instance, for selected value `OTHER_FAMILY_MEMBER` or `OTHER` it has an array of fields and `otherRelationShip` is the only member of the array. For other selected options as there are no fields to show, they have an empty array on the map.

    - OTHER_FAMILY_MEMBER -> **`otherRelationShip`**

      This is a text input field. This field value is filled up when the informant has any other relationship with the child in the family but not in the provided options. This field value is mapped to `informant.otherRelationShip` in graphql. Having a look at `changeHirerchyMutationTransformer` (for mutation) and `changeHirerchyQueryTransformer` (for query) which are mentioned in the mapping prop will help to get the idea of how the field value gets transformed to graphql payload.

    - OTHER -> **`otherRelationShip`**

      This field is applicable when the informant has any other relationship with the child outside the family. This field also maps to `informant.otherRelationShip` in graphql. The transformation methods are defined in the mapping prop for both query and mutation.

- #### `primary-informant`

  This is also a conditional view group of fields which is visible only when the informant is both parents (`presentAtBirthRegistration` equals “`BOTH_PARENTS`” in draft). The purpose of this group is to choose the primary informant between both parents. It has two fields under it.

  - #### `informant`
    This is also a radio group with nested fields. It has only two options (`MOTHER` and `FATHER`) which indicates the primary informant. It maps to `informant.relationship` in graphql.

- #### `contact-view-group`

  This view group is intended for deciding the contact point of the declaration. The contact point of the declaration means the person who will be notified when the birth registration has been sent for review or registered. The fields under this view group are mentioned below.

  - #### `contactPoint`

    This is a radio group with nested fields. It has some conditional options. When the informant is a legal guardian (the user selects option `LEGAL_GUARDIAN` in the [informant](#informant) field), the options only `INFORMANT`, `OTHER` are displayed. If the informant is one of the parents (the user selects `MOTHER` or `FATHER` in the [informant](#informant) field), the options `MOTHER`, `FATHER` and `OTHER` displayed. If the informant is anyone else, all options are displayed (`INFORMANT`, `MOTHER`, `FATHER`, `OTHER`). All these conditions are defined in conditional prop in respective options. This field maps to registration.contact in graphql. The nested fields after selecting each option is described below.

    - INFORMANT -> **`registrationPhone`**

      When the informant is a legal guardian or anyone other than the parents and contact point is selected to the informant, the `registrationPhone` field is displayed to take input of the phone number. It maps to `registration.contactPhoneNumber` in graphql.

    - MOTHER -> **`registrationPhone`**

      When the primary contact point is `MOTHER`, the field shows up. It also maps to registration.contactPhoneNumber in graphql.

    - FATHER -> **`registrationPhone`**

      When the primary contact point is `FATHER`, the field shows up. It also maps to `registration.contactPhoneNumber`.

    - OTHER -> **`contactRelationshipOther`**

      When the primary contact point is anyone other than the informant or parent, to keep a record of relationship, this text input appears. Maps to `registration.contactRelationshipOther` in graphql.

    - OTHER -> **`registrationPhone`**

      When the primary contact point is another person, below `contactRelationshipOther` field, this `registrationPhone` is shown. As like before, it also maps to `registration.contactPhoneNumber` in graphql.

2.  ### `child`
    This section takes input for the information of the child. It has only one view group child-view-group.

- #### `child-view-group`

  This view group consists of several fields.

  - #### `firstNames`

    First name in the locale of the selected country environment.

  - #### `firstNamesEng`

    First name in English.

  - #### `familyName`

    Family name or surname in the locale of the selected country environment.

  - #### `familyNameEng`

    Family name or surname in English.

  - #### `gender`

    Gender of the child.

  - #### `childBirthDate`

    Birthdate of the child (DD-MM-YYYY).

  - #### `attendantAtBirth`

    Person who attended the birth event.

  - #### `birthType`

    Type of birth. I.e. single or twin etc.

  - #### `multipleBirth`

    Order of birth among children of the parents.

  - #### `placeOfBirth`

    Place of the birth event. It can be a health facility (hospital/clinic), private home or any other place.

  - #### `birthLocation`
    It is a search field which appears if the `placeOfBirth` is a health facility. This field searches among the facilities data we have and enables us to select the right place for the birth event.

* #### `Address fields`

  The following fields are standard address fields configured in the file **administrative/addresses.ts**. We have separate inputs for address lines. They maintain a cascading appearance by their own conditional properties. Sometimes we have a configurable primary and secondary address.

  With the exception of state, district, postcodes and city, address lines map into an address lines array in a FHIR Location at the following indexes:

  - #### `country`

    Country of the place of birth.

  - #### `state`

    State of the place of birth.

  - #### `district`

    District of the place of birth.

  - #### `ruralOrUrban`

    This is a conditional field that only appears if the rest of the address is either an urban or rural address.

    **Urban options**

  - #### `numberUrbanOption`

    Number of property in an urban street. Array index: 1

  - #### `addressLine2UrbanOption`

    Used for street name. Array index: 2

  - #### `addressLine3UrbanOption`

    Used for residential area name. Array index: 3

    - #### `postCodeUrbanOption`

    Postcode for urban address.

    **Rural options**

  - #### `addressLine5`

    Used for a rural village name. Array index: 5 (4 is available for future development if needed on a rural basis)

    **International options**

    The following address fields function in a similar way as above. When the declaration environment country is not the same as the default country, these fields appear instead of the above-mentioned fields.

    - #### `internationalState`

    - #### `internationalDistrict`

    - #### `internationalCity`

    - #### `internationalAddressLine1`

    Array index: 7

    - #### `internationalAddressLine2`

    Array index: 8

    - #### `internationalAddressLine3`

    Array index: 9

    - #### `internationalPostcode`

3.  ### `informant`
    This section takes information of the informant if he/she is a legal guardian. This section has only one view group informant-view-group.

- #### `informant-view-group`

  This is a conditional view group and it only appears when the informant is a legal guardian (the user selects option LEGAL_GUARDIAN in the [informant](#informant) field). This is the only view group of the informant section, so if the condition is not fulfilled the entire section is not visible.

  - #### `idType`

    This is a drop-down for taking input of which type of ID the informant is going to provide. I.e. national ID, driver's license etc.

  - #### `informantID`

    ID number of the selected ID type.

  - #### `fetchButton`

    It is a conditional button which only appears when idType is NATIONAL_ID. It fetches all the information of the person with the ID provided in input and fills up all fields of the form.

  - #### `nationality`

    Nationality of the informant.

  - #### `informantFirstNames`

    First names of the informant in locale.

  - #### `informantFamilyName`

    Family name of the informant in locale.

  - #### `informantFirstNamesEng`

    First names of the informant in english.

  - #### `informantFamilyNameEng`
    The family name of the informant in English.

4.  ### `mother`
    This section takes information about the mother of the child. It has only one conditional view group which is mother-view-group, causing the entire section conditional.

- #### `mother-view-group`

  This view group appears only when the informant has mother details (in other words, the informant selects `MOTHER_ONLY` or `MOTHER_AND_FATHER` in [parentDetailsType](#parentDetailsType) field). This view group consists of several fields

  - #### `detailsExist`

    This is a conditional radio option which checks if the mothers details exists or not if the mother is not the informant or contact type

  - #### `reasonMotherNotApplying`

    Text input, to take input of the reason for the mother not applying if the mother is not the informant or contact type

  - #### `motherBirthDate`

    It is a date field, which takes the input of the birth date of the mother.

  - #### `iDType`

    Dropdown for id type selection of the mother.

  - #### `iD`

    Input for the id number of the selected id type of the mother.

  - #### `fetchButton`

    Button to fetch all information about the mother by id.

  - #### `nationality`

    Dropdown input for the mother’s nationality selection.

  - #### `firstNames`

    Input for the first names in the country locale of the mother.

  - #### `familyName`

    Input for the family name in the country locale of the mother.

  - #### `firstNamesEng`

    Input for the first names in English of the mother.

  - #### `familyNameEng`

    Input for the family name in English of the mother.

  - #### `maritalStatus`

    Input for the marital status of the mother.

  - #### `dateOfMarriage`

    Date of marriage of the mother.

  - #### `educationalAttainment`
    Level of the educational qualification of the mother.

5.  ### `father`

    This section takes input from the father of the child. It has only one view group.

- #### `father-view-group`

  - #### `detailsExist`

    This is a conditional radio option which checks if the fathers details exists or not if the father is not the informant or contact type

  - #### `reasonFatherNotApplying`

    Text input, to take input of the reason for the father not applying if the father is not the informant or contact type

  - #### `fatherBirthDate`

    It is a date field, for the birthdate of the father

  - #### `iDType`

    Input for the id type of the father.

  - #### `iD`

    Input for the id number of selected id type of the father.

  - #### `fetchButton`

    Fetches information of the father by id number.

  - #### `nationality`
    Nationality of the father.

  The following are the name fields of the father and work in a similar way like the [mother](#mother).

  - #### `firstNames`

  - #### `familyName`

  - #### `firstNamesEng`

  - #### `familyNameEng`

  - #### `maritalStatus`

  Marital status of the father.

  - #### `dateOfMarriage`

    Date of marriage of the father, pre-populated if mother has given a marriage date.

  - #### `educationalAttainment`

  The level of the educational qualification of the father.

7.  ### documents
    This section is responsible for taking input of the supporting documents. It has only one view group.

- #### `documents-view-group`

  This view group holds the fields for taking input of the

- #### `paragraph`

  This is a paragraph which holds a short description about supporting documents and their requirements the informant is going to provide. The supporting document requirement varies according to the child age. So, there are multiple conditional paragraph fields which appear in accordance with child birthdate.

  - #### `uploadDocForMother`

    This is a document uploader with options field which is intended to get the documents for the mother. The options are birth registration, national id (front and back) and many more as mentioned in the options prop. This uploader field only appears when the informant has the mother’s details. It can be verified by the conditional prop of this field. Fortunately, we have descriptions in the conditionals which explains a bit about the reason behind the conditional.

  - #### `uploadDocForFather`

    Document uploader field for the father. The options prop has the possible options for documents. Similarly, this field appears only if the informant has father details.

  - #### `uploadDocForInformant`

    Document uploader field for the informant if someone else.

  - #### `uploadDocForProofOfLegarGuardian`

    If the informant is a legal guardian, we need the proof of the legal guardianship. This field takes documents for legal guardianship.

  - #### `uploadDocForProofOfAssignedResponsibility`

    If the informant is someone else and responsible for the child, the proof of assigned responsibility is needed. This field is used to take that documents.

  - #### `uploadDocForParentPrimaryAddress`

    If the child age is between (BIRTH_REGISTRATION_TARGET + 1) days to 5 years, the parent permanent address proof is needed. This conditional field appears only when the child age is within the above mentioned limit.

  - #### `uploadDocForChildDOB`

    If the child age is not between (BIRTH_REGISTRATION_TARGET + 1) days to 5 years, this conditional field appears and is used to take the document of the date of birth of the child.

  - #### `uploadDocForChildAge`

    This conditional field appears only when the child age is more than BIRTH_REGISTRATION_TARGET days. It used to take the document for the proof of child age.

  - #### `uploadDocFromCounsilor`
    This document uploader has only one option of the letter from the ward councilor. As the name goes it is used to take ward councillor proof.

### death

This object holds sections for death declaration forms. All sections are in sections prop (like above). The order is maintained as mentioned below.

1.  #### `registration`

    - #### `other-relationship-with-deceased`

      This view group appears only when the informant is other than the officer in charge, the owner of the house, driver of the vehicle or the head of the institute. To determine the other relationship this view group shows up.

      - #### `relationship`

        It is a radio group with nested fields. It has five options: the owner of the house, driver of the vehicle, head of the institute, office-in-charge and someone else. If someone else is selected (`OTHER` is the selected value), we need to know the relationship the informant has. So, the otherRelationShip nested text input appears when someone else is selected.

      - #### `point-of-contact`

        This view group is used to take the point of contact. It has only one field.

      - #### `contactPoint`
        It is a radio group with nested fields. It has two options: the informant or someone else (`INFORMANT` and `OTHER`). If the informant is the primary contact and then only the phone number input (registrationPhone) pops up as a nested field and if the someone else is selected two fields show up:
        - `contactRelationship`- the relationship between contact person and the deceased.
        - `registrationPhone` - phone number of that contact person.

2.  #### `deceased`

    This section covers all the information about the deceased. It has only one view group.

    - #### `deceased-view-group`

      This view group takes the details of the deceased person.

      - #### `birthDate`

        Birthdate of the deceased.

      - #### `iDType`

        Id type of the deceased.

      - #### `iD`

        Id number of the selected id type of the deceased.

      - #### `fetchButton`

        Fetch button to fetch the details of the deceased with his/her id number.

      - #### `nationality`

        Nationality of the deceased.

      - #### `firstNames`

        First names in the country locale of the deceased.

      - #### `familyName`

        Family name in the country locale of the deceased.

      - #### `firstNamesEng`

        First names in English of the deceased.

      - #### `familyNameEng`

        The family name of the deceased.

      - #### `gender`

        Gender of the deceased.

      - #### `maritalStatus`
        Marital status of the deceased.

3.  #### `deathEvent`
    This section covers all the information about the death event. It has several groups and some of them are conditional.

- #### `deathEvent-deathDate`

  This view group is used to take input from the death date, having only one field.

  - #### `deathDate`

    This is a date field. Takes the date of the death occurrence.

- #### `deathEvent-deathManner`

  It concerns the manner of death.

  - #### `manner`

    It is a radio group. To provide information about how the death occurred, the informant should provide this field. It has five options.

    1.  `NATURAL_CAUSES`: If the death occurred by natural causes this radio option is selected.

    2.  `ACCIDENT`: Selected if the death occurred by accident.

    3.  `SUICIDE`: Selected if the manner is suicide.

    4.  `HOMICIDE`: Selected if the manner is homicide.

    5.  `MANNER_UNDETERMINED`: Selected if the manner is not determined yet.

    - #### `deathEvent-deathPlaceAddress`

      This view group concerns where the death occurred. It has only one field.

    - #### `deathPlaceAddress`

      It is a radio group. It has five options.

      1.  `PERMANENT`: If the death occurred in the deceased's permanent address, this option is selected.

      2.  `CURRENT`: If the death occurred in the deceased's current address, this option is selected.

      3.  `PRIVATE_HOME`: If the death occurred in the deceased’s private home, this option is selected.

      4.  `HEALTH_FACILITY`: If the death occurred in a health facility, this option is selected.

      5.  `OTHER`: It is selected when the death occurred in none of the above places.

- #### `deathEvent-deathLocation`

  This conditional view group appears only when the death occurred in a health facility.

  - #### `deathLocation`
    It is a search field. It allows users to search among the offline facilities data to find out the actual health facility where death occurred.

- #### `deathEvent-deathAtPrivateHome`

4.  #### `causeOfDeath`

    This section concerns the cause of death.

- #### `causeOfDeath-causeOfDeathEstablished`

  This view group checks if a cause of death is established. It contains only one field.

  - #### `causeOfDeathEstablished`
    This is a radio group field. This field queries whether a cause of death established or not having two options: yes, no.

- #### `causeOfDeath-methodOfCauseOfDeathSection`

  This conditional view group shows up only if there is an established cause of death.

  - #### `causeOfDeathCode`

    It is a text input for taking the cause of death code as the cause of death is established.

5.  #### `informant`
    This section concerns the informant of the death event which has only one group.

- #### `informant-view-group`

  This view group has the fields for taking the information about the informant.

  - #### `informantBirthDate`

    Date field, stands for the birth date of the informant.

  - #### `iDType`

    Id type of the informant.

  - #### `informantID`

    Id number of the selected id type of the informant.

  - #### `fetchButton`

    Fetch button for fetching information of the informant by the person’s id.

  - #### `nationality`

    Nationality of the informant.

  - #### `informantFirstNames`

    First names in the country locale of the informant.

  - #### `informantFamilyName`

    Family name in the country locale of the informant.

  - #### `informantFirstNamesEng`

    First names in English of the informant.

  - #### `informantFamilyNameEng`

    Family name in English of the informant.

  - #### `relationship`
    Relationship of the informant to the deceased.

6.  #### `father`
    This section has only one conditional view group making the entire section conditional.

- #### `father-view-group`

  This conditional view group only shows up when the informant is not the father of the deceased. This view group has four fields.

  - #### `fatherFirstNames`

    First names in the country locale of the deceased’s father.

  - #### `fatherFamilyName`

    Family name in the country locale of the deceased’s father.

  - #### `fatherFirstNamesEng`

    First names in English of the deceased’s father.

  - #### `fatherFamilyNameEng`
    Family name in English of the deceased’s father.

7.  #### `mother`
    Like the father section, this section also has only one conditional view group making the entire section conditional.

- #### `mother-view-group`

  This conditional view group only shows up when the informant is not the mother of the deceased. This view group has four fields too.

  - #### `motherFirstNames`

    First names in the country locale of the deceased’s mother.

  - #### `motherFamilyName`

    Family name in the country locale of the deceased’s mother.

  - #### `motherFirstNamesEng`

    First names in English of the deceased’s mother.

  - #### `motherFamilyNameEng`
    First names in English of the deceased’s mother.

8.  #### `spouse`
    This section concerns the deceased’s spouse. It has only one conditional view group. So, it is a conditional section.

- #### `spouse-view-group`

  This view group only shows up when the informant is not a spouse. It has only one field.

  - #### `hasDetails`
    It is a radio group with nested fields. It queries whether the deceased person had a spouse or not. So the options are yes and no. If selected no, the user can move on to the next section. If selected yes, the name fields (`spouseFirstNames, spouseFamilyName, spouseFirstNamesEng, spouseFamilyNameEng`) will show up as nested fields to take input of the spouse’s name.

9.  #### `documents`

    This is the section that takes the responsibility of the supporting documents concerning the death event declaration.

- #### `documents-view-group`

  It is the only view group of the documents section. This view group contains mostly fields of document uploader with options type.

  - #### `paragraph`

    This is a paragraph, holds a descriptive message about the supporting documents requirements.

  - #### `uploadDocForDeceased`

    This is a document uploader with options and is used to take the documents for the deceased. The document of this field actually stands for the deceased id proof. So, the `extraValue` of this is `DECEASED_ID_PROOF`. The options are National ID, Passport, Birth Registration & Other.

  - #### `uploadDocForInformant`

    This “document uploader with options” field stands for the documents for the informant as proof of his/her id. So the `extraValue` of this field is `INFORMANT_ID_PROOF`. The options are the same as the deceased.

  - #### `uploadDocForDeceasedDeath`

    This field takes proof of the death of the deceased. It has several options, which are: Attested Letter of Death, Police Certificate of Death, Hospital Certificate of Death, Coroner's Report, Burial Receipt & Other. The `extraValue` of this field `DECEASED_DEATH_PROOF`, which is self-descriptive.

  - #### `uploadDocForCauseOfDeath`

    This field is conditional and only appears if the Cause of Death has been established. The `extraValue` of this field is DECEASED_DEATH_CAUSE_PROOF. The options are Medically Certified Cause of Death, Verbal Autopsy Report & Other.
