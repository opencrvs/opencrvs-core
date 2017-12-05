export const IMPORT_COMPLETED = 'IMPORT_COMPLETED';
export const CLEAR_COMPLETED = 'CLEAR_COMPLETED';
import { apiMiddleware } from 'utils/api-middleware';
import { BASE_URL } from 'constants/urls';
import submitValues from 'constants/import';
import { get } from 'lodash';
const uuidv4 = require('uuid/v4');

export function importData() {
  return (dispatch, getState) => {
    let token = localStorage.getItem('token') || null;
    let childPatientURL = BASE_URL + 'patient';
    let motherPatientURL = BASE_URL + 'patient';
    let fatherPatientURL = BASE_URL + 'patient';
    let childAddressURL = BASE_URL + 'address';
    let childTelecomURL = BASE_URL + 'telecom';
    let childExtraURL = BASE_URL + 'extra';
    let motherAddressURL = BASE_URL + 'address';
    let motherTelecomURL = BASE_URL + 'telecom';
    let motherExtraURL = BASE_URL + 'extra';
    let fatherAddressURL = BASE_URL + 'address';
    let fatherTelecomURL = BASE_URL + 'telecom';
    let fatherExtraURL = BASE_URL + 'extra';
    let declarationsURL = BASE_URL + 'declarations';
    let locationsURL = BASE_URL + 'locations';
    let informantsURL = BASE_URL + 'informant';
    let notificationsURL = BASE_URL + 'notifications';

    let childConfig = {};

    const childData = new FormData();
    const motherData = new FormData();
    const fatherData = new FormData();

    const childAddressData = new FormData();
    const motherAddressData = new FormData();
    const fatherAddressData = new FormData();

    const childTelecomData = new FormData();
    const motherTelecomData = new FormData();
    const fatherTelecomData = new FormData();

    const childExtraData = new FormData();
    const motherExtraData = new FormData();
    const fatherExtraData = new FormData();

    const declarationsData = new FormData();
    const locationsData = new FormData();
    const informantsData = new FormData();

    const notificationsData = new FormData();
    
    childConfig = {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    };

    let motherConfig = Object.assign({}, childConfig);
    let fatherConfig = Object.assign({}, childConfig);
    let notificationsConfig = Object.assign({}, childConfig);

    let childAddressConfig = Object.assign({}, childConfig);
    let motherAddressConfig = Object.assign({}, childConfig);
    let fatherAddressConfig = Object.assign({}, childConfig);

    let childTelecomConfig = Object.assign({}, childConfig);
    let motherTelecomConfig = Object.assign({}, childConfig);
    let fatherTelecomConfig = Object.assign({}, childConfig);

    let childExtraConfig = Object.assign({}, childConfig);
    let motherExtraConfig = Object.assign({}, childConfig);
    let fatherExtraConfig = Object.assign({}, childConfig);

    let declarationsConfig = Object.assign({}, childConfig);
    let locationsConfig = Object.assign({}, childConfig);
    let informantsConfig = Object.assign({}, childConfig);

    childData.append('uuid', uuidv4());
    childData.append('prefix', 'ch');
    childData.append('given', get(submitValues, 'firstName') + ', ' +  get(submitValues, 'middleName'));
    childData.append('family', get(submitValues, 'family'));
    childData.append('birthDate', get(submitValues, 'birthDate'));
    childData.append('gender', get(submitValues, 'gender'));
    childData.append('maritalStatus', 'single');
    childData.append('nationality', 'Ghana');
    childConfig.body = childData;

    motherData.append('uuid', uuidv4());
    motherData.append('prefix', 'Mrs');
    motherData.append('given', get(submitValues, 'mother_firstName')
      + ', ' +  get(submitValues, 'mother_middleName'));
    motherData.append('family', get(submitValues, 'mother_family'));
    motherData.append('birthDate', get(submitValues, 'mother_birthDate'));
    motherData.append('gender', get(submitValues, 'mother_gender'));
    motherData.append('maritalStatus', get(submitValues, 'mother_maritalStatus'));
    motherData.append('nationality', get(submitValues, 'mother_nationality'));
    motherConfig.body = motherData;

    fatherData.append('uuid', uuidv4());
    fatherData.append('prefix', 'Mr');
    fatherData.append('given', get(submitValues, 'father_firstName')
      + ', ' +  get(submitValues, 'father_middleName'));
    fatherData.append('family', get(submitValues, 'father_family'));
    
    fatherData.append('birthDate', get(submitValues, 'father_birthDate'));
    
    fatherData.append('gender', get(submitValues, 'father_gender'));
    fatherData.append('maritalStatus', get(submitValues, 'father_maritalStatus'));
    fatherData.append('nationality', get(submitValues, 'father_nationality'));
    fatherConfig.body = fatherData;

    const patientPromises = [];
    patientPromises.push(apiMiddleware(childConfig, childPatientURL, dispatch));
    patientPromises.push(apiMiddleware(motherConfig, motherPatientURL, dispatch));
    patientPromises.push(apiMiddleware(fatherConfig, fatherPatientURL, dispatch));

    Promise.all(patientPromises).then(updatedPatient => {

      const subPromises = [];
      const childID = get(updatedPatient[0], 'updated.id');
      const motherID = get(updatedPatient[1], 'updated.id');
      const fatherID = get(updatedPatient[2], 'updated.id');

      childAddressData.append('addressLine1', get(submitValues, 'mother_addressLine1'));
      childAddressData.append('addressLine2', get(submitValues, 'mother_addressLine2'));
      childAddressData.append('addressLine3', get(submitValues, 'mother_addressLine3'));
      childAddressData.append('city', get(submitValues, 'mother_city'));
      childAddressData.append('county', get(submitValues, 'mother_county'));
      childAddressData.append('state', get(submitValues, 'mother_state'));
      childAddressData.append('postalCode', get(submitValues, 'mother_postalCode'));
      childAddressData.append('patient_id', childID);
      childAddressConfig.body = childAddressData;
      
      motherAddressData.append('addressLine1', get(submitValues, 'mother_addressLine1'));
      motherAddressData.append('addressLine2', get(submitValues, 'mother_addressLine2'));
      motherAddressData.append('addressLine3', get(submitValues, 'mother_addressLine3'));
      motherAddressData.append('city', get(submitValues, 'mother_city'));
      motherAddressData.append('county', get(submitValues, 'mother_county'));
      motherAddressData.append('state', get(submitValues, 'mother_state'));
      motherAddressData.append('postalCode', get(submitValues, 'mother_postalCode'));
      motherAddressData.append('patient_id', motherID);
      motherAddressConfig.body = motherAddressData;

      fatherAddressData.append('addressLine1', get(submitValues, 'father_addressLine1'));
      fatherAddressData.append('addressLine2', get(submitValues, 'father_addressLine2'));
      fatherAddressData.append('addressLine3', get(submitValues, 'father_addressLine3'));
      fatherAddressData.append('city', get(submitValues, 'father_city'));
      fatherAddressData.append('county', get(submitValues, 'father_county'));
      fatherAddressData.append('state', get(submitValues, 'father_state'));
      fatherAddressData.append('postalCode', get(submitValues, 'father_postalCode'));
      fatherAddressData.append('patient_id', fatherID);
      fatherAddressConfig.body = fatherAddressData;

      subPromises.push(apiMiddleware(childAddressConfig, childAddressURL, dispatch));
      subPromises.push(apiMiddleware(motherAddressConfig, motherAddressURL, dispatch));
      subPromises.push(apiMiddleware(fatherAddressConfig, fatherAddressURL, dispatch));
      //set up telecom
      
      childTelecomData.append('email', get(submitValues, 'mother_email'));
      childTelecomData.append('phone', get(submitValues, 'mother_phone'));
      childTelecomData.append('use', get(submitValues, 'mother_use'));
      childTelecomData.append('patient_id', childID);
      childTelecomConfig.body = childTelecomData;
      
      motherTelecomData.append('email', get(submitValues, 'mother_email'));
      motherTelecomData.append('phone', get(submitValues, 'mother_phone'));
      motherTelecomData.append('use', get(submitValues, 'mother_use'));
      const motherPhone = get(submitValues, 'mother_phone');
      motherTelecomData.append('patient_id', motherID);
      motherTelecomConfig.body = motherTelecomData;
      
      fatherTelecomData.append('email', get(submitValues, 'father_email'));
      fatherTelecomData.append('phone', get(submitValues, 'father_phone'));
      fatherTelecomData.append('use', get(submitValues, 'father_use'));

      fatherTelecomData.append('patient_id', fatherID);
      fatherTelecomConfig.body = fatherTelecomData;

      subPromises.push(apiMiddleware(childTelecomConfig, childTelecomURL, dispatch));
      subPromises.push(apiMiddleware(motherTelecomConfig, motherTelecomURL, dispatch));
      subPromises.push(apiMiddleware(fatherTelecomConfig, fatherTelecomURL, dispatch));
      
      let newChildPersonalID = null;
      // temporarily create a dummy personal ID number.  Should be generated in the backend
      newChildPersonalID = 'G' + uuidv4().substring(0, 6).toUpperCase();
      childExtraData.append('personalIDNummber', newChildPersonalID);
      childExtraData.append('patient_id', childID);
      childExtraData.append('typeOfBirth', get(submitValues, 'typeOfBirth'));
      childExtraConfig.body = childExtraData;
      
      motherExtraData.append('childrenBornAlive', get(submitValues, 'childrenBornAlive'));
      motherExtraData.append('childrenBornLiving', get(submitValues, 'childrenBornLiving'));
      motherExtraData.append('foetalDeaths', get(submitValues, 'foetalDeaths'));
      motherExtraData.append('birthDateLast', get(submitValues, 'birthDateLast'));
      motherExtraData.append('formalEducation', get(submitValues, 'mother_formalEducation'));
      motherExtraData.append('occupation', get(submitValues, 'mother_occupation'));
      motherExtraData.append('religion', get(submitValues, 'mother_religion'));
      motherExtraData.append('employment', get(submitValues, 'mother_employment'));
      motherExtraData.append('personalIDNummber', get(submitValues, 'mother_personalIDNummber'));
      motherExtraData.append('maidenName', get(submitValues, 'mother_maidenName'));
      motherExtraData.append('marriageDate', get(submitValues, 'mother_marriageDate'));
      motherExtraData.append('patient_id', motherID);
      motherExtraConfig.body = motherExtraData;
      
      fatherExtraData.append('formalEducation', get(submitValues, 'father_formalEducation'));
      fatherExtraData.append('occupation', get(submitValues, 'father_occupation'));
      fatherExtraData.append('religion', get(submitValues, 'father_religion'));
      fatherExtraData.append('employment', get(submitValues, 'father_employment'));
      fatherExtraData.append('personalIDNummber', get(submitValues, 'father_personalIDNummber'));
      fatherExtraData.append('maidenName', get(submitValues, 'father_maidenName'));
      fatherExtraData.append('marriageDate', get(submitValues, 'father_marriageDate'));
      fatherExtraData.append('patient_id', fatherID);
      fatherExtraConfig.body = fatherExtraData;

      subPromises.push(apiMiddleware(motherExtraConfig, motherExtraURL, dispatch));
      subPromises.push(apiMiddleware(fatherExtraConfig, fatherExtraURL, dispatch));
      subPromises.push(apiMiddleware(childExtraConfig, childExtraURL, dispatch));

      Promise.all(subPromises).then(updatedItems => {

        const declarationPromises = [];
        let newBirthRegistrationNumber = null;
        const newUuid = uuidv4();
        const prefix = get(submitValues, 'tracking').substring(0, 1);
        const suffix1 = get(submitValues, 'firstName').substring(0, 1);
        const suffix2 = get(submitValues, 'family').substring(0, 1);
        const newTrackID = prefix + 'd-' + newUuid.substring(0, 8) + suffix1 + suffix2;

        declarationsData.append('uuid', get(submitValues, 'uuid'));
        declarationsData.append('tracking', newTrackID);
        declarationsData.append('motherDetails', motherID);
        declarationsData.append('fatherDetails', fatherID);
        declarationsData.append('childDetails', childID);
        declarationsData.append('code', 'birth-declaration');
        declarationsData.append('status', 'notified-saved');

        declarationsConfig.body = declarationsData;

        declarationPromises.push(apiMiddleware(declarationsConfig, declarationsURL, dispatch));
        Promise.all(declarationPromises).then(updatedDeclaration => {

          const declarationID = updatedDeclaration[0].updated.id;
          const trackingID = updatedDeclaration[0].updated.tracking;
          const declarationExtraPromises = [];
          
          locationsData.append('placeOfDelivery', get(submitValues, 'placeOfDelivery'));
          locationsData.append('attendantAtBirth', get(submitValues, 'attendantAtBirth'));
          locationsData.append('hospitalName', get(submitValues, 'hospitalName'));
          locationsData.append('addressLine1', get(submitValues, 'addressLine1'));
          locationsData.append('addressLine2', get(submitValues, 'addressLine2'));
          locationsData.append('addressLine3', get(submitValues, 'addressLine3'));
          locationsData.append('city', get(submitValues, 'city'));
          locationsData.append('county', get(submitValues, 'county'));
          locationsData.append('state', get(submitValues, 'state'));
          locationsData.append('postalCode', get(submitValues, 'postalCode'));
          locationsData.append('declaration_id', declarationID);
          locationsConfig.body = locationsData;

          informantsData.append('uuid', uuidv4());
          informantsData.append('given', get(submitValues, 'informant_firstName')
              + ', ' +  get(submitValues, 'informant_middleName'));
          informantsData.append('family', get(submitValues, 'informant_family'));
          informantsData.append('relationship', get(submitValues, 'informant_relationship'));
          informantsData.append('phone', get(submitValues, 'informant_phone'));
          informantsData.append('email', get(submitValues, 'informant_email'));
          informantsData.append('personalIDNummber', get(submitValues, 'informant_personalIDNummber'));
          informantsData.append('addressLine1', get(submitValues, 'addressLine1'));
          informantsData.append('addressLine2', get(submitValues, 'addressLine2'));
          informantsData.append('addressLine3', get(submitValues, 'addressLine3'));
          informantsData.append('city', get(submitValues, 'city'));
          informantsData.append('county', get(submitValues, 'county'));
          informantsData.append('state', get(submitValues, 'state'));
          informantsData.append('postalCode', get(submitValues, 'postalCode'));
          informantsData.append('declaration_id', declarationID);
          informantsConfig.body = informantsData;

          notificationsData.append('uuid', get(submitValues, 'uuid'));
          notificationsConfig.body = notificationsData;

          declarationExtraPromises.push(apiMiddleware(locationsConfig, locationsURL, dispatch));
          declarationExtraPromises.push(apiMiddleware(informantsConfig, informantsURL, dispatch));
          declarationExtraPromises.push(apiMiddleware(notificationsConfig, notificationsURL, dispatch));

          Promise.all(declarationExtraPromises).then(updatedDeclaration => {
            console.log('import saved')
            dispatch(importCompleted());
          });
        });
      });
    });
  };
}

export function clearData() {
  let token = localStorage.getItem('token') || null;
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  return dispatch => {
    if (token) {
      
      return fetch(BASE_URL + 'clear', config)
        .then(response =>
          response.json().then(payload => ({ payload, response }))
        )
        .then(({ payload, response }) => {
          
          console.log('cleared');
          dispatch(clearCompleted());
            
        })
        .catch(err => {
          
          console.log(err);
          
        });
    } else {
      console.log('no token');
      return false;
    }
  }
      
  
};

function importCompleted() {
  return {
    type: IMPORT_COMPLETED,
  };
}

function clearCompleted() {
  return {
    type: CLEAR_COMPLETED,
  };
}
