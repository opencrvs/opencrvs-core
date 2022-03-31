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
export const FRENCH_STATE = {
  lang: 'fr',
  displayName: 'Français',
  messages: {
    'buttons.confirm': 'Confirmer',
    'buttons.continue': 'Continuer',
    'buttons.login': 'Connexion',
    'constants.phoneNumber': 'Numéro de téléphone',
    'error.networkError': 'Impossible de se connecter au serveur',
    'error.required.password': "Le nouveau mot de passe n'est pas valide",
    'error.errorPhoneNumberNotFound': 'Numéro de téléphone mobile non trouvé.',
    'label.error': 'Entrée invalide',
    'login.stepOneInstruction':
      "Veuillez entrer votre nom d'utilisateur et votre mot de passe.",
    'login.username': "Nom d'utilisateur",
    'login.mobileLabel': 'Numéro de téléphone mobile',
    'login.mobilePlaceholder': '7123456789',
    'login.passwordLabel': 'Mot de passe',
    'login.submit': 'Soumettre',
    'login.forgotPassword': 'Vous ne pouvez pas vous connecter ?',
    'login.submissionError':
      "Désolé que le nom d'utilisateur et le mot de passe n'aient pas fonctionné.",
    'login.forbiddenCredentialError':
      "L'utilisateur est actuellement désactivé.",
    'login.codeSubmissionError': "Désolé, ce code n'a pas fonctionné.",
    'login.tooManyLoginAttemptError':
      'Trop de tentatives de connexion. Vous pouvez réessayer après une minute.',
    'login.tooManyCodeAttemptError':
      'Trop de tentatives de saisie du code. Vous pouvez réessayer après une minute.',
    'login.fieldMissing': "Nom d'utilisateur/mot de passe requis",
    'login.resentSMS': 'Nous venons de vous envoyer un autre code à {number}.',
    'login.stepTwoResendTitle': 'Envoi du code de vérification',
    'login.resendMobile': 'Renvoyer le SMS',
    'login.optionalLabel': 'Optionnel',
    'login.stepTwoTitle': 'Vérifier votre téléphone portable',
    'login.verficationCodeLabel': 'Code de vérification (6 chiffres)',
    'login.stepTwoInstruction':
      'Un code de vérification a été envoyé à votre téléphone. se terminant par {number}. Ce code sera valide pendant 5 minutes.',
    'login.clearForm': 'Effacer le formulaire',
    'login.manager.registerAppTitle': "Page d'accueil OpenCRVS",
    'login.manager.registerAppDescription':
      'Gérez ici vos déclarations, enregistrements et certifications.',
    'login.manager.performanceAppTitle': 'Gestion des performances',
    'login.manager.performanceAppDescription':
      "Analysez les performances d'une région particulière de votre pays en matière d'enregistrement des faits d'état civil.",
    'resend.sms': 'Renvoyer un SMS',
    'resetCredentials.form.title':
      "{forgottenItem, select, username {Demande de rappel de nom d'utilisateur} password {Réinitialisation du mot de passe} other {}}",
    'resetCredentials.forgottenItem.form.title': 'Impossible de se connecter',
    'resetCredentials.forgottenItem.form.body.header': "Qu'avez-vous oublié ?",
    'resetCredentials.label.field.verificationCode':
      'Code de vérification (6 chiffres)',
    'resetCredentials.label.field.answer': 'Réponse',
    'resetCredentials.option.username': "Mon nom d'utilisateur",
    'resetCredentials.option.password': 'Mon mot de passe',
    'resetCredentials.phoneNumberConfirmation.form.body.header':
      'Quel est votre numéro de téléphone ?',
    'resetCredentials.phoneNumberConfirmation.form.body.subheader':
      "C'est le numéro associé à votre compte.",
    'resetCredentials.recoveryCodeEntry.form.body.header':
      'Entrez le code de récupération à 6 chiffres',
    'resetCredentials.recoveryCodeEntry.form.body.subheader':
      "Le code de récupération a été envoyé à votre numéro de téléphone. Veuillez entrer le code. Vous ne l'avez pas reçu ?",
    'resetCredentials.recoveryCodeEntry.codeResent.form.body.header':
      'Envoi du code de vérification',
    'resetCredentials.recoveryCodeEntry.codeResent.form.body.subheader':
      'Nous venons de vous renvoyer un autre code à {number}.',
    'resetCredentials.securityQuestion.form.body.subheader':
      "Il s'agit d'une des questions de sécurité que vous choisissez lors de la création de votre compte",
    'resetCredentials.success.page.title':
      "{forgottenItem, select, username {Rappel de l'identifiant envoyé} password {Réinitialisation du mot de passe réussie} other {}}",
    'resetCredentials.success.page.subtitle':
      "{forgottenItem, select, username {Vérifiez votre téléphone pour vous rappeler votre nom d'utilisateur.} password {Vous pouvez maintenant vous connecter avec votre nouveau mot de passe} other {}}",
    'misc.newPass.header': 'Choisissez un nouveau mot de passe',
    'misc.newPass.instruction':
      "Nous vous recommandons de créer un mot de passe unique, que vous n'utilisez pas pour un autre site Web ou une autre application. Remarque. Vous ne pouvez pas réutiliser votre ancien mot de passe une fois que vous l'avez modifié.",
    'password.label.confirm': 'Confirmez le mot de passe',
    'password.label.new': 'Nouveau mot de passe',
    'password.cases': 'Contient des majuscules et des minuscules',
    'password.match': 'Les mots de passe correspondent',
    'password.minLength': '{min} caractères minimum',
    'password.mismatch': 'Les mots de passe ne correspondent pas',
    'password.number': 'Au moins un chiffre',
    'password.validation.msg': 'Le mot de passe doit avoir ,',
    'validations.required': 'requis',
    'validations.minLength': 'Doit comporter {min} caractères ou plus',
    'validations.numberRequired': 'Doit être un numéro',
    'validations.phoneNumberFormat':
      'Doit être un numéro de téléphone mobile valide. Commençant par 0. Par exemple, {example}',
    'validations.mobilePhoneRegex': '0[0-9]{9,10}',
    'validations.mobileNumberFormat': '7123456789',
    'validations.requiredSymbol': 'x',
    'userSetup.securityQuestions.birthTown': 'Dans quelle ville êtes-vous né ?',
    'userSetup.securityQuestions.favoriteFood': 'Quel est votre plat préféré ?',
    'userSetup.securityQuestions.favoriteMovie':
      'Quel est votre film préféré ?',
    'userSetup.securityQuestions.favoriteSong':
      'Quelle est votre chanson préférée ?',
    'userSetup.securityQuestions.favoriteTeacher':
      "Quel est le nom de votre professeur d'école préféré ?",
    'userSetup.securityQuestions.firstChildName':
      'Quel est le nom de votre premier enfant ?',
    'userSetup.securityQuestions.hightSchool':
      'Quel est le nom de votre école secondaire ?',
    'userSetup.securityQuestions.motherName': 'Quel est le nom de votre mère ?'
  }
}
