import { createServer } from 'node:http'
import { contract, implement } from '@opencrvs/toolkit/server'
import { RPCHandler } from '@orpc/server/node'
import { CORSPlugin } from '@orpc/server/plugins'

const os = implement(contract)

const router = os.router({
  events: os.events.handler(() => []),
  workqueue: os.workqueue.handler(() => []),
  roles: os.roles.handler(() => []),
  application: {
    config: os.application.config.handler(() => ({
      APPLICATION_NAME: 'Farajaland CRS',
      LANGUAGES: ['en', 'fr']
    }))
  },
  login: {
    content: os.login.content.handler(() => ({
      languages: [
        {
          lang: 'en',
          messages: {
            'buttons.confirm': 'Confirm',
            'buttons.continue': 'Continue',
            'buttons.login': 'Login',
            'constants.emailAddress': 'Email address',
            'constants.phoneNumber': 'Phone number',
            'constants.skipToMainContent': 'Skip to main content',
            'error.errorEmailAddressNotFound': 'Email address not found.',
            'error.errorPhoneNumberNotFound': 'Phone number not found',
            'error.networkError': 'Unable to connect to server',
            'error.required.password': 'Invalid password',
            'label.error': 'Invalid input',
            'login.clearForm': 'Clear form',
            'login.codeSubmissionError':
              'Incorrect verification code. Please try again',
            'login.fieldMissing': 'Enter your username and password',
            'login.forbiddenCredentialError': 'User is currently deactivated',
            'login.forgotPassword': "Can't login?",
            'login.language':
              '{language, select, en {English} fr {Français} other {{language}}}',
            'login.manager.performanceAppDescription':
              "Analyse the performance of a particular area of your country in it's Civil Registration.",
            'login.manager.performanceAppTitle': 'Performance Management',
            'login.manager.registerAppDescription':
              'Manage declarations, registrations and certifications here.',
            'login.manager.registerAppTitle': 'OpenCRVS',
            'login.mobileLabel': 'Mobile number',
            'login.mobilePlaceholder': '07123456789',
            'login.optionalLabel': 'Optional',
            'login.passwordLabel': 'Password',
            'login.resend':
              'Resend {notificationMethod, select, sms {SMS} email {Email} other {}}',
            'login.resentEMAIL': 'Authentication code sent to {email}',
            'login.resentSMS': 'Authentication code sent to {number}',
            'login.stepOneInstruction':
              'Please enter your username and password.',
            'login.stepOneText': 'Login to Farajaland CRVS',
            'login.stepTwoInstruction.email':
              'An authentication code has been sent to {email}. This code will be valid for 10 minutes',
            'login.stepTwoInstruction.sms':
              'An authentication code has been sent to {number}. This code will be valid for 10 minutes',
            'login.stepTwoResendTitle': 'Authentication code resent',
            'login.stepTwoTitle': 'Verify your account',
            'login.submissionError': 'Incorrect username or password',
            'login.submit': 'Login',
            'login.tooManyCodeAttemptError':
              'Too many code entry attempts. You can try again after one minute.',
            'login.tooManyLoginAttemptError':
              'Too many login attempts. You can try again after one minute.',
            'login.username': 'Username',
            'login.verficationCodeLabel': 'Verification code (6 digits)',
            'login.verify': 'Verify',
            'misc.newPass.header': 'Choose a new password',
            'misc.newPass.instruction':
              "Create a unique password - one that you don't use for other websites or applications. A secure and easy to remember passphrase could include three random words, while avoiding the use of personal info.",
            'password.cases': 'At least one upper and lower case character',
            'password.label.confirm': 'Confirm password',
            'password.label.new': 'New password',
            'password.match': 'Passwords match',
            'password.minLength': '{min} characters minimum',
            'password.mismatch': 'Passwords do not match',
            'password.number': 'At least one number',
            'password.validation.msg': 'Password must have:',
            'reloadmodal.body':
              'There’s a new version of {app_name} available. Please update to continue.',
            'reloadmodal.button.update': 'Update',
            'reloadmodal.title': 'Update available',
            'resend.sms':
              'Resend {notificationMethod, select, sms {SMS} email {Email} other {}}',
            'resetCredentials.emailAddressConfirmation.form.body.header':
              'Enter your email address',
            'resetCredentials.forgottenItem.form.body.header':
              'Select an option',
            'resetCredentials.forgottenItem.form.title': "Can't login",
            'resetCredentials.form.title':
              '{forgottenItem, select, username {Username reminder} password {Password reset} other {}}',
            'resetCredentials.label.field.answer': 'Answer',
            'resetCredentials.label.field.verificationCode':
              'Verification code (6 digits)',
            'resetCredentials.option.password': 'Password reset',
            'resetCredentials.option.username': 'Username reminder',
            'resetCredentials.phoneNumberConfirmation.form.body.header':
              'Enter your phone number',
            'resetCredentials.phoneNumberConfirmation.form.body.subheader': '',
            'resetCredentials.recoveryCodeEntry.codeResent.form.body.header':
              'Authentication code resent',
            'resetCredentials.recoveryCodeEntry.codeResent.form.body.subheader':
              'Resent another code to {number}.',
            'resetCredentials.recoveryCodeEntry.form.body.header':
              'Enter 6-digit authetication code',
            'resetCredentials.recoveryCodeEntry.form.body.subheader':
              "An authentication code was sent to your phone number. Didn't receive it? {link}",
            'resetCredentials.recoveryCodeEntry.form.body.subheader.email':
              "The recovery code was sent to your email. Please enter the code. Didn't receive it? {link}",
            'resetCredentials.securityQuestion.form.body.subheader':
              'This is one of the security questions you choose when setting up your account',
            'resetCredentials.success.page.subtitle.email':
              '{forgottenItem, select, username {Check your email for a reminder of your username} password {You can now login with your new password} other {}}',
            'resetCredentials.success.page.subtitle.phone':
              '{forgottenItem, select, username {Check your phone for a reminder of your username} password {You can now login with your new password} other {}}',
            'resetCredentials.success.page.title':
              '{forgottenItem, select, username {Username reminder sent} password {Password reset successful} other {}}',
            'userSetup.securityQuestions.birthTown':
              'What city were you born in?',
            'userSetup.securityQuestions.favoriteFood':
              'What is your favorite food?',
            'userSetup.securityQuestions.favoriteMovie':
              'What is your favorite movie?',
            'userSetup.securityQuestions.favoriteSong':
              'What is your favorite song?',
            'userSetup.securityQuestions.favoriteTeacher':
              'What is the name of your favorite school teacher?',
            'userSetup.securityQuestions.firstChildName':
              "What is your first child's name?",
            'userSetup.securityQuestions.hightSchool':
              'What is the name of your high school?',
            'userSetup.securityQuestions.motherName':
              "What is your mother's name?",
            'validations.emailAddressFormat': 'Must be a valid email address',
            'validations.minLength': 'Must be {min} characters or more',
            'validations.mobileNumberFormat': '07123456789',
            'validations.mobilePhoneRegex': '0[0-9]{9,10}',
            'validations.numberRequired': 'Must be number',
            'validations.phoneNumberFormat':
              'Enter a valid mobile phone number',
            'validations.required': 'required',
            'validations.requiredSymbol': ''
          }
        },
        {
          lang: 'fr',
          messages: {
            'buttons.confirm': 'Confirmer',
            'buttons.continue': 'Continuer',
            'buttons.login': 'Se connecter',
            'constants.emailAddress': 'Adresse e-mail',
            'constants.phoneNumber': 'Numéro de téléphone',
            'constants.skipToMainContent': 'Passer au contenu principal',
            'error.errorEmailAddressNotFound': 'Adresse e-mail introuvable.',
            'error.errorPhoneNumberNotFound':
              'Numéro de téléphone mobile non trouvé.',
            'error.networkError': 'Impossible de se connecter au serveur',
            'error.required.password':
              "Le nouveau mot de passe n'est pas valide",
            'label.error': 'Entrée invalide',
            'login.clearForm': 'Effacer le formulaire',
            'login.codeSubmissionError': "Désolé, ce code n'a pas fonctionné.",
            'login.fieldMissing': "Nom d'utilisateur/mot de passe requis",
            'login.forbiddenCredentialError':
              "L'utilisateur est actuellement désactivé.",
            'login.forgotPassword': 'Vous ne pouvez pas vous connecter ?',
            'login.language':
              '{language, select, en {English} fr {Français} other {{language}}}',
            'login.manager.performanceAppDescription':
              "Analysez les performances d'une région particulière de votre pays en matière d'enregistrement des faits d'état civil.",
            'login.manager.performanceAppTitle': 'Gestion des performances',
            'login.manager.registerAppDescription':
              'Gérez ici vos déclarations, enregistrements et certifications.',
            'login.manager.registerAppTitle': "Page d'accueil OpenCRVS",
            'login.mobileLabel': 'Numéro de téléphone mobile',
            'login.mobilePlaceholder': '7123456789',
            'login.optionalLabel': 'Optionel',
            'login.passwordLabel': 'Mot de passe',
            'login.resend':
              'Renvoyer le {notificationMethod, select, sms {SMS} email {Email} other {}}',
            'login.resentEMAIL':
              'Nous venons de vous envoyer un autre code à {email}.',
            'login.resentSMS':
              'Nous venons de vous envoyer un autre code à {number}.',
            'login.stepOneInstruction':
              "Veuillez entrer votre nom d'utilisateur et votre mot de passe.",
            'login.stepOneText': 'Connectez-vous à Farajaland CRVS',
            'login.stepTwoInstruction.email':
              "Un code d'authentification a été envoyé à {email}. Ce code sera valable 10 minutes",
            'login.stepTwoInstruction.sms':
              'Un code de vérification a été envoyé à votre téléphone. se terminant par {number}. Ce code sera valide pendant 5 minutes.',
            'login.stepTwoResendTitle': 'Envoi du code de vérification',
            'login.stepTwoTitle': 'Vérifier votre compte',
            'login.submissionError':
              "Désolé que le nom d'utilisateur et le mot de passe n'aient pas fonctionné.",
            'login.submit': 'Se connecter',
            'login.tooManyCodeAttemptError':
              'Trop de tentatives de saisie du code. Vous pouvez réessayer après une minute.',
            'login.tooManyLoginAttemptError':
              'Trop de tentatives de connexion. Vous pouvez réessayer après une minute.',
            'login.username': "Nom d'utilisateur",
            'login.verficationCodeLabel': 'Code de vérification (6 chiffres)',
            'login.verify': 'Vérifier',
            'misc.newPass.header': 'Choisissez un nouveau mot de passe',
            'misc.newPass.instruction':
              "Nous vous recommandons de créer un mot de passe unique, que vous n'utilisez pas pour un autre site Web ou une autre application. Remarque. Vous ne pouvez pas réutiliser votre ancien mot de passe une fois que vous l'avez modifié.",
            'password.cases': 'Contient des majuscules et des minuscules',
            'password.label.confirm': 'Confirmez le mot de passe',
            'password.label.new': 'Nouveau mot de passe',
            'password.match': 'Les mots de passe correspondent',
            'password.minLength': '{min} caractères minimum',
            'password.mismatch': 'Les mots de passe ne correspondent pas',
            'password.number': 'Au moins un chiffre',
            'password.validation.msg': 'Le mot de passe doit avoir ,',
            'reloadmodal.body':
              'Une nouvelle version de {app_name} est disponible. Veuillez effectuer la mise à jour pour continuer.',
            'reloadmodal.button.update': 'Mise à jour',
            'reloadmodal.title': 'Mise à jour disponible',
            'resend.sms':
              'Renvoyer un {notificationMethod, select, sms {SMS} email {Email} other {}}',
            'resetCredentials.emailAddressConfirmation.form.body.header':
              'Entrez votre adresse email',
            'resetCredentials.forgottenItem.form.body.header':
              "Qu'avez-vous oublié ?",
            'resetCredentials.forgottenItem.form.title':
              'Impossible de se connecter',
            'resetCredentials.form.title':
              "{forgottenItem, select, username {Demande de rappel de nom d'utilisateur} password {Réinitialisation du mot de passe} other {}}",
            'resetCredentials.label.field.answer': 'Réponse',
            'resetCredentials.label.field.verificationCode':
              'Code de vérification (6 chiffres)',
            'resetCredentials.option.password': 'Mon mot de passe',
            'resetCredentials.option.username': "Mon nom d'utilisateur",
            'resetCredentials.phoneNumberConfirmation.form.body.header':
              'Quel est votre numéro de téléphone ?',
            'resetCredentials.phoneNumberConfirmation.form.body.subheader':
              "C'est le numéro associé à votre compte.",
            'resetCredentials.recoveryCodeEntry.codeResent.form.body.header':
              'Envoi du code de vérification',
            'resetCredentials.recoveryCodeEntry.codeResent.form.body.subheader':
              'Nous venons de vous renvoyer un autre code à {number}.',
            'resetCredentials.recoveryCodeEntry.form.body.header':
              'Entrez le code de récupération à 6 chiffres',
            'resetCredentials.recoveryCodeEntry.form.body.subheader':
              "Le code de récupération a été envoyé à votre numéro de téléphone. Veuillez entrer le code. Vous ne l'avez pas reçu ?",
            'resetCredentials.recoveryCodeEntry.form.body.subheader.email':
              "Le code de récupération a été envoyé à votre adresse e-mail. Veuillez entrer le code. Vous ne l'avez pas reçu ?",
            'resetCredentials.securityQuestion.form.body.subheader':
              "Il s'agit d'une des questions de sécurité que vous choisissez lors de la création de votre compte",
            'resetCredentials.success.page.subtitle.email':
              "{forgottenItem, select, username {Vérifiez votre e-mail pour vous rappeler votre nom d'utilisateur.} password {Vous pouvez maintenant vous connecter avec votre nouveau mot de passe} other {}}",
            'resetCredentials.success.page.subtitle.phone':
              "{forgottenItem, select, username {Vérifiez votre téléphone pour vous rappeler votre nom d'utilisateur.} password {Vous pouvez maintenant vous connecter avec votre nouveau mot de passe} other {}}",
            'resetCredentials.success.page.title':
              "{forgottenItem, select, username {Rappel de l'identifiant envoyé} password {Réinitialisation du mot de passe réussie} other {}}",
            'userSetup.securityQuestions.birthTown':
              'Dans quelle ville êtes-vous né ?',
            'userSetup.securityQuestions.favoriteFood':
              'Quel est votre plat préféré ?',
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
            'userSetup.securityQuestions.motherName':
              'Quel est le nom de votre mère ?',
            'validations.emailAddressFormat':
              'Doit être une adresse e-mail valide',
            'validations.minLength': 'Doit comporter {min} caractères ou plus',
            'validations.mobileNumberFormat': '7123456789',
            'validations.mobilePhoneRegex': '0[0-9]{9,10}',
            'validations.numberRequired': 'Doit être un numéro',
            'validations.phoneNumberFormat':
              'Doit être un numéro de téléphone mobile valide. Commençant par 0. Par exemple, {example}',
            'validations.required': 'requis',
            'validations.requiredSymbol': ''
          }
        }
      ]
    })),
    config: os.login.config.handler(() => ({
      AUTH_API_URL: 'http://localhost:7070/auth/',
      CONFIG_API_URL: 'http://localhost:2021',
      COUNTRY: 'FAR',
      LANGUAGES: ['en', 'fr'],
      CLIENT_APP_URL: 'http://localhost:3000/',
      COUNTRY_CONFIG_URL: 'http://localhost:3040',
      SENTRY: ''
    }))
  },
  certificates: os.certificates.handler(() => ({})),
  users: os.users.handler(() => []),
  locations: os.locations.handler(() => []),
  trigger: os.trigger.handler(() => ({})),
  content: os.content.handler(() => ({}))
})

const handler = new RPCHandler(router, {
  plugins: [new CORSPlugin()]
})

const server = createServer(async (req, res) => {
  // Intercept res.end to modify the response
  const originalEnd = res.end.bind(res)

  res.end = function (chunk?: any, ...args: any[]) {
    if (chunk && typeof chunk === 'string') {
      try {
        const parsed = JSON.parse(chunk)
        // Remove the json wrapper if it exists
        if (parsed && typeof parsed === 'object' && 'json' in parsed) {
          chunk = JSON.stringify(parsed.json)
        }
      } catch (e) {
        // Not JSON, leave as is
      }
    }
    return originalEnd(chunk, ...args)
  } as any

  const result = await handler.handle(req, res, {
    context: { headers: req.headers }
  })

  if (!result.matched) {
    res.statusCode = 404
    res.end('No procedure matched')
  }
})

server.listen(3040, '127.0.0.1', () =>
  console.log('Listening on 127.0.0.1:3040')
)
