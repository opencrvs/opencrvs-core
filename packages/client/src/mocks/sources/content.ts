const content = {
  languages: [
    {
      lang: 'en',
      displayName: 'English',
      messages: {
        'buttons.add': 'Add',
        'buttons.copy': 'Copy',
        'buttons.copied': 'Copied',
        'buttons.apply': 'Apply',
        'buttons.approve': 'Approve',
        'buttons.archive': 'Archive',
        'buttons.assign': 'Assign',
        'buttons.back': 'Back',
        'buttons.create': 'Create',
        'buttons.cancel': 'Cancel',
        'buttons.change': 'Change',
        'buttons.changeLanguage': 'Change language',
        'buttons.closeDeclaration': 'Close declaration',
        'buttons.configure': 'Configure',
        'buttons.confirm': 'Confirm',
        'buttons.continue': 'Continue',
        'buttons.delete': 'Delete',
        'buttons.deleteDeclaration': 'Delete declaration',
        'buttons.drafts': 'Drafts',
        'buttons.edit': 'Edit',
        'buttons.editRecord': 'No, make correction',
        'buttons.editRegistration': 'Edit registration',
        'buttons.exit': 'Exit',
        'buttons.finish': 'Finish',
        'buttons.forgotPassword': 'Forgot password',
        'buttons.forgottenPIN': 'Forgotten pin',
        'buttons.goToHomePage': 'Back to home',
        'buttons.homepage': 'Homepage',
        'buttons.login': 'Login',
        'buttons.logout': 'Logout',
        'buttons.makeCorrection': 'Make correction',
        'buttons.menu': 'Menu',
        'buttons.next': 'Next',
        'buttons.no': 'No',
        'buttons.preview': 'Preview',
        'buttons.print': 'Print',
        'buttons.issue': 'Issue',
        'buttons.printCertificate': 'Print certificate',
        'buttons.publish': 'Publish',
        'buttons.register': 'Register',
        'buttons.reinstate': 'Reinstate',
        'buttons.reject': 'Reject',
        'buttons.rejectDeclaration': 'Reject declaration',
        'buttons.replace': 'Change all',
        'buttons.retry': 'Retry',
        'buttons.review': 'Review',
        'buttons.save': 'Save',
        'buttons.saving': 'Saving...',
        'buttons.saveAndExit': 'Save & Exit',
        'buttons.saveDraft': 'Save as draft',
        'buttons.search': 'Search',
        'buttons.select': 'Select',
        'buttons.send': 'Confirm',
        'buttons.sendForApproval': 'Send for approval',
        'buttons.sendForReview': 'Send for review',
        'buttons.sendIncomplete': 'Send for review',
        'buttons.settings': 'Settings',
        'buttons.start': 'Start',
        'buttons.status': 'Status',
        'buttons.unassign': 'Unassign',
        'buttons.update': 'Update',
        'buttons.upload': 'Upload',
        'buttons.verify': 'Verify',
        'buttons.refresh': 'Refresh',
        'buttons.view': 'View',
        'buttons.yes': 'Yes',
        'buttons.exactDateUnknown': 'Exact date unknown',
        'buttons.sendForUpdates': 'Send for updates',
        'certificate.confirmCorrect':
          'Please confirm that the informant has reviewed that the information on the certificate is correct and that you are ready to print.',
        'certificate.isCertificateCorrect':
          'Is the {event} certificate correct?',
        'certificate.label.birth': 'Birth',
        'certificate.label.death': 'Death',
        'certificate.label.dob': 'D.o.B',
        'certificate.label.dod': 'D.o.D',
        'certificate.parent.details.label.dateOfBirth': 'Date of Birth',
        'certificate.parent.details.label.familyName': 'Last name',
        'certificate.parent.details.label.familyNameInEng': 'Last name',
        'certificate.parent.details.label.firstName': 'First name(s)',
        'certificate.parent.details.label.firstNameInEng': 'First name(s)',
        'certificate.parent.details.label.nationality': 'Nationality',
        'certificate.parent.details.label.number': 'Number',
        'certificate.parent.details.label.typeOfID': 'Type of ID',
        'certificate.receipt.amount': 'Amount paid:',
        'certificate.receipt.amountDue': 'Fee',
        'certificate.receipt.birthService.after':
          'Birth registration after {target} days of date of birth',
        'certificate.receipt.birthService.before':
          'Birth registration before {target} days of date of birth',
        'certificate.receipt.birthService.between':
          'Birth registration between {target} days and {latetarget} days of date of birth',
        'certificate.receipt.deathService.after':
          'Death registration after {target} days of date of death',
        'certificate.receipt.deathService.before':
          'Death registration before {target} days of date of death',
        'certificate.receipt.marriageService.after':
          'Marriage registration after {target} days of date of marriage',
        'certificate.receipt.marriageService.before':
          'Marriage registration before {target} days of date of marriage',
        'certificate.receipt.header': 'Receipt for {event} Certificate of',
        'certificate.receipt.issuedAt': 'Issued at:',
        'certificate.receipt.issuedBy': 'By:',
        'certificate.receipt.issuedDate': 'Date of payment:',
        'certificate.receipt.issuer':
          'By: {role}, {name}\n Date of payment: {dateOfPayment}',
        'certificate.receipt.service..5year.amount': '৳ 50.00',
        'certificate.receipt.service.5year':
          '{event} registration after 5 years of event',
        'certificate.receipt.service.targetDay.amount': '৳ 25.00',
        'certificate.receipt.service.targetDay':
          '{event} registration after 45 days of event',
        'certificate.receipt.service': 'Service',
        'certificate.receipt.subheader':
          '{event} Registration after {DOBDiff} of {DOE}',
        'changePhone.validation.msg':
          'Must be a valid 10 digit number that starts with 0',
        'changeEmail.validation.msg': 'Must be a valid email address',
        'config.application.applicationNameChangeNotification':
          'Name of application updated',
        'config.application.applicationNameLabel': 'Name of application',
        'config.application.birthDelayedDialogTitle':
          'Delayed registration time period for birth registration',
        'config.application.birthDelayedFeeChangeNotification':
          'Birth delayed fee updated',
        'config.application.birthLateFeeChangeNotification':
          'Birth late fee updated',
        'config.application.birthLateRegTargetChangeNotification':
          'Birth late registration target days updated',
        'config.application.birthLegallySpecifiedDialogTitle':
          'Legally specified time period for birth registration',
        'config.application.birthOnTimeFeeChangeNotification':
          'Birth on time fee updated',
        'config.application.birthRegTargetChangeNotification':
          'Birth registration target days updated',
        'config.application.birthTabTitle': 'Birth',
        'config.application.birthTabTitleExport': 'Births',
        'config.application.deathTabTitleExport': 'Deaths',
        'config.application.configChangeError':
          'Unable to make change. Please try again',
        'config.application.currencyChangeMessage':
          'Select your currency for your CRVS system',
        'config.application.updatingeMessage': 'Updating...',
        'config.application.currencyChangeNotification': 'Currency updated',
        'config.application.currencyLabel': 'Currency',
        'config.application.deathDelayedFeeChangeNotification':
          'Death delayed fee updated',
        'config.application.deathLegallySpecifiedDialogTitle':
          'Legally specified time period for death registration',
        'config.application.deathOnTimeFeeChangeNotification':
          'Death on time fee updated',
        'config.application.deathRegTargetChangeNotification':
          'Death registration target days updated',
        'config.application.deathTabTitle': 'Death',
        'config.application.marriageTabTitle': 'Marriage',
        'config.application.marriageLegallySpecifiedDialogTitle':
          'Legally specified time period for marriage registration',
        'config.application.marriageDelayedFeeChangeNotification':
          'Marriage delayed fee updated',
        'config.application.marriageOnTimeFeeChangeNotification':
          'Marriage on time fee updated',
        'config.application.marriageRegTargetChangeNotification':
          'Marriage registration target days updated',
        'config.application.delayedFeeDialogTitle':
          'Registration fees for delayed registrations',
        'config.application.delayedRegistrationLabel': 'Delayed registration',
        'config.application.delayedRegistrationValue': 'After {lateTime} days',
        'config.application.eventTargetInputLabel': 'days',
        'config.application.example': 'Example',
        'config.application.export': 'Export',
        'config.application.generalTabTitle': 'General',
        'config.application.govermentLogoLabel': 'Goverment logo',
        'config.application.govtLogoChangeError':
          'Unable to change logo. Please try again.',
        'config.application.govtLogoChangeMessage':
          'Upload a logo to be used on the login and declaration review screens',
        'config.application.govtLogoChangeNotification':
          'Government logo updated',
        'config.application.govtLogoFileLimitError':
          'Logo image file must be less than 2mb',
        'config.application.invalidExample': 'Invalid',
        'config.application.lateFeeDialogTitle':
          'Registration fees for late registrations',
        'config.application.lateRegistrationLabel': 'Late registration',
        'config.application.lateRegistrationValue':
          'Between {onTime} days and {lateTime} days',
        'config.application.legallySpecifiedLabel': 'Legally specified',
        'config.application.legallySpecifiedValue': 'Within {onTime} days',
        'config.application.nameChangeMessage':
          'Choose a name for your CRVS system',
        'config.application.nidPatternChangeError':
          'Invalid regular expression for a National ID',
        'config.application.nidPatternChangeMessage':
          'Set the regex pattern for your national ID. For guidance please refer to www.regex101.com',
        'config.application.nidPatternChangeNotification':
          'Unique Identification Number (UIN) regex pattern updated',
        'config.application.nidPatternTitle':
          'Unique Identification Number (UIN) e.g. National ID',
        'config.application.onTimeFeeDialogTitle':
          'Registration fees within legally specified time',
        'config.application.pattern': 'Pattern',
        'config.application.phoneNumberChangeError':
          'Invalid regular expression for a phone number',
        'config.application.phoneNumberChangeMessage':
          'Set the regex pattern for your country phone number. For guidance please refer to www.regex101.com',
        'config.application.phoneNumberChangeNotification':
          'Phone regex pattern updated',
        'config.informantNotification.title': 'Informant notifications',
        'config.informantNotification.subtitle':
          'Select the notifications to send to the informant to keep them informed of the progress to their declaration. Your system is configured to send {communicationType}.',
        'config.informantNotification.inProgressSMS':
          'Notification sent to Office',
        'config.informantNotification.declarationSMS':
          'Declaration sent for review',
        'config.informantNotification.registrationSMS':
          'Declaration registered',
        'config.informantNotification.rejectionSMS': 'Declaration rejected',
        'config.informantNotification.success':
          'Informant notifications updated',
        'config.userRoles.title': 'User roles',
        'config.userRoles.subtitle':
          'Map user roles to each system role so that specific permissions and privileges are correctly assigned. To learn more about the different system roles see ... {link}',
        'config.userRoles.systemRoles': 'SYSTEM ROLES',
        'config.userRoles.systemRoleSuccessMsg':
          'System role updated successfully',
        'config.userRoles.role': 'ROLE',
        'config.userRoles.roleUpdateInstruction':
          'Add the roles to be assigned the system role of {systemRole}',
        'config.application.phoneNumberExampleLabel': 'example: {example}',
        'config.application.phoneNumberLabel': 'Phone number',
        'config.application.phoneNumberPatternLabel': 'pattern: {pattern}',
        'config.application.phoneNumberPatternTitle': 'Phone number regex',
        'config.application.registrationFeesGroupTitle': 'Registration fees',
        'config.application.registrationTimePeriodsGroupTitle':
          'Registration time periods',
        'config.application.settings': 'Application',
        'config.advanced.search': 'Advanced Search',
        'config.advanced.search.instruction':
          'Select the options to build an advanced search. A minimum of two search parameters is required.',
        'config.application.testNumber': 'Test number',
        'config.application.validExample': 'Valid',
        'config.application.vitalStatistics':
          'Month-{month}-Farajaland-{event, select, birth{birth} death{death} other{birth}}-event-statistics.csv {fileSize}',
        'config.application.vsexport': 'Vital statistics',
        'config.application.emptystate':
          "The previous month's vital statistics data (based on vital event registrations occurring within that month) will become available for you to export as of the 1st of every month. Large CSV files cannot be opened in Excel and should therefore be opened in a statistical program such as {posit}.",
        'config.application.vsExportDownloadFailed':
          'Sorry! Something went wrong',
        'config.application.withinLegallySpecifiedTimeLabel':
          'Within legally specified time',
        'config.birthDefaultTempDesc': 'Default birth certificate template',
        'config.birthTemplate': 'Birth certificate',
        'config.birthUpdatedTempDesc': 'Updated {birthLongDate}',
        'config.deathUpdatedTempDesc': 'Updated {deathLongDate}',
        'config.eventUpdatedTempDesc':
          'Updated {lastModified, date, ::dd MMMM yyyy}',
        'config.certificate.certificateUpdated':
          '{eventName} certificate has been updated',
        'config.certificate.certificateUploading':
          'Uploading and validating {eventName} certificate.',
        'config.certificate.certificateValidationError':
          'Unable to read SVG. Please check',
        'config.certificate.uploadCertificateDialogCancel': 'Cancel',
        'config.certificate.uploadCertificateDialogConfirm': 'Upload',
        'config.certificate.uploadCertificateDialogDescription':
          'This will replace the current certificate template. We recommend downloading the existing certificate template as a reference.',
        'config.certificate.uploadCertificateDialogTitle':
          'Upload new certificate?',
        'config.certificate.template': 'Template',
        'config.certificate.allowPrinting':
          'Allow printing in advanced of issuance',
        'config.certificate.options': 'Options',
        'config.certificate.printDescription':
          'Records printed off in advance of collections will be added to the ready to issue work-queue',
        'config.certificate.allowPrintingNotification':
          'Allow printing in advance of issuance updated',
        'config.certTemplate': 'Certificate Template',
        'config.certificateConfiguration': 'Certificate configuration',
        'config.deathDefaultTempDesc': 'Default death certificate template',
        'config.deathTemplate': 'Death certificate',
        'config.marriageDefaultTempDesc':
          'Default marriage certificate template',
        'config.marriageTemplate': 'Marriage certificate',
        'config.downloadTemplate': 'Download',
        'config.integrations': 'Integrations',
        'config.listDetails':
          'To learn how to edit an SVG and upload a certificate to suite your country requirements please refer to this detailed guide. ',
        'config.listDetailsQsn': 'How to configure a certificate?',
        'config.listTitle': 'Certification',
        'config.previewTemplate': 'Preview',
        'config.printTemplate': 'Print',
        'config.uploadTemplate': 'Upload',
        'config.application.backgroundImageError':
          'Unable to change image. Please try again.',
        'config.application.loginBackgroundLabel': 'Login Background',
        'config.application.loginImageText':
          'Upload an image and set how you would like it to display in the background',
        'config.application.imageTabTitle': 'Image',
        'config.application.colourTabTitle': 'Colour',
        'config.application.colourTabText': 'Hex code',
        'config.application.backgroundImageChangeNotification':
          'Background image updated',
        'config.application.backgroundImageFileLimitError':
          'Background image file must be less than 2mb',
        'conflicts.modal.assign.description':
          'Please note you will have sole access to this record. Please make any updates promptly otherwise unassign the record.',
        'conflicts.modal.assign.title': 'Assign record?',
        'conflicts.modal.assigned.description':
          '{name} at {officeName} has sole editable access to this record',
        'conflicts.modal.assigned.title': 'Assigned record',
        'conflicts.modal.regUnassign.description':
          '{name} at {officeName} currently has sole editable access to this record. Unassigning this record will mean their current edits will be lost. Please confirm you wish to continue.',
        'conflicts.modal.selfUnassign.description':
          'Unassigning this record will mean that any current edits will be lost. Please confirm you wish to continue.',
        'conflicts.modal.unassign.title': 'Unassign record?',
        'constants.notificationSent': 'Notification sent',
        'constants.refresh': 'refresh',
        'constants.marriage': 'Marriage',
        'constants.marriages': 'Marriages',
        'constants.duplicateOf': 'Duplicate of',
        'constants.matchedTo': 'Matched to',
        'constants.sentForReview': 'Sent for review',
        'constants.sentForValidation': 'Sent for validation',
        'constants.sentForUpdates': 'Sent for updates',
        'constants.sentForApproval': 'Sent for approval',
        'constants.event': 'Event',
        'constants.address': 'Address',
        'constants.ageVerificationApiUser': 'Age verification API service',
        'constants.allEvents': 'All events',
        'constants.allStatuses': 'All statuses',
        'constants.apiUser': 'API User',
        'constants.applicationArchivedOn': 'Application archived on',
        'constants.applicationName': 'OpenCRVS',
        'constants.archived_declaration': 'Archived',
        'constants.averageRateOfRegistrations': 'Avg. {amount}%',
        'constants.birth': 'Birth',
        'constants.births': 'Births',
        'constants.by': 'By',
        'constants.label.action': 'Action',
        'constants.label.date': 'Date',
        'constants.certificationPaymentTitle':
          'Payment collected for {event, select, birth{birth} death{death} other{birth}} certificates',
        'constants.certified': 'certified',
        'constants.cha': 'CHA',
        'constants.chairman': 'Chairman',
        'constants.collected': 'Collected',
        'constants.collectedBy': 'Collected by',
        'constants.comment': 'Comment',
        'constants.certificate.title': 'Certificate',
        'constants.application.title': 'Application',
        'constants.form.title': 'Declaration forms',
        'constants.config': 'Configuration',
        'constants.countryName': 'Farajaland',
        'constants.customTimePeriod': 'Custom time period',
        'constants.dataEntryClerk': 'Data entry clerk',
        'constants.dateOfDeclaration': 'Date of declaration',
        'constants.daughter': 'Daughter',
        'constants.death': 'Death',
        'constants.deaths': 'Deaths',
        'constants.declaration': 'declaration',
        'constants.declarationCollectedOn': 'Certificate collected on',
        'constants.declarationFailedOn': 'Failed to send on',
        'constants.declarationRegisteredOn': 'Registered on',
        'constants.declarationRejectedOn': 'Declaration rejected on',
        'constants.declarationRequestedCorrectionOn':
          'Declaration requested correction on',
        'constants.declarations': 'Declarations',
        'constants.declarationsCount': 'Declarations ({totalItems})',
        'constants.declarationSentForExternalValidationOn':
          'Declaration sent for external validation on',
        'constants.declarationStarted': 'Started',
        'constants.declarationStartedBy': 'Started by',
        'constants.declarationStartedOn': 'Started on',
        'constants.declarationState': 'Declaration {action} on',
        'constants.declarationSubmittedOn': 'Declaration submitted on',
        'constants.declarationUpdatedOn': 'Updated on',
        'constants.declarationValidatedOn': 'Declaration reviewed on',
        'constants.declrationArchivedOn': 'Application archived on',
        'constants.districtRegistrar': 'District Registrar',
        'constants.dnrpc': 'DNRPC',
        'constants.healthcareWorker': 'Healthcare Worker',
        'constants.policeOfficer': 'Police Officer',
        'constants.socialWorker': 'Social Worker',
        'constants.localLeader': 'Local Leader',
        'constants.dob': 'D.o.B.',
        'constants.dod': 'D.o.D.',
        'constants.downloaded': 'Downloaded',
        'constants.downloading': 'Downloading...',
        'constants.entrepeneur': 'Entrepeneur',
        'constants.estimatedNumberOfEvents':
          'Estimated{lineBreak}no. of {eventType, select, birth {birth} death {death} other {birth}}s',
        'constants.estimatedNumberOfRegistartion':
          'Estimated no. of registrations',
        'constants.estimatedTargetDaysRegistrationTitle':
          'Estimated vs total registered in {registrationTargetDays} days',
        'constants.eventDate': 'Date of event',
        'constants.eventType': 'Event',
        'constants.registeredAt': 'Registered at',
        'constants.registeredBy': 'Registered by',
        'constants.export': 'Export',
        'constants.extendedFamily': 'Extended family',
        'constants.failedToSend': 'Failed to send',
        'constants.father': 'Father',
        'constants.female': 'Female',
        'constants.femaleOver18': 'Female Over 18',
        'constants.femaleUnder18': 'Female Under 18',
        'constants.fieldAgent': 'Field Agent',
        'constants.from': 'From',
        'constants.gender': 'Gender',
        'constants.healthDivision': 'Health Division',
        'constants.history': 'History',
        'constants.id': 'ID',
        'constants.informant': 'Informant',
        'constants.informantContactNumber': 'Informant contact number',
        'constants.issuedBy': 'Issued by',
        'constants.language': 'Language',
        'constants.last12Months': 'Last 12 months',
        'constants.last30Days': 'Last 30 days',
        'constants.lastEdited': 'Last edited',
        'constants.lastUpdated': 'Last update',
        'constants.loadMore': 'Load more',
        'constants.localRegistrar': 'Registrar',
        'constants.localSystemAdmin': 'Local System Admin',
        'constants.location': 'Location',
        'constants.login': 'Login',
        'constants.male': 'Male',
        'constants.maleOver18': 'Male Over 18',
        'constants.maleUnder18': 'Male Under 18',
        'constants.mayor': 'Mayor',
        'constants.month': 'Month',
        'constants.mother': 'Mother',
        'constants.name': 'Name',
        'constants.nationalRegistrar': 'National Registrar',
        'constants.nationalSystemAdmin': 'National System Admin',
        'constants.noNameProvided': 'No name provided',
        'constants.noResults': 'No result',
        'constants.noResultsOutbox': 'No records require processing',
        'constants.notificationApiUser': 'Notification API role',
        'constants.orgDivision': 'ORG Division',
        'constants.over5Years': 'Over 5 years',
        'constants.password': 'Password',
        'constants.pendingConnection': 'Pending connection',
        'constants.percentageOfEstimation': 'Percentage of estimate',
        'constants.performance': 'Performance',
        'constants.performanceManagement': 'Performance Manager',
        'constants.phoneNumber': 'Phone number',
        'constants.emailAddress': 'Email Address',
        'constants.user.role': 'Role',
        'constants.user.systemRole': 'System Role',
        'constants.PIN': 'PIN',
        'constants.rateOfRegistrationWithinTargetd':
          'Rate within {registrationTargetDays}{lineBreak}days of event',
        'constants.rateOfRegistrationWithinYears':
          'Rate within {num} {num, plural, =0 {year} =1 {year} other {years}} of event',
        'constants.reason': 'Reason',
        'constants.record': 'Record',
        'constants.registrationNumber': 'Reg no.',
        'constants.issueCertificate': 'Issue Certificate',
        'constants.collectorDetails': 'Collector Details',
        'constants.issueToMother': 'Issue to informant (Mother)',
        'constants.issueToFather': 'Issue to informant (Father)',
        'constants.issueToGroom': 'Issue to informant (Groom)',
        'constants.issueToBride': 'Issue to informant (Bride)',
        'constants.issueToSomeoneElse': 'Issue to someone else',
        'constants.issueToInformant': 'Issue to informant',
        'constants.issueConfirmationMessage':
          'Please confirm that the certificate has been issued to the informant or collector.',
        'constants.idCheckWithoutVerify': 'Continue without proof of ID?',
        'constants.requestReason': 'Reason for request',
        'constants.registered': 'Registered',
        'constants.inReview.status': 'In review',
        'constants.incomplete.status': 'Incomplete ',
        'constants.requiresUpdates.status': 'Requires updates',
        'constants.registered.status': 'Registered',
        'constants.registeredInTargetd':
          'Registered in {registrationTargetDays} days',
        'constants.registeredWithinTargetd':
          'Registered within{lineBreak}{registrationTargetDays} days of event',
        'constants.registrationAgent': 'Registration Agent',
        'constants.rejected': 'rejected',
        'constants.rejectedDays': 'Rejected {text}',
        'constants.relationship': 'Relationship',
        'constants.requestedCorrection': 'requested correction',
        'constants.review': 'Review',
        'constants.role': 'Role',
        'constants.systemrole': 'System Role',
        'constants.search': 'Search',
        'constants.secretary': 'Secretary',
        'constants.sending': 'Sending...',
        'constants.sent_incomplete': 'Sent incomplete',
        'constants.sentForUpdatesOn': 'Sent for updates on',
        'constants.sentOn': 'Sent on',
        'constants.showMore': 'Show next {pageSize}',
        'constants.son': 'Son',
        'constants.spouse': 'Spouse',
        'constants.startedAt': 'Started',
        'constants.startedBy': 'Started by',
        'constants.stateRegistrar': 'State Registrar',
        'constants.status': 'Status',
        'constants.submissionStatus': 'Submission status',
        'constants.submitted': 'submitted',
        'constants.draft': 'Draft',
        'constants.timeFramesTitle':
          '{event, select, birth{Birth} death{Death} other{Birth}} registered by time period, from date of occurrence',
        'constants.timeInProgress': 'Time in progress',
        'constants.timePeriod': 'Time period',
        'constants.timeReadyForReview': 'Time in ready for review',
        'constants.timeReadyToPrint': 'Time in ready to print',
        'constants.timeRequireUpdates': 'Time in require updates',
        'constants.timeWaitingExternalValidation':
          'Time in external validation',
        'constants.timeWatingApproval': 'Time in waiting for approval',
        'constants.to': 'to',
        'constants.toCapitalized': 'To',
        'constants.total': 'Total',
        'constants.totalRegistered': 'Total{lineBreak}registered',
        'constants.totalRegisteredInTargetDays':
          'Total registered in {registrationTargetDays} days',
        'constants.trackingId': 'Tracking ID',
        'constants.type': 'Type',
        'constants.update': 'Update',
        'constants.updated_declaration': 'Updated declaration',
        'constants.updated': 'Updated',
        'constants.user': 'User',
        'constants.username': 'Username',
        'constants.validated': 'validated',
        'constants.validatorApiUser': 'Validator API role',
        'constants.viewAll': 'View all',
        'constants.waitingToSend': 'Waiting to send',
        'constants.waitingValidated': 'Waiting for validation',
        'constants.waitingValidation': 'Sent for validation',
        'constants.week': 'Week',
        'constants.within1YearTo5Years': '1 year - 5 years',
        'constants.withinTargetDays': 'Within {registrationTargetDays} days',
        'constants.withinTargetDaysTo1Year':
          '{registrationTargetDays} days - 1 year',
        'constants.requireUpdatesLoading': 'Checking your declarations',
        'constants.integrations': 'Integrations',
        'constants.assignRecord': 'Assign record',
        'correction.certificate.corrector.idCheck': 'Check proof of ID',
        'constants.noConnection': 'No connection',
        'constants.totalFileSizeExceed':
          'Total size of documents exceeds {fileSize}. Please reduce file size of your uploads',
        'constants.skipToMainContent': 'Skip to main content',
        'verifyCertificate.loading': 'Verifying certificate',
        'verifyCertificate.timeOut': 'You been timed out',
        'verifyCertificate.successTitle': 'Valid QR code',
        'verifyCertificate.successMessage':
          'Compare the partial details of the record below against those against those recorded on the certificate',
        'verifyCertificate.errorTitle': 'Invalid QR code',
        'verifyCertificate.errorMessage':
          'The certificate is a potential forgery please...',
        'verifyCertificate.successUrl': 'URL Verification',
        'verifyCertificate.fullname': 'Full name',
        'verifyCertificate.dateOfBirth': 'Date of birth',
        'verifyCertificate.dateOfDeath': 'Date of death',
        'verifyCertificate.sex': 'Sex',
        'verifyCertificate.placeOfBirth': 'Place of birth',
        'verifyCertificate.placeOfDeath': 'Place of death',
        'verifyCertificate.registrationCenter': 'Registration Center',
        'verifyCertificate.registar': 'Name of registar',
        'verifyCertificate.createdAt': 'Date of certification',
        'verifyCertificate.brn': 'BRN',
        'verifyCertificate.drn': 'DRN',
        'verifyCertificate.toastMessage':
          'After verifying the certificate, please close the browser window',
        'verifyCertificate.sexFemale': 'Female',
        'verifyCertificate.sexMale': 'Male',
        'correction.certificate.corrector.idCheckVerify': 'ID verified',
        'correction.certificate.corrector.idCheckWithoutVerify': 'No ID match',
        'correction.certificate.corrector.otherIdCheck': 'Check proof of ID',
        'correction.corrector.anotherAgent':
          'Another registration agent or field agent',
        'correction.corrector.birth.note':
          'Note: In the case that the child is now of legal age (18) then only they should be able to request a change to thier birth record.',
        'correction.corrector.child': 'Child',
        'correction.corrector.court': 'Court',
        'correction.corrector.error':
          'Please select who is requesting a change to the record',
        'correction.corrector.father': 'Father',
        'correction.corrector.idCheck': 'Check proof of ID',
        'correction.corrector.idCheckVerify': 'Yes',
        'correction.corrector.idCheckWithoutVerify': 'No',
        'correction.corrector.informant': 'Informant',
        'correction.corrector.legalGuardian': 'Legal guardian',
        'correction.corrector.me': 'Me',
        'correction.corrector.mother': 'Mother',
        'correction.corrector.otherIdCheck': 'Check proof of ID',
        'correction.corrector.others': 'Someone else',
        'correction.corrector.title': 'Correction requester',
        'correction.corrector.description':
          'Please be aware that if you proceed, you will be responsible for making a change to this record without the necessary proof of identification',
        'correction.corrector.bride': 'Bride',
        'correction.corrector.groom': 'Groom',
        'correction.informant.error': 'Please select who is the informant',
        'correction.name': 'Correction',
        'correction.reason.additionalComment': 'Comments',
        'correction.reason.clericalError':
          'Myself or an agent made a mistake (Clerical error)',
        'correction.reason.error': 'Reason for change',
        'correction.reason.judicialOrder':
          'Requested to do so by the court (Judicial order)',
        'correction.reason.materialError':
          'Informant provided incorrect information (Material error)',
        'correction.reason.materialOmission':
          'Informant did not provide this information (Material omission)',
        'correction.reason.reasonForChange': 'Reason for correction',
        'correction.reason.title': 'Reason for correction',
        'correction.request': 'Requested correction',
        'correction.summary.addComments': 'Add Comments',
        'correction.summary.comments': 'Comments',
        'correction.summary.correction': 'Correction',
        'correction.summary.feesRequired': 'Fees required?',
        'correction.summary.feesRequiredPositive': 'Yes',
        'correction.summary.feesRequiredNegative': 'No',
        'correction.summary.idCheck': 'ID check',
        'correction.summary.item': 'Item',
        'correction.summary.original': 'Original',
        'correction.summary.proofOfPayment': 'Proof of payment',
        'correction.summary.required': 'Required for correction',
        'correction.summary.proofOfPaymentRequired':
          'Proof of payment is required',
        'correction.summary.totalPaymentLabel': 'Total {currency}',
        'correction.summary.reasonForRequest': 'Reason for request',
        'correction.summary.requestedBy': 'Requested by',
        'correction.summary.supportingDocuments': 'Supporting documents',
        'correction.summary.title': 'Correction summary',
        'correction.summary.idCheckForCorrection':
          'Correct without proof of ID?',
        'correction.supportingDocuments.attestToSeeCorrectionDocument':
          'I attest to seeing supporting documentation and have a copy filed at my office',
        'correction.supportingDocuments.docTypeAffidavitProof': 'Affidavit',
        'correction.supportingDocuments.docTypeCourtDocument': 'Court Document',
        'correction.supportingDocuments.docTypeOther': 'Other',
        'correction.supportingDocuments.noDocumentsRequiredForCorrection':
          'No supporting documents required',
        'correction.supportingDocuments.proofOfLegalDocuments':
          'Proof of legal correction documents',
        'correction.supportingDocuments.select.placeholder': 'Select',
        'correction.supportingDocuments.subtitle':
          'For all record corrections at a minimum an affidavit must be provided. For material errors and omissions eg. in paternity cases, a court order must also be provided.',
        'correction.supportingDocuments.supportDocumentForCorrection':
          'Check supporting document',
        'correction.supportingDocuments.title': 'Upload supporting documents',
        'correction.title': 'Correct record',
        'countries.ABW': 'Aruba',
        'countries.AFG': 'Afghanistan',
        'countries.AGO': 'Angola',
        'countries.AIA': 'Anguilla',
        'countries.ALA': 'Åland Islands',
        'countries.ALB': 'Albania',
        'countries.AND': 'Andorra',
        'countries.ARE': 'United Arab Emirates',
        'countries.ARG': 'Argentina',
        'countries.ARM': 'Armenia',
        'countries.ASM': 'American Samoa',
        'countries.ATA': 'Antarctica',
        'countries.ATF': 'French Southern Territories',
        'countries.ATG': 'Antigua and Barbuda',
        'countries.AUS': 'Australia',
        'countries.AUT': 'Austria',
        'countries.AZE': 'Azerbaijan',
        'countries.BDI': 'Burundi',
        'countries.BEL': 'Belgium',
        'countries.BEN': 'Benin',
        'countries.BES': 'Bonaire, Sint Eustatius and Saba',
        'countries.BFA': 'Burkina Faso',
        'countries.BGD': 'Bangladesh',
        'countries.BGR': 'Bulgaria',
        'countries.BHR': 'Bahrain',
        'countries.BHS': 'Bahamas',
        'countries.BIH': 'Bosnia and Herzegovina',
        'countries.BLM': 'Saint Barthélemy',
        'countries.BLR': 'Belarus',
        'countries.BLZ': 'Belize',
        'countries.BMU': 'Bermuda',
        'countries.BOL': 'Bolivia (Plurinational State of)',
        'countries.BRA': 'Brazil',
        'countries.BRB': 'Barbados',
        'countries.BRN': 'Brunei Darussalam',
        'countries.BTN': 'Bhutan',
        'countries.BVT': 'Bouvet Island',
        'countries.BWA': 'Botswana',
        'countries.CAF': 'Central African Republic',
        'countries.CAN': 'Canada',
        'countries.CCK': 'Cocos (Keeling) Islands',
        'countries.CHE': 'Switzerland',
        'countries.CHL': 'Chile',
        'countries.CHN': 'China',
        'countries.CIV': "Côte d'Ivoire",
        'countries.CMR': 'Cameroon',
        'countries.COD': 'Democratic Republic of the Congo',
        'countries.COG': 'Congo',
        'countries.COK': 'Cook Islands',
        'countries.COL': 'Colombia',
        'countries.COM': 'Comoros',
        'countries.CPV': 'Cabo Verde',
        'countries.CRI': 'Costa Rica',
        'countries.CUB': 'Cuba',
        'countries.CUW': 'Curaçao',
        'countries.CXR': 'Christmas Island',
        'countries.CYM': 'Cayman Islands',
        'countries.CYP': 'Cyprus',
        'countries.CZE': 'Czechia',
        'countries.DEU': 'Germany',
        'countries.DJI': 'Djibouti',
        'countries.DMA': 'Dominica',
        'countries.DNK': 'Denmark',
        'countries.DOM': 'Dominican Republic',
        'countries.DZA': 'Algeria',
        'countries.ECU': 'Ecuador',
        'countries.EGY': 'Egypt',
        'countries.ERI': 'Eritrea',
        'countries.ESH': 'Western Sahara',
        'countries.ESP': 'Spain',
        'countries.EST': 'Estonia',
        'countries.ETH': 'Ethiopia',
        'countries.FAR': 'Farajaland',
        'countries.FIN': 'Finland',
        'countries.FJI': 'Fiji',
        'countries.FLK': 'Falkland Islands (Malvinas)',
        'countries.FRA': 'France',
        'countries.FRO': 'Faroe Islands',
        'countries.FSM': 'Micronesia (Federated States of)',
        'countries.GAB': 'Gabon',
        'countries.GBR': 'United Kingdom of Great Britain and Northern Ireland',
        'countries.GEO': 'Georgia',
        'countries.GGY': 'Guernsey',
        'countries.GHA': 'Ghana',
        'countries.GIB': 'Gibraltar',
        'countries.GIN': 'Guinea',
        'countries.GLP': 'Guadeloupe',
        'countries.GMB': 'Gambia',
        'countries.GNB': 'Guinea-Bissau',
        'countries.GNQ': 'Equatorial Guinea',
        'countries.GRC': 'Greece',
        'countries.GRD': 'Grenada',
        'countries.GRL': 'Greenland',
        'countries.GTM': 'Guatemala',
        'countries.GUF': 'French Guiana',
        'countries.GUM': 'Guam',
        'countries.GUY': 'Guyana',
        'countries.HKG': '"China, Hong Kong Special Administrative Region"',
        'countries.HMD': 'Heard Island and McDonald Islands',
        'countries.HND': 'Honduras',
        'countries.HRV': 'Croatia',
        'countries.HTI': 'Haiti',
        'countries.HUN': 'Hungary',
        'countries.IDN': 'Indonesia',
        'countries.IMN': 'Isle of Man',
        'countries.IND': 'India',
        'countries.IOT': 'British Indian Ocean Territory',
        'countries.IRL': 'Ireland',
        'countries.IRN': 'Iran (Islamic Republic of)',
        'countries.IRQ': 'Iraq',
        'countries.ISL': 'Iceland',
        'countries.ISR': 'Israel',
        'countries.ITA': 'Italy',
        'countries.JAM': 'Jamaica',
        'countries.JEY': 'Jersey',
        'countries.JOR': 'Jordan',
        'countries.JPN': 'Japan',
        'countries.KAZ': 'Kazakhstan',
        'countries.KEN': 'Kenya',
        'countries.KGZ': "Lao People's Democratic Republic Republic",
        'countries.KHM': 'Cambodia',
        'countries.KIR': 'Kiribati',
        'countries.KNA': 'Saint Kitts and Nevis',
        'countries.KOR': 'Republic of Korea',
        'countries.KWT': 'Kuwait',
        'countries.LBN': 'Lebanon',
        'countries.LBR': 'Liberia',
        'countries.LBY': 'Libya',
        'countries.LCA': 'Saint Lucia',
        'countries.LIE': 'Liechtenstein',
        'countries.LKA': 'Sri Lanka',
        'countries.LSO': 'Lesotho',
        'countries.LTU': 'Lithuania',
        'countries.LUX': 'Luxembourg',
        'countries.LVA': 'Latvia',
        'countries.MAC': '"China, Macao Special Administrative Region"',
        'countries.MAF': 'Saint Martin (French Part)',
        'countries.MAR': 'Morocco',
        'countries.MCO': 'Monaco',
        'countries.MDA': 'Republic of Moldova',
        'countries.MDG': 'Madagascar',
        'countries.MDV': 'Maldives',
        'countries.MEX': 'Mexico',
        'countries.MHL': 'Marshall Islands',
        'countries.MKD': 'The former Yugoslav Republic of Macedonia',
        'countries.MLI': 'Mali',
        'countries.MLT': 'Malta',
        'countries.MMR': 'Myanmar',
        'countries.MNE': 'Montenegro',
        'countries.MNG': 'Mongolia',
        'countries.MNP': 'Northern Mariana Islands',
        'countries.MOZ': 'Mozambique',
        'countries.MRT': 'Mauritania',
        'countries.MSR': 'Montserrat',
        'countries.MTQ': 'Martinique',
        'countries.MUS': 'Mauritius',
        'countries.MWI': 'Malawi',
        'countries.MYS': 'Malaysia',
        'countries.MYT': 'Mayotte',
        'countries.NAM': 'Namibia',
        'countries.NCL': 'New Caledonia',
        'countries.NER': 'Niger',
        'countries.NFK': 'Norfolk Island',
        'countries.NGA': 'Nigeria',
        'countries.NIC': 'Nicaragua',
        'countries.NIU': 'Niue',
        'countries.NLD': 'Netherlands',
        'countries.NOR': 'Norway',
        'countries.NPL': 'Nepal',
        'countries.NRU': 'Nauru',
        'countries.NZL': 'New Zealand',
        'countries.OMN': 'Oman',
        'countries.PAK': 'Pakistan',
        'countries.PAN': 'Panama',
        'countries.PCN': 'Pitcairn',
        'countries.PER': 'Peru',
        'countries.PHL': 'Philippines',
        'countries.PLW': 'Palau',
        'countries.PNG': 'Papua New Guinea',
        'countries.POL': 'Poland',
        'countries.PRI': 'Puerto Rico',
        'countries.PRK': "Democratic People's Republic of Korea",
        'countries.PRT': 'Portugal',
        'countries.PRY': 'Paraguay',
        'countries.PSE': 'State of Palestine',
        'countries.PYF': 'French Polynesia',
        'countries.QAT': 'Qatar',
        'countries.REU': 'Réunion',
        'countries.ROU': 'Romania',
        'countries.RUS': 'Russian Federation',
        'countries.RWA': 'Rwanda',
        'countries.SAU': 'Saudi Arabia',
        'countries.SDN': 'Sudan',
        'countries.SEN': 'Senegal',
        'countries.SGP': 'Singapore',
        'countries.SGS': 'South Georgia and the South Sandwich Islands',
        'countries.SHN': 'Saint Helena',
        'countries.SJM': 'Svalbard and Jan Mayen Islands',
        'countries.SLB': 'Solomon Islands',
        'countries.SLE': 'Sierra Leone',
        'countries.SLV': 'El Salvador',
        'countries.SMR': 'San Marino',
        'countries.SOM': 'Somalia',
        'countries.SPM': 'Saint Pierre and Miquelon',
        'countries.SRB': 'Serbia',
        'countries.SSD': 'South Sudan',
        'countries.STP': 'Sao Tome and Principe',
        'countries.SUR': 'Suriname',
        'countries.SVK': 'Slovakia',
        'countries.SVN': 'Slovenia',
        'countries.SWE': 'Sweden',
        'countries.SWZ': 'Eswatini',
        'countries.SXM': 'Sint Maarten (Dutch part)',
        'countries.SYC': 'Seychelles',
        'countries.SYR': 'Syrian Arab Republic',
        'countries.TCA': 'Turks and Caicos Islands',
        'countries.TCD': 'Chad',
        'countries.TGO': 'Togo',
        'countries.THA': 'Thailand',
        'countries.TJK': 'Tajikistan',
        'countries.TKL': 'Tokelau',
        'countries.TKM': 'Turkmenistan',
        'countries.TLS': 'Timor-Leste',
        'countries.TON': 'Tonga',
        'countries.TTO': 'Trinidad and Tobago',
        'countries.TUN': 'Tunisia',
        'countries.TUR': 'Turkey',
        'countries.TUV': 'Tuvalu',
        'countries.TZA': 'United Republic of Tanzania',
        'countries.UGA': 'Uganda',
        'countries.UKR': 'Ukraine',
        'countries.UMI': 'United States Minor Outlying Islands',
        'countries.URY': 'Uruguay',
        'countries.USA': 'United States of America',
        'countries.UZB': 'Uzbekistan',
        'countries.VAT': 'Holy See',
        'countries.VCT': 'Saint Vincent and the Grenadines',
        'countries.VEN': 'Venezuela (Bolivarian Republic of)',
        'countries.VGB': 'British Virgin Islands',
        'countries.VIR': 'United States Virgin Islands',
        'countries.VNM': 'Viet Nam',
        'countries.VUT': 'Vanuatu',
        'countries.WLF': 'Wallis and Futuna Islands',
        'countries.WSM': 'Samoa',
        'countries.YEM': 'Yemen',
        'countries.ZAF': 'South Africa',
        'countries.ZMB': 'Zambia',
        'countries.ZWE': 'Zimbabwe',
        'dashboard.noContent':
          'No content to show. Make sure the following variables are configured in the <strong>client-config.js</strong> provided by your country config package:<br /><ul><li><strong>LEADERBOARDS_DASHBOARD_URL</strong></li><li><strong>REGISTRATIONS_DASHBOARD_URL</strong></li><li><strong>STATISTICS_DASHBOARD_URL</strong></li></ul>',
        'dashboard.dashboardTitle': 'Dashboard',
        'dashboard.leaderboardTitle': 'Leaderboards',
        'dashboard.statisticTitle': 'Statistics',
        'custom.field.form.heading': 'Certificate handlebars',
        'custom.field.text.heading': 'Custom text input',
        'custom.field.textarea.heading': 'Custom textarea',
        'custom.field.number.heading': 'Custom number input',
        'custom.field.phone.heading': 'Custom phone number',
        'custom.field.form.hideField': 'Hide field',
        'custom.field.form.requiredField': 'Required for registration',
        'custom.field.form.conditionalFieldHeader': 'Conditional parameters',
        'custom.field.form.conditionalField': 'Conditional field',
        'custom.field.form.conditionalFieldDesc':
          'Select the field and the conditions on which this field should show',
        'custom.field.form.conditionalRegex': 'Value RegEx',
        'custom.field.form.label': 'Label',
        'custom.field.form.placeholder': 'Placeholder',
        'custom.field.form.description': 'Description',
        'custom.field.form.tooltip': 'Tooltip',
        'custom.field.form.errorMessage': 'Error message',
        'custom.field.form.maxLength': 'Max length',
        'custom.field.form.duplicateField':
          'Label already exists in this form section. Please create a unique label',
        'custom.field.form.unit': 'Unit',
        'custom.field.form.unitOptionG': 'Gram (G)',
        'custom.field.form.unitOptionKg': 'Kilogram (Kg)',
        'custom.field.form.unitOptionCm': 'Centimeter (Cm)',
        'custom.field.form.unitOptionM': 'Meter (M)',
        'custom.field.form.unitOptionEmpty': 'None',
        'custom.field.form.inputWidth': 'Input width',
        'config.form.settings.time': 'Time input',
        'config.form.tools.input.customSelectWithDynamicOptions':
          'Custom select with dynamic options',
        'duplicates.warning': 'Potential duplicate of record {trackingId}',
        'duplicates.review.header': 'Potential {event} duplicate review',
        'duplicates.content.title': 'Is {name} ({trackingId}) a duplicate?',
        'duplicates.content.subtitle':
          'This record was flagged as a potential duplicate of: {trackingIds}. Please review these by clicking on each tracking ID in the tab section to view a side-by-side comparison below, and confirm if this record is a duplicate',
        'duplicates.button.notDuplicate': 'Not a duplicate',
        'duplicates.button.markAsDuplicate': 'Mark as duplicate',
        'duplicates.content.notDuplicateConfirmationTitle':
          'Are you sure {name} ({trackingId}) is not duplicate?',
        'duplicates.content.markAsDuplicate': 'Mark {trackingId} as duplicate?',
        'duplicates.content.duplicateDropdownMessage': 'Duplicate of',
        'duplicates.content.markAsDuplicateReason':
          'Please describe your reason',
        'duplicates.compare.title':
          'Review {actualTrackingId} against {duplicateTrackingId}',
        'duplicates.compare.supportingDocuments': 'Supporting documents',
        'duplicates.content.header': 'Declaration details',
        'error.code': '401',
        'error.draftFailed':
          'This is some messaging on advicing the user on what to do... in the event of a failed declaration.',
        'error.occurred': 'An error occurred. Please try again.',
        'error.page.load.failed':
          "Sorry, we couldn't load the content for this page",
        'error.passwordSubmissionError': 'Sorry that password did not work',
        'error.required.password': 'New password is not valid',
        'error.search': 'An error occurred while searching',
        'error.somethingWentWrong': 'Something went wrong.',
        'error.title.unauthorized': 'Unauthorized!',
        'error.title': 'Oops!',
        'error.userListError': 'Failed to load users',
        'error.weAreTryingToFixThisError': 'This page could not be found',
        'fieldAgentHome.allUpdatesText':
          'Great job! You have updated all declarations',
        'fieldAgentHome.inProgressCount': 'In progress ({total})',
        'fieldAgentHome.queryError':
          'An error occurred while loading declarations',
        'fieldAgentHome.requireUpdatesCount': 'Require updates ({total})',
        'fieldAgentHome.requireUpdatesCountLoading':
          'Checking your declarations',
        'fieldAgentHome.sentForReviewCount': 'Sent for review ({total})',
        'fieldAgentHome.zeroUpdatesText': 'No declarations require updates',
        'form.field.label.addFile': 'Upload',
        'form.field.showLabel': 'Show',
        'form.field.hideLabel': 'Hide',
        'form.field.nidNotVerified': 'Authenticate',
        'form.field.nidVerified': 'Authenticated',
        'form.field.nidOffline':
          'National ID authentication is currently not available offline.',
        'form.field.nidNotVerifiedReviewSection': 'Unauthenticated',
        'form.field.label.updatingUser': 'Updating user',
        'form.field.label.uploadFile': 'Upload',
        'form.field.label.addressLine1RuralOption': 'Village',
        'form.field.label.addressLine2': 'Area / Ward / Mouja / Village',
        'form.field.label.addressLine2UrbanOption': 'Street',
        'form.field.label.addressLine3': 'Union / Municipality / Cantonment',
        'form.field.label.addressLine1UrbanOption': 'Residential Area',
        'form.field.label.cityUrbanOption': 'Town',
        'form.field.label.secondaryAddressSameAsOtherSecondary':
          "Is the secondary address the same as the mother's secondary address?",
        'form.field.label.app.phoneVerWarn':
          'Check with the informant that the mobile phone number you have entered is correct',
        'form.field.label.app.whoContDet.app': 'Informant',
        'form.field.label.app.whoContDet.both': 'Both Parents',
        'form.field.label.app.whoContDet.brother': 'Brother',
        'form.field.label.app.whoContDet.daughterInLaw': 'Daughter in law',
        'form.field.label.app.whoContDet.father': 'Father',
        'form.field.label.app.whoContDet.grandDaughter': 'Granddaughter',
        'form.field.label.app.whoContDet.grandFather': 'Grandfather',
        'form.field.label.app.whoContDet.grandMother': 'Grandmother',
        'form.field.label.app.whoContDet.grandSon': 'Grandson',
        'form.field.label.app.whoContDet.legalGuardian': 'Legal guardian',
        'form.field.label.app.whoContDet.mother': 'Mother',
        'form.field.label.app.certifyRecordTo.mother':
          'Print and issue to informant (Mother)',
        'form.field.label.app.certifyRecordTo.father':
          'Print and issue to informant (Father)',
        'form.field.label.app.whoContDet.other': 'Other',
        'form.field.label.app.whoContDet.sister': 'Sister',
        'form.field.label.app.whoContDet.sonInLaw': 'Son in law',
        'form.field.label.app.whoContDet.spouse': 'Spouse',
        'form.field.label.appCurrAddSameAsPerm':
          "Is informant's permanent address the same as their current address?",
        'form.field.label.assignedResponsibilityProof':
          'Proof of assigned responsibility',
        'form.field.label.attBirthOtherParaPers': 'Other paramedical personnel',
        'form.field.label.attendantAtBirth': 'Attendant at birth',
        'form.field.label.attendantAtBirthLayperson': 'Layperson',
        'form.field.label.attendantAtBirthMidwife': 'Midwife',
        'form.field.label.attendantAtBirthNone': 'None',
        'form.field.label.attendantAtBirthNurse': 'Nurse',
        'form.field.label.attendantAtBirthOther': 'Other',
        'form.field.label.physician': 'Physician',
        'form.field.label.deathDescription': 'Description',
        'form.field.label.layReported': 'Lay reported',
        'form.field.label.attendantAtBirthTraditionalBirthAttendant':
          'Traditional birth attendant',
        'form.field.label.birthLocation': 'Hospital / Clinic',
        'form.field.label.birthType': 'Type of birth',
        'form.field.label.birthTypeHigherMultipleDelivery':
          'Higher multiple delivery',
        'form.field.label.birthTypeQuadruplet': 'Quadruplet',
        'form.field.label.birthTypeSingle': 'Single',
        'form.field.label.birthTypeTriplet': 'Triplet',
        'form.field.label.birthTypeTwin': 'Twin',
        'form.field.label.caregiver.father': 'Father',
        'form.field.label.caregiver.informant':
          'Informant is the primary caregiver',
        'form.field.label.caregiver.legalGuardian': 'Legal Guardian',
        'form.field.label.caregiver.mother': 'Mother',
        'form.field.label.caregiver.other': 'Other caregiver',
        'form.field.label.caregiver.parents': 'Mother and father',
        'form.field.label.causeOfDeathProof': 'Proof of cause of death',
        'form.field.label.causeOfDeathMethod': 'Source of cause of death',
        'form.field.label.causeOfDeathEstablished':
          'Cause of death has been established',
        'form.field.label.certificatePrintInAdvance': 'Print in advance',
        'form.field.label.dateOfBirth': 'Date of birth',
        'form.field.label.childFamilyName': 'Last name',
        'form.field.label.childFirstNames': 'First name(s)',
        'form.field.label.sex': 'Sex',
        'form.field.label.sexFemale': 'Female',
        'form.field.label.sexMale': 'Male',
        'form.field.label.childSexOther': 'Other',
        'form.field.label.sexUnknown': 'Unknown',
        'form.field.label.confirm': 'Yes',
        'form.field.label.corrector.supportDocumentSubtitle':
          'For all record corrections at a minimum an affidavit must be provided. For material errors and omissions eg. in paternity cases, a court order must also be provided.',
        'form.field.label.country': 'Country',
        'form.field.label.secondaryAddress': 'Secondary address',
        'form.field.label.secondaryAddressSameAsPermanent':
          'Is her usual place of residence the same as her residential address?',
        'form.field.label.dateOfMarriage': 'Date of marriage',
        'form.field.label.deathAtFacility':
          'What hospital did the death occur at?',
        'form.field.label.deathAtOtherLocation':
          'What is the other address that the death occurred at?',
        'form.field.label.deathAtPrivateHome':
          'What is the address of the private home?',
        'form.field.label.deathDate':
          'Enter the date as: day, month, year e.g. 24 10 2020',
        'form.field.label.deathPlace': 'Place of Occurrence of Death',
        'form.field.label.placeOfDeath': 'Place of death',
        'form.field.label.placeOfDeathOther': 'Different Address',
        'form.field.label.placeOfDeathSameAsCurrent':
          'Current address of the deceased',
        'form.field.label.placeOfDeathSameAsPermanent':
          'Permanent address of the deceased',
        'form.field.label.placeOfDeathType': 'Type of Place',
        'form.field.label.nationality': 'Nationality',
        'form.field.label.deceasedCurAddSamePerm':
          "Is deceased's current address the same as their permanent address?",
        'form.field.label.deceasedDeathProof': 'Proof of death of deceased',
        'form.field.label.deceasedDoBProof':
          'Proof of date of birth of deceased',
        'form.field.label.deceasedDocumentParagraph':
          'The following documents are required',
        'form.field.label.deceasedFamilyName':
          'Last Name(s) in default character set other than English',
        'form.field.label.deceasedFathersFamilyNameEng': 'Last name',
        'form.field.label.deceasedFathersGivenNamesEng': 'First name(s)',
        'form.field.label.deceasedGivenNames':
          'First Name(s) in default character set other than English',
        'form.field.label.deceasedIDProof': "Proof of deceased's ID",
        'form.field.label.deceasedIdType': 'Existing ID',
        'form.field.label.deceasedMothersFamilyNameEng': 'Last name',
        'form.field.label.deceasedMothersGivenNamesEng': 'First name(s)',
        'form.field.label.deceasedPrimaryAddressProof':
          'Proof of Permanent Address of Deceased',
        'form.field.label.deceasedSexOther': 'Other',
        'form.field.label.deceasedSpousesFamilyNameEng': 'Last name',
        'form.field.label.deceasedSpousesGivenNamesEng': 'First name(s)',
        'form.field.label.declaration.certificateLanguage':
          'Which languages does the informant want the certificate issued in?',
        'form.field.label.declaration.certLang.other': 'Other',
        'form.field.label.declaration.comment.desc':
          "Use this section to add any comments or notes that might be relevant to the completion and certification of this declaration. This information won't be shared with the informants.",
        'form.field.label.declaration.commentsOrNotes': 'Comments or notes',
        'form.field.label.declaration.phone': 'Phone number',
        'form.field.label.declaration.whoIsPresent.both': 'Both Parents',
        'form.field.label.declaration.whoIsPresent.father': 'Father',
        'form.field.label.declaration.whoIsPresent.mother': 'Mother',
        'form.field.label.declaration.whoIsPresent.other': 'Other',
        'form.field.label.declaration.whoIsPresent': 'Informant type',
        'form.field.label.declaration.whoseContactDetails':
          'Main point of contact',
        'form.field.label.defaultLabel': 'Label goes here',
        'form.field.label.deliveryAddress': 'Address of place of delivery',
        'form.field.label.deliveryInstitution': 'Type or select institution',
        'form.field.label.deny': 'No',
        'form.field.label.district': 'District',
        'form.field.label.docTypeHospitalDeathCertificate':
          'Hospital certificate of death',
        'form.field.label.docTypebirthAttendant':
          'Proof of birth from birth attendant',
        'form.field.label.docTypeBirthCert': 'Birth certificate',
        'form.field.label.docTypeChildAgeProof': "Proof of child's age",
        'form.field.label.docTypeChildBirthProof': 'Notification of birth',
        'form.field.label.docTypeCopyOfBurialReceipt':
          'Certified copy of burial receipt',
        'form.field.label.docTypeCoronersReport': "Coroner's report",
        'form.field.label.docTypeDeathCertificate':
          'Attested certificate of death',
        'form.field.label.docTypeDoctorCertificate': 'Doctor certificate',
        'form.field.label.docTypeEPICard': 'EPI card',
        'form.field.label.docTypeEPIStaffCertificate': 'EPI staff certificate',
        'form.field.label.docTypeFuneralReceipt':
          'Certified copy of funeral receipt',
        'form.field.label.docTypeLetterOfDeath': 'Attested letter of death',
        'form.field.label.docTypeMedicalInstitution':
          'Proof of birth from medical institution',
        'form.field.label.docTypeNID': 'National ID',
        'form.field.label.docTypeOther': 'Other',
        'form.field.label.docTypePassport': 'Passport',
        'form.field.label.docTypePoliceCertificate':
          'Police certificate of death',
        'form.field.label.docTypePostMortemReport':
          'Certified post mortem report',
        'form.field.label.docTypeSC': 'School certificate',
        'form.field.label.docTypeSignedAffidavit': 'Signed affidavit',
        'form.field.label.docTypeTaxReceipt': 'Receipt of tax payment',
        'form.field.label.educationAttainmentISCED1': 'Primary',
        'form.field.label.educationAttainmentISCED2': 'Lower secondary',
        'form.field.label.educationAttainmentISCED3': 'Upper secondary',
        'form.field.label.educationAttainmentISCED4': 'Secondary',
        'form.field.label.educationAttainmentISCED5': 'Tertiary',
        'form.field.label.educationAttainmentISCED6': 'Second stage tertiary',
        'form.field.label.educationAttainmentNone': 'No schooling',
        'form.field.label.educationAttainmentNotStated': 'Not stated',
        'form.field.label.father.nationality': 'Nationality',
        'form.field.label.father.nationalityBangladesh': 'Bangladesh',
        'form.field.label.fatherFamilyName':
          'Last Name(s) in default character set other than English',
        'form.field.label.fatherFirstNames':
          'First Name(s) in default character set other than English',
        'form.field.label.fatherIsDeceased': 'Father has died',
        'form.field.label.fatherPrimaryAddress': 'Usual place of residence',
        'form.field.label.fatherPlaceOfBirth': 'What is his village of origin?',
        'form.field.label.fathersDetailsExist':
          "Father's details are not available",
        'form.field.label.mothersDetailsExist':
          "Mother's details are not available",
        'form.field.label.exactDateOfBirthUnknown':
          'Exact date of birth unknown',
        'form.field.label.fetchDeceasedDetails': 'VERIFY NATIONAL ID',
        'form.field.label.fetchFatherDetails': 'VERIFY NATIONAL ID',
        'form.field.label.fetchIdentifierModalErrorTitle': 'Invalid Id',
        'form.field.label.fetchIdentifierModalSuccessTitle': 'ID valid',
        'form.field.label.fetchIdentifierModalTitle': 'Checking',
        'form.field.label.fetchInformantDetails': 'VERIFY NATIONAL ID',
        'form.field.label.fetchMotherDetails': 'VERIFY NATIONAL ID',
        'form.field.label.fetchPersonByNIDModalErrorText':
          'National ID not found.  Please enter a valid National ID and date of birth.',
        'form.field.label.fetchPersonByNIDModalInfo': 'National ID',
        'form.field.label.fetchRegistrationModalErrorText':
          'No registration found for provided BRN',
        'form.field.label.fetchRegistrationModalInfo':
          'Birth Registration Number',
        'form.field.label.fileUploadError': '{type} supported image only',
        'form.field.label.fileSizeError': 'File size must be less than 2MB',
        'form.field.label.firstName': 'First name(s)',
        'form.field.label.firstNames': 'First name(s)',
        'form.field.label.firstNameEN': 'First name(s)',
        'form.field.label.healthInstitution': 'Health Institution',
        'form.field.label.placeOfDeathSameAsPrimary':
          "Deceased's usual place of residence",
        'form.field.label.hospital': 'Hospital',
        'form.field.label.iD': 'ID Number',
        'form.field.label.iDType': 'Type of ID',
        'form.field.label.iDTypeAlienNumber': 'Alien Number',
        'form.field.label.iDTypeBRN': 'Birth Registration Number',
        'form.field.label.iDTypeDrivingLicense': 'Drivers License',
        'form.field.label.iDTypeDRN': 'Death Registration Number',
        'form.field.label.iDTypeNationalID': 'National ID',
        'form.field.label.iDTypeNoID': 'No ID available',
        'form.field.label.iDTypeOther': 'Other',
        'form.field.label.iDTypeOtherLabel': 'Other type of ID',
        'form.field.label.iDTypePassport': 'Passport',
        'form.field.label.iDTypeRefugeeNumber': 'Refugee Number',
        'form.field.label.imageUpload.uploadedList': 'Uploaded:',
        'form.field.label.informant': 'Informant',
        'form.field.label.informantAthorityToApplyProof':
          "Proof of informant's authority to apply",
        'form.field.label.proofOfInformantsID': "Proof of informant's ID",
        'form.field.label.informantOtherRelationship': 'Other relation',
        'form.field.label.informantPrimaryAddress': 'Usual place of residence',
        'form.field.label.informantSecondaryAddress': 'Secondary Address',
        'form.field.label.informantRelation.contactPoint': 'Contact Point',
        'form.field.label.informantRelation.brother': 'Brother',
        'form.field.label.informantRelation.daughter': 'Daughter',
        'form.field.label.informantRelation.daughterInLaw': 'Daughter in law',
        'form.field.label.informantRelation.driver':
          'Driver or operator of the land or water vehicle or aircraft where the death occurred',
        'form.field.label.informantRelation.extendedFamily': 'Extended Family',
        'form.field.label.informantRelation.father': 'Father',
        'form.field.label.informantRelation.granddaughter': 'Granddaughter',
        'form.field.label.informantRelation.grandfather': 'Grandfather',
        'form.field.label.informantRelation.grandmother': 'Grandmother',
        'form.field.label.informantRelation.grandson': 'Grandson',
        'form.field.label.informantRelation.headInst':
          'Head of the institution where the death occurred',
        'form.field.label.informantRelation.legalGuardian': 'Legal guardian',
        'form.field.label.informantRelation.mother': 'Mother',
        'form.field.label.informantRelation.officer':
          'Officer-in-charge of the road or public space where the death occurred',
        'form.field.label.informantRelation.other': 'Other(Specify)',
        'form.field.label.informantRelation.others': 'Someone else',
        'form.field.label.informantRelation.owner':
          'Owner of the house or building where the death occurred',
        'form.field.label.informantRelation.sister': 'Sister',
        'form.field.label.informantRelation.son': 'Son',
        'form.field.label.informantRelation.sonInLaw': 'Son in law',
        'form.field.label.informantRelation.spouse': 'Spouse',
        'form.field.label.informantRelation.whoIsBirthInformant':
          'Who is informant',
        'form.field.label.informantRelation.whoIsDeathInformant':
          'Who is informant',
        'form.field.label.informants.nationality': 'Nationality',
        'form.field.label.informantsDateOfBirth': 'Date of Birth',
        'form.field.label.informantsFamilyName':
          'Last Name(s) in default character set other than English',
        'form.field.label.informantsFamilyNameEng': 'Last Name(s) in English',
        'form.field.label.informantsGivenNames':
          'First Name(s) in default character set other than English',
        'form.field.label.informantsGivenNamesEng': 'First Name(s) in English',
        'form.field.label.informantsIdType': 'Existing ID',
        'form.field.label.informantsRelationWithChild': 'Relationship to child',
        'form.field.label.informantsRelationWithDeceased':
          'Relationship to deceased',
        'form.field.label.internationalAddressLine1': 'Address Line 1',
        'form.field.label.internationalAddressLine2': 'Address Line 2',
        'form.field.label.internationalAddressLine3': 'Address Line 3',
        'form.field.label.internationalCity': 'City / Town',
        'form.field.label.internationalDistrict': 'District',
        'form.field.label.internationalPostcode': 'Postcode / Zip',
        'form.field.label.internationalState': 'State',
        'form.field.label.lastName': 'Last name',
        'form.field.label.lastNameEN': 'Last name',
        'form.field.label.otherBirthSupportingDocuments': 'Other',
        'form.field.label.legalGuardianProof': 'Proof of legal guardianship',
        'form.field.label.mannerOfDeath': 'Manner of death',
        'form.field.label.mannerOfDeathAccident': 'Accident',
        'form.field.label.mannerOfDeathHomicide': 'Homicide',
        'form.field.label.mannerOfDeathNatural': 'Natural causes',
        'form.field.label.mannerOfDeathSuicide': 'Suicide',
        'form.field.label.mannerOfDeathUndetermined': 'Manner undetermined',
        'form.field.label.maritalStatus': 'Marital status',
        'form.field.label.maritalStatusDivorced': 'Divorced',
        'form.field.label.maritalStatusMarried': 'Married',
        'form.field.label.maritalStatusNotStated': 'Not stated',
        'form.field.label.maritalStatusSeparated': 'Separated',
        'form.field.label.maritalStatusSingle': 'Single',
        'form.field.label.maritalStatusWidowed': 'Widowed',
        'form.field.label.medicallyCertified':
          'Medically Certified Cause of Death',
        'form.field.label.methodOfCauseOfDeath': 'Method of Cause of Death',
        'form.field.label.mother.nationality': 'Nationality',
        'form.field.label.mother.nationalityBangladesh': 'Bangladesh',
        'form.field.label.educationAttainment': 'Level of education',
        'form.field.label.motherFamilyName': 'Last name',
        'form.field.label.motherFirstNames': 'First name(s)',
        'form.field.label.motherIsDeceased': 'Mother has died',
        'form.field.label.motherPrimaryAddress': 'Usual place of residence',
        'form.field.label.motherPlaceOfBirth': 'What is her village of origin?',
        'form.field.label.motherPlaceOfHeritage':
          'What is her place of origin (heritage)?',
        'form.field.label.multipleBirth': 'No. of previous births',
        'form.field.label.name': 'Name',
        'form.field.label.NID': 'NID',
        'form.field.label.NIDNetErr':
          'The request to the NID system was unsuccessful. Please try again with a better connection.',
        'form.field.label.occupation': 'Occupation',
        'form.field.label.optionalLabel': 'Optional',
        'form.field.label.otherAddress': 'Other address',
        'form.field.label.otherInformantType': 'Other relation',
        'form.field.label.otherInstitution': 'Other',
        'form.field.label.otherOption': 'Other',
        'form.field.label.parentDetailsType':
          "Do you have the mother and father's details?",
        'form.field.label.deceasedPrimaryAddress': 'Usual place of residence',
        'form.field.label.deceasedSecondaryAddress': 'Secondary Address',
        'form.field.label.phoneNumber': 'Phone number',
        'form.field.label.email': 'Email',
        'form.field.label.registrationName': 'Registration Name',
        'form.field.label.informantTitle': "Informant's details",
        'form.field.label.placeOfBirth': 'Location',
        'form.field.label.placeOfBirthPreview': 'Place of delivery',
        'form.field.label.postCode': 'Number',
        'form.field.label.primaryAddress': 'Usual place of residence',
        'form.field.label.primaryAddressSameAsOtherPrimary':
          "Same as mother's usual place of residence?",
        'form.field.label.primaryAddressSameAsDeceasedsPrimary':
          "Same as deceased's usual place of residence?",
        'form.field.label.primaryCaregiverType':
          'Who is looking after the child?',
        'form.field.label.print.confirmMotherInformation':
          'Does their proof of ID document match the following details?',
        'form.field.label.print.documentNumber': 'Document number',
        'form.field.label.familyName': 'Last name',
        'form.field.label.print.otherPersonGivenNames': 'Given name',
        'form.field.label.print.otherPersonPrompt':
          'Because there are no details of this person on record, we need to capture their details:',
        'form.field.label.print.signedAffidavit':
          'Do they have a signed affidavit?',
        'form.field.label.print.warningNotVerified':
          'Please be aware that if you proceed you will be responsible for issuing a certificate without the necessary proof of ID from the collector.',
        'form.field.label.privateHome': 'Residential address',
        'form.field.label.proofOfBirth': 'Proof of birth',
        'form.field.label.proofOfDocCertificateOfChild':
          "Certificate from doctor to prove child's age OR School certificate",
        'form.field.label.proofOfEPICardOfChild': 'EPI Card of Child',
        'form.field.label.proofOfFathersID': "Proof of father's ID",
        'form.field.label.proofOfMothersID': "Proof of mother's ID",
        'form.field.label.proofOfParentPrimaryAddress':
          'Proof of Permanent Address of Parent',
        'form.field.label.radio.father': "Only the father's",
        'form.field.label.radio.mother': "Only the mother's",
        'form.field.label.reasonFatherNotApplying': 'Reason',
        'form.field.label.reasonFatherNotApplyingPreview': 'Reason',
        'form.field.label.reasonNotApplying': 'Reason',
        'form.field.label.reasonMotherNotApplyingPreview': 'Reason',
        'form.field.label.registrationOffice': 'Registration Office',
        'form.field.label.relationBrother': 'Brother',
        'form.field.label.relationGrandfather': 'Grandfather',
        'form.field.label.relationGrandmother': 'Grandmother',
        'form.field.label.relationHouseOwner':
          'Owner of the house or building where the birth occurred',
        'form.field.label.relationOfficeInCharge':
          'Officer-in-charge of the road or public space where the birth occurred',
        'form.field.label.relationOperator':
          'Driver or operator of the land or water vehicle or aircraft where the birth occurred',
        'form.field.label.relationOtherFamilyMember': 'Other family member',
        'form.field.label.relationship': 'Relationship',
        'form.field.label.relationshipPlaceHolder': 'eg. Grandmother',
        'form.field.label.relationSister': 'Sister',
        'form.field.label.relationSomeoneElse': 'Someone else',
        'form.field.label.relInstHeadPlaceOfBirth':
          'Head of the institution where the birth occurred',
        'form.field.label.resedentialAddress':
          'Residential address of the deceased',
        'form.field.label.secondaryAddressSameAsPrimary':
          'Is their secondary address the same as their primary address?',
        'form.field.label.deceasedSecondaryAddressSameAsPrimary':
          'Was their secondary address the same as their primary address?',
        'form.field.label.rural': 'Rural',
        'form.field.label.selectOne': 'Please select an option',
        'form.field.label.self': 'Self',
        'form.field.label.socialSecurityNumber': 'Social security no./NAPSA',
        'form.field.label.someoneElse': 'Someone else',
        'form.field.label.someoneElseCollector':
          'Print and issue to someone else',
        'form.field.label.state': 'Province',
        'form.field.label.typeOfDocument': 'Choose type of supporting document',
        'form.field.label.typeOfId': 'Type of ID',
        'form.field.label.uploadDocForChild': 'Child',
        'form.field.label.uploadDocForFather': 'Father',
        'form.field.label.uploadDocForMother': 'Mother',
        'form.field.label.uploadDocForOther': 'Other',
        'form.field.label.uploadDocForWhom':
          'Whose suppoting document are you uploading?',
        'form.field.label.urban': 'Urban',
        'form.field.label.userAttachmentSection': 'Signature',
        'form.field.label.creatingNewUser': 'Creating new user',
        'form.field.label.userDevice': 'Device',
        'form.field.label.userSignatureAttachment': "User's signature",
        'form.field.label.userSignatureAttachmentDesc':
          'Ask the user to sign a piece of paper and then scan or take a photo',
        'form.field.label.userSignatureAttachmentTitle': 'Upload signature',
        'form.field.label.verbalAutopsy': 'Verbal autopsy',
        'form.field.label.verbalAutopsyReport': 'Verbal autopsy report',
        'form.field.label.weightAtBirth': 'Weight at birth',
        'form.field.label.ageOfMother': 'Age of mother',
        'form.field.label.ageOfFather': 'Age of father',
        'form.field.label.ageOfInformant': 'Age of informant',
        'form.field.label.ageOfDeceased': 'Age of deceased',
        'form.field.label.whatDocToUpload':
          'Which document type are you uploading?',
        'form.field.previewGroups.primaryAddress': 'Usual place of residence',
        'form.field.previewGroups.secondaryAddress': 'Secondary address',
        'form.field.SearchField.changeButtonLabel':
          '{fieldName, select, registrationOffice {Change assigned office} other {Change health institute}}',
        'form.field.SearchField.modalTitle':
          '{fieldName, select, registrationOffice {Assigned registration office} other {Health institutions}}',
        'form.field.SearchField.officeLocationId': 'Id: {locationId}',
        'form.field.SearchField.placeHolderText': 'Search',
        'form.field.select.placeholder': 'Select',
        'form.field.tooltip.tooltipNationalID':
          'The National ID can only be numeric and must be 10 digits long',
        'form.group.reasonNotApplying.parents':
          'Why are the mother and father not applying?',
        'form.preview.group.label.english.name': 'Full name',
        'form.preview.group.label.father.english.name': 'Full name',
        'form.preview.group.label.informant.english.name': 'Full name',
        'form.preview.group.label.mother.english.name': 'Full name',
        'form.preview.group.label.spouse.english.name': 'Full name',
        'form.preview.tag.other.institution': 'Other institution address',
        'form.preview.tag.permanent.address': 'Usual place of residence',
        'form.preview.tag.placeOfHeritage': 'Place of heritage',
        'form.preview.tag.private.home': 'Private home address',
        'form.review.label.mainContact': 'Main contact',
        'form.section.accountDetails': 'Account details',
        'form.section.assignedRegistrationOffice':
          'Assign to a registration office',
        'form.section.assignedRegistrationOfficeGroupTitle':
          'Assigned registration office',
        'form.section.causeOfDeath.name': 'Cause of Death',
        'form.section.causeOfDeath.title':
          'What is the medically certified cause of death?',
        'form.section.causeOfDeathNotice':
          'A Medically Certified Cause of Death is not mandatory to submit the declaration. This can be added at a later date.',
        'form.section.child.name': 'Child',
        'form.section.child.title': "Child's details",
        'form.section.deathEvent.name': 'Death event details',
        'form.section.deathEvent.title': 'Event details',
        'form.section.deathEvent.date': 'Date of death',
        'form.section.deceased.father.name':
          "What is the deceased's father name?",
        'form.section.deceased.father.title': "Father's details",
        'form.section.deceased.hasSpouse': 'Yes',
        'form.section.deceased.mother.name':
          "What is the deceased's mother name?",
        'form.section.deceased.mother.title': "Mother's details",
        'form.section.deceased.name': 'Deceased',
        'form.section.deceased.relationship': 'Relationship to deceased',
        'form.section.deceased.noSpouse': 'No / Unknown',
        'form.section.deceased.spouse.name': 'Does the deceased have a spouse?',
        'form.section.deceased.spouse.title': "Spouse's details",
        'form.section.deceased.title': "Deceased's details",
        'form.section.declaration.name': 'Declaration',
        'form.section.information.name': 'Information',
        'form.section.information.birth.bullet1':
          'I am going to help you make a declaration of birth.',
        'form.section.information.birth.bullet2':
          'As the legal Informant it is important that all the information provided by you is accurate.',
        'form.section.information.birth.bullet3':
          'Once the declaration is processed you will receive you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
        'form.section.information.birth.bullet4':
          'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
        'form.section.information.death.bullet1':
          'I am going to help you make a declaration of death.',
        'form.section.information.death.bullet2':
          'As the legal Informant it is important that all the information provided by you is accurate.',
        'form.section.information.death.bullet3':
          'Once the declaration is processed you will receive you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
        'form.section.information.death.bullet4':
          'Make sure you collect the certificate. A death certificate is critical to support with inheritance claims and to resolve the affairs of the deceased e.g. closing bank accounts and setting loans.',
        'form.section.declaration.title': 'Declaration details',
        'form.section.documents.birth.requirements':
          'The following documents are required',
        'form.section.documents.list.attestedBirthRecord':
          'Attested copy of hospital document or birth record, or',
        'form.section.documents.list.attestedVaccination':
          'Attested copy of the vaccination (EPI) card, or',
        'form.section.documents.list.certification':
          'Certification regarding NGO worker authorized by registrar in favour of date of birth, or',
        'form.section.documents.list.informantAttestation':
          'Attestation of the informant, or',
        'form.section.documents.list.otherDocuments':
          'Attested copy(s) of the document as prescribed by the Registrar',
        'form.section.documents.name': 'Documents',
        'form.section.documents.paragraphAbove5Years':
          'For birth registration of births occurring after 5 years the following documents are required:',
        'form.section.documents.paragraphTargetdaysTo5Years':
          'For birth registration of births occurring within {BIRTH_REGISTRATION_TARGET} days and and 5 years old the following documents are required:',
        'form.section.documents.title': 'Upload supporting documents',
        'form.section.documents.uploadImage':
          'Upload a photo of the supporting document',
        'form.section.father.name': 'Father',
        'form.section.father.title': "Father's details",
        'form.section.informant.name': 'Informant',
        'form.section.informant.title': "Informant's details",
        'form.section.mother.name': 'Mother',
        'form.section.mother.title': "Mother's details",
        'form.section.primaryCaregiver.nameOrTitle': 'Parents details',
        'form.section.upload.documentsName': 'Documents Upload',
        'form.section.upload.documentsTitle': 'Upload supporting documents',
        'form.section.user.preview.title': 'Confirm details',
        'form.section.user.title': 'Create new user',
        'form.section.userDetails': 'User details',
        'home.header.helpTitle': 'Help',
        'home.header.localSystemAdmin': 'Local System Admin',
        'home.header.placeHolderBrnDrn': 'Search for a BRN/DRN',
        'home.header.placeholderName': 'Search for a name',
        'home.header.placeHolderPhone': 'Search for a phone no.',
        'home.header.placeHolderNationalId': 'Search for a national ID.',
        'home.header.placeHolderTrackingId': 'Search for a tracking ID',
        'home.header.settingsTitle': 'Settings',
        'home.header.systemTitle': 'System',
        'home.header.teamTitle': 'Team',
        'home.header.typeRN': 'Registration no.',
        'home.header.typeName': 'Name',
        'home.header.advancedSearch': 'Advanced Search',
        'home.header.typePhone': 'Phone no.',
        'home.header.nationalId': 'National ID',
        'imageUploadOption.upload.documentType':
          'Please select the type of document first',
        'imageUploadOption.upload.error':
          'File format not supported. Please upload a .png or .jpg (max 5mb)',
        'imageUploadOption.upload.imageFormat':
          'File format not supported. Please upload a .png or .jpg (max 5mb)',
        'imageUploadOption.upload.overSized':
          'File is too large. Please upload a file less than 5mb',
        'informant.name': 'Informant',
        'integrations.uniqueKeyDescription':
          'These unique keys will be required by the client integrating...',
        'informant.title': 'Informant type',
        'integrations.createClient': 'Create client',
        'integrations.eventNotificationDescription':
          'An event notification client (eg. hospital) can send a partial notification or a full declaration of a birth or death in the HL7 FHIR standard to OpenCRVS for processing. For more information, visit:',
        'integrations.integratingSystemTypeMosip': 'MOSIP',
        'integrations.integratingSystemTypeOsia': 'OSIA (Coming soon)',
        'integrations.integratingSystemTypeOther': 'Other',
        'integrations.integratingSystemType': 'System',
        'integrations.integratingSystemTypeAlertMosip':
          'When "MOSIP" National ID type is enabled, all forms require MOSIP E-Signet authentication. The MOSIP Token Seeder and OpenCRVS webhook compatible MOSIP Mediator must be installed. For more information, visit:',
        'integrations.integratingSystemTypeAlertOsia':
          'When "OSIA" National ID is enabled, birth use case compatible endpoints will be enabled. For more information, visit:',
        'integrations.integratingSystemTypeAlertOther':
          'When "Other" National ID is enabled, the default OpenCRVS National ID webhook mediator must be installed. For more information, visit:',
        'integrations.webhookDescription':
          'A Webhook client can subscribe to be notified upon a birth or death registration following W3C WebSub standards. For more information, visit:',
        'integrations.recordSearchDescription':
          'A Record search client can perform an advanced search on OpenCRVS data. For more information, visit:',
        'integrations.pageIntroduction':
          'For each new client that needs to integrate with OpenCRVS you can create unique client IDs. A number of integration use cases are currently supported, based on both API and webhook technologies.',
        'integrations.nationalidAlertDescription':
          'A National ID client (eg. MOSIP) can react to birth or death webhooks to create or invalidate NID numbers, and respond to OpenCRVS to provide a temporary ID to children, and link vital events to each other. For more information, visit:',
        'integrations.supportingDescription':
          'Supporting description to help user make a decision and navigate the content',
        'integrations.revealKeys': 'Reveal Keys',
        'integrations.disable': 'Disable',
        'integrations.enable': 'Enable',
        'integrations.delete': 'Delete',
        'integrations.copy': 'Copy',
        'integrations.name': 'Name',
        'integrations.nationalIDName': 'Name',
        'integrations.client.type': 'Type',
        'integrations.label': 'Label',
        'integrations.webhookPermissionsDescription':
          'Select the data you wish to be contained within the webhook payload',
        'integrations.webhook.PII': 'Include PII data',
        'integrations.birth': 'Birth',
        'integrations.death': 'Death',
        'integrations.type.eventNotification': 'Event notification',
        'integrations.type.nationalID': 'National ID',
        'integrations.childDetails': "Child's details",
        'integrations.motherDetails': "Mother's details",
        'integrations.documentDetails': 'Document details',
        'integrations.deathEventDetails': 'Death event details',
        'integrations.fatherDetails': "Father's details",
        'integrations.informantDetails': "Informant's details",
        'integrations.registrationDetailsnNoPII':
          'Registration Details (No PII)',
        'integrations.childDetailsNoPII': 'Childs Details (No PII)',
        'integrations.motherDetailsNoPII': 'Mothers Details (No PII)',
        'integrations.fatherDetailsNoPII': 'Fathers Details (No PII)',
        'integrations.informantDetailsNoPII': 'Informant Details (No PII)',
        'integrations.type.recordSearch': 'Record search',
        'integrations.type.webhook': 'Webhook',
        'integrations.otherAlertDescription': '...Please visit',
        'integrations.clientId': 'Client ID',
        'integrations.clientSecret': 'Client secret',
        'integrations.shaSecret': 'SHA secret',
        'integrations.active': 'Active',
        'integrations.inactive': 'Inactive',
        'integrations.loading': 'Loading',
        'integrations.error': 'Something went wrong',
        'integrations.activate.client': 'Activate client?',
        'integrations.activate.status': 'Client activated',
        'integrations.deactivate.status': 'Client deactivated',
        'integrations.deactivate.client': 'Deactivate client?',
        'integrations.activatetext': 'This will activate the client',
        'integrations.deactivatetext': 'This will deactivate the client',
        'integrations.pageTitle': 'Integrations',
        'navigation.integration': 'Integrations',
        'navigation.communications': 'Communications',
        'navigation.userroles': 'User roles',
        'navigation.informantNotification': 'Informant notifications',
        'integrations.type.healthSystem': 'Health integration',
        'integrations.newIntegrationDescription':
          'Add a unique name and select the type of client you would like to create',
        'integrations.onlyOneNationalId':
          'Only one National ID integration is allowed.',
        'integrations.activate': 'Activate',
        'integrations.deactivate': 'Deactivate',
        'integrations.updatePermissionsMsg': 'Permissions update successfully',
        'integrations.deceasedDetails': "Deceased's details",
        'integrations.deleteSystemText': 'This will delete the system',
        'integrations.deleteSystemMsg': 'System has been deleted successfully',
        'form.field.label.locationLevel3': 'Location Level 3',
        'form.field.label.locationLevel4': 'Location Level 4',
        'form.field.label.locationLevel5': 'Location Level 5',
        'form.field.label.informantRelation.groomAndBride': 'Groom & Bride',
        'form.field.label.informantRelation.groom': 'Groom',
        'form.field.label.informantRelation.bride': 'Bride',
        'form.section.groom.name': 'Groom',
        'form.section.groom.title': "Groom's details",
        'form.section.bride.name': 'Bride',
        'form.section.bride.title': "Bride's details",
        'form.section.groom.headOfGroomFamily': "Head of groom's family",
        'form.section.bride.headOfBrideFamily': "Head of bride's family",
        'form.field.label.ageOfGroom': 'Age of groom',
        'form.field.label.ageOfBride': 'Age of bride',
        'form.section.marriageEvent.date': 'Date of marriage',
        'form.field.label.placeOfMarriage': 'Place of marriage',
        'form.field.label.typeOfMarriage': 'Type of marriage',
        'form.field.label.polygamy': 'Polygamous',
        'form.field.label.monogamy': 'Monogamous',
        'form.section.witnessOne.title': 'Witness 1 details',
        'form.section.witnessTwo.title': 'Witness 2 details',
        'form.section.witness.name': 'Witness',
        'form.field.label.relationshipToSpouses': 'Relationship to spouses',
        'form.preview.group.label.witness.one.english.name':
          'Witness One English name',
        'form.preview.group.label.witness.two.english.name':
          'Witness Two English name',
        'form.section.marriageEvent.name': 'Marriage event details',
        'form.section.marriageEvent.title': 'Marriage details',
        'form.field.label.marriedLastName': 'Married last name (if different)',
        'form.field.label.proofOfMarriageNotice':
          'Notice of intention to marriage',
        'form.field.label.lastNameAtBirth':
          'Last name at birth (if different from above)',
        'form.field.label.docTypeMarriageNotice': 'Notice of marriage',
        'form.field.label.proofOfGroomsID': "Proof of groom's identity",
        'form.field.label.proofOfBridesID': "Proof of bride's identity",
        'misc.createDescription':
          "Choose a PIN that doesn't have 4 repeating digits or sequential numbers",
        'misc.createTitle': 'Create a PIN',
        'misc.description.Complete':
          'The informant will receive an SMS with a registration number that they can use to collect their certificate.',
        'misc.description.inComplete':
          'Please add mandatory information before sending for approval.',
        'misc.newPass.header': 'Choose a new password',
        'misc.newPass.instruction':
          'Create a unique password - one that you don’t use for other websites or applications.',
        'misc.notif.declarationsSynced':
          'As you have connectivity, we can synchronize your declarations.',
        'misc.notif.draftsSaved': 'Your draft has been saved',
        'misc.notif.outboxText': 'Outbox ({num})',
        'misc.notif.processingText': '{num} declaration processing...',
        'misc.notif.sorryError': 'Sorry! Something went wrong',
        'misc.notif.unassign': 'You were unassigned from {trackingId}',
        'misc.notif.onlineUserStatus': 'You are back online',
        'misc.notif.updatePINSuccess': 'Your pin has been successfully updated',
        'misc.notif.userAuditSuccess':
          '{name} was {action, select, DEACTIVATE {deactivated} REACTIVATE {reactivated} other{deactivated}}',
        'misc.notif.userFormSuccess': 'New user created',
        'misc.notif.userFormUpdateSuccess': 'User details have been updated',
        'misc.notif.duplicateRecord':
          '{trackingId} is a potential duplicate. Record is ready for review.',
        'misc.notif.offlineError': 'Offline. Try again when reconnected',
        'misc.pinMatchError': 'PIN code did not match. Please try again.',
        'misc.confirmPinTitle': 'Confirm PIN',
        'misc.pinSameDigitsError': 'PIN cannot have same 4 digits',
        'misc.pinSeqDigitsError': 'PIN cannot contain sequential digits',
        'misc.reEnterDescription':
          "Let's make sure we collected your PIN correctly",
        'misc.reEnterTitle': 'Re-enter your PIN',
        'misc.session.expired': 'Your session has expired. Please login again.',
        'misc.title.declarationStatus':
          'Send for {draftStatus, select, true {approval} other {approval or reject}}?',
        'misc.nidCallback.authenticatingNid': 'Authenticating National ID',
        'misc.nidCallback.failedToAuthenticateNid':
          'Failed to authenticate National ID',
        'navigation.application': 'Application',
        'navigation.approvals': 'Sent for approval',
        'navigation.certificate': 'Certificates',
        'navigation.completenessRates': 'Completeness rates',
        'navigation.config': 'Configuration',
        'navigation.declarationForms': 'Declaration forms',
        'navigation.outbox': 'Outbox',
        'navigation.performance': 'Performance',
        'navigation.print': 'Ready to print',
        'navigation.progress': 'In progress',
        'navigation.readyForReview': 'Ready for review',
        'navigation.readyToIssue': 'Ready to issue',
        'navigation.requiresUpdate': 'Requires updates',
        'navigation.sentForReview': 'Sent for review',
        'navigation.sentForUpdates': 'Sent for updates',
        'navigation.team': 'Team',
        'navigation.waitingValidation': 'In external validation',
        'navigation.reports': 'Vital statistics',
        'navigation.organisation': 'Organisation',
        'navigation.analytic': 'Analytics',
        'navigation.performanceStatistics': 'Statistics',
        'navigation.leaderboards': 'Leaderboards',
        'navigation.dashboard': 'Dashboard',
        'navigation.report': 'Report',
        'password.cases': 'Contain upper and lower cases',
        'password.label.confirm': 'Confirm password',
        'password.label.current': 'Current password',
        'password.label.new': 'New password',
        'password.match': 'Passwords match',
        'password.minLength': '{min} characters minimum',
        'password.mismatch': 'Passwords do not match',
        'password.number': 'At least one number',
        'password.validation.msg': 'Password must have:',
        'performance.fieldAgents.col.avgCompTime':
          'Avg. time to send{linebreak}complete declaration',
        'performance.fieldAgents.col.totInProg': 'Sent{linebreak}incomplete',
        'performance.fieldAgents.col.totRej': 'Rejected',
        'performance.fieldAgents.columnHeader.name':
          'Field Agents ({totalAgents})',
        'performance.fieldAgents.columnHeader.office': 'Office',
        'performance.fieldAgents.columnHeader.startMonth': 'Start month',
        'performance.fieldAgents.columnHeader.totalSent':
          'Declarations{linebreak}sent',
        'performance.fieldAgents.columnHeader.type': 'Type',
        'performance.fieldAgents.columnHeader.role': 'Role',
        'performance.fieldAgents.noResult': 'No users found',
        'performance.fieldAgents.options.event.births': 'Births',
        'performance.fieldAgents.options.event.both': 'Births and deaths',
        'performance.fieldAgents.options.event.deaths': 'Deaths',
        'performance.fieldAgents.options.status.active': 'Active',
        'performance.fieldAgents.options.status.deactive': 'Deactive',
        'performance.fieldAgents.options.status.pending': 'Pending',
        'performance.fieldAgents.showMore': 'Show next {pageSize}',
        'performance.fieldAgents.title': 'Field agents',
        'performance.header.sysadmin.home':
          'Search for an administrative area or office',
        'performance.operational.workflowStatus.header':
          'Current declarations in workflow',
        'performance.ops.statCount.desc':
          'Current status of {event, select, BIRTH{birth} DEATH{death} other{birth}} records being processed.',
        'performance.regRates.column.location': 'Locations',
        'performance.regRates.select.item.byLocation': 'By locations',
        'performance.regRates.select.item.overTime': 'Over time',
        'performance.reports.appStart.desc':
          'Total and percentage breakdown of the declarations started by source from ',
        'performance.reports.appStart.fieldAgents': 'Field agents',
        'performance.reports.corrections.other.label': 'Other',
        'performance.reports.declarationsStarted.hospitals':
          'Hospitals (DHIS2)',
        'performance.reports.declarationsStarted.offices':
          'Registration offices',
        'performance.reports.declarationsStarted.title': 'Declarations started',
        'performance.reports.declarationsStarted.total': 'Total started',
        'performance.reports.header.completenessRates': 'Completeness rates',
        'performance.reports.header.totalCertificates': 'Certificates issued',
        'performance.reports.header.totalCorrections': 'Corrections',
        'performance.reports.header.totalPayments': 'Fees collected',
        'performance.reports.header.totalRegistrations': 'Registrations',
        'performance.reports.header.applicationSources':
          'Sources of registrations',
        'performance.reports.subHeader.applicationSources':
          'The number and percentage of declarations started by each system role that has been registered',
        'performance.reports.select.item.operational': 'Operational',
        'performance.reports.select.item.reports': 'Reports',
        'performance.reports.subHeader.completenessRates':
          'The no. of registrations, expressed as a % of the total estimated no. of {event, select, BIRTH{birth} DEATH{death} other{birth}}s occurring',
        'performance.reports.subHeader.totalCertificates':
          'Certification rate is the no. of certificates issues, expressed as a percentage of the total number of registrations',
        'performance.values.labels.total': 'Total',
        'performance.values.labels.delayed': 'Delayed registrations',
        'performance.values.labels.birth.healthFacility':
          'Health facility birth',
        'performance.values.labels.death.healthFacility':
          'Health facility death',
        'performance.values.labels.birth.home': 'Home birth',
        'performance.values.labels.death.home': 'Home death',
        'performance.values.labels.male': 'Male',
        'performance.values.labels.female': 'Female',
        'performance.values.labels.late': 'Late registrations',
        'performance.values.labels.within1Year': 'Within 1 year',
        'performance.values.labels.within5Years': 'Within 5 years',
        'performance.values.labels.withinTargetDays':
          '{withPrefix, select, true {Registered within} other {Within}} {target} days',
        'performance.payments.label.certificationFee': 'Certification fee',
        'performance.payments.label.correctionFee': 'Correction fees',
        'performance.appSrc.labels.hospitalApplications':
          'Health system (integration)',
        'performance.appSrc.labels.fieldAgents': 'Field agents',
        'performance.appSrc.labels.registrars': 'Registrars',
        'performance.appSrc.labels.nationalRegistrars': 'National registrars',
        'performance.appSrc.labels.registrationAgents': 'Registration agents',
        'performance.labels.certificationRate': 'Certification rate',
        'performance.stats.header': 'Stats',
        'performance.registrarsToCitizen': 'Registrars to citizens',
        'performance.registrarsToCitizenValue': '1 to {citizen}',
        'performance.registrationByStatus.header': 'Registration by status',
        'performance.completenessTable.completenessRate':
          'Completeness {lineBreak}rate',
        'phone.label.changeNumber': 'Enter new number',
        'phone.label.changeEmail': 'What is your new email?',
        'phone.label.confirmation':
          'A verification code has been sent to {num}',
        'email.label.confirmation':
          'A verification code has been sent to {email}',
        'phone.label.verify': 'Enter 6 digit verification code',
        'print.cert.coll.id.actions.cancel': 'Cancel',
        'print.cert.coll.id.actions.send': 'Confirm',
        'print.cert.coll.id.description':
          'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
        'print.cert.coll.idCheck.actions.noVer': 'No ID match',
        'print.cert.coll.idCheck.actions.ver': 'ID verified',
        'print.cert.coll.other.aff.check': 'No signed affidavit available',
        'print.cert.coll.other.aff.description':
          'Please be aware that if you proceed, you will be responsible for issuing a certificate without necessary evidence from the collector',
        'print.cert.coll.other.aff.error':
          'Upload signed affidavit or click the checkbox if they do not have one.',
        'print.cert.coll.other.aff.form.title': 'Upload signed affidavit',
        'print.cert.coll.other.aff.label': 'Signed affidavit',
        'print.cert.coll.other.aff.paragraph':
          'This document should clearly prove that the individual has the authority to collect the certificate',
        'print.cert.coll.other.aff.title': 'Print without signed affidavit?',
        'print.certificate.addAnotherSignature': 'Add another',
        'print.certificate.birthService':
          'Service: <strong>Birth registration after {service} of D.o.B.</strong><br/>Amount Due:',
        'print.certificate.button.confirmPrint': 'Yes, print certificate',
        'print.certificate.certificatePreview': 'Certificate preview',
        'print.certificate.collector.father': 'Father is collecting',
        'print.certificate.signature.person1': 'UP Secretary Shakib al hasan',
        'print.certificate.signature.person2':
          'Local Registrar Shakib al hasan',
        'print.certificate.collector.form.error':
          'Please select who is collecting the certificate',
        'print.certificate.collector.idCheck.title': 'Check proof of ID',
        'print.certificate.collector.idCheckDialog.title':
          'Print without proof of ID?',
        'print.certificate.collector.informant': 'Informant is collecting',
        'print.certificate.collector.mother': 'Mother is collecting',
        'print.certificate.collector.other.form.error':
          'Complete all the mandatory fields',
        'print.certificate.collector.other.paragraph': '',
        'print.certificate.collector.other.title': 'Collector details',
        'print.certificate.collector.other': 'Other',
        'print.certificate.collector.whoToCollect': 'Certify record',
        'print.certificate.collectPayment':
          'Please collect the payment, print the receipt and hand it over to the payee.',
        'print.certificate.deathService':
          'Service: <strong>Death registration after {service} of D.o.D.</strong><br/>Amount Due:',
        'print.certificate.form.name': 'Print',
        'print.certificate.form.title': 'Print certificate',
        'print.certificate.manualPaymentMethod': 'Manual',
        'print.certificate.next': 'Next',
        'print.certificate.noLabel': ' ',
        'print.certificate.payment': 'Collect payment',
        'print.certificate.paymentAmount': '৳ {paymentAmount}',
        'print.certificate.paymentInstruction':
          'Please collect the payment, print the receipt and hand it over to the payee.',
        'print.certificate.paymentMethod': 'Payment method',
        'print.certificate.printCertificate': 'Print certificate',
        'print.certificate.printReceipt': 'Print receipt',
        'print.certificate.queryError':
          'An error occurred while quering for birth registration data',
        'print.certificate.review.description':
          'Please confirm that the informant has reviewed that the information on the certificate is correct and that it is ready to print.',
        'print.certificate.review.printModalTitle': 'Print certificate?',
        'print.certificate.review.printAndIssueModalTitle':
          'Print and issue certificate?',
        'print.certificate.review.modal.body.print':
          'A PDF of the certificate will open in a new tab for you to print. This record will then be moved to your ready to issue work-queue',
        'print.certificate.review.modal.body.printAndIssue':
          'A PDF of the certificate will open in a new tab for you to print and issue',
        'print.certificate.review.title': 'Ready to certify?',
        'print.certificate.section.title': 'Certify record',
        'print.certificate.selectSignature': 'Select e-signatures',
        'print.certificate.serviceMonth':
          'Service: <strong>Birth registration after {service, plural, =0 {0 month} one {1 month} other{{service} months}} of D.o.B.</strong><br/>Amount Due:',
        'print.certificate.serviceYear':
          'Service: <strong>Birth registration after {service, plural, =0 {0 year} one {1 year} other{{service} years}} of D.o.B.</strong><br/>Amount Due:',
        'print.certificate.toast.message': 'Certificate is ready to print',
        'print.certificate.userReviewed':
          'The informant has reviewed and confirmed that the information on the certificate is correct.',
        'print.certificate.noPayment': 'No payment required',
        'record.certificate.collector': 'Printed on collection',
        'record.certificate.collectedInAdvance': 'Printed in advance by',
        'recordAudit.archive.confirmation.body':
          'This will archive the record and remove it from your workspace',
        'recordAudit.archive.confirmation.title': 'Archive declaration?',
        'recordAudit.archive.status': 'Archived',
        'recordAudit.rn': 'Registration No.',
        'recordAudit.dateOfBirth': 'Date of birth',
        'recordAudit.dateOfDeath': 'Date of death',
        'recordAudit.dateOfMarriage': 'Date of marriage',
        'recordAudit.declaration.reinstateDialog.actions.cancel': 'Cancel',
        'recordAudit.declaration.reinstateDialog.actions.confirm': 'Confirm',
        'recordAudit.declaration.reinstateDialogDescription':
          'This will reinstate the record back to its original status',
        'recordAudit.declaration.markAsDuplicate': 'Marked as a duplicate',
        'recordAudit.declaration.reinstateDialogTitle':
          'Reinstate declaration?',
        'recordAudit.registrationNo': 'Registration No',
        'recordAudit.noDateOfBirth': 'No date of birth',
        'recordAudit.noDateOfDeath': 'No date of death',
        'recordAudit.noDateOfMarriage': 'No date of marriage',
        'recordAudit.noName': 'No name provided',
        'recordAudit.history.started': 'Started',
        'recordAudit.noPlaceOfBirth': 'No place of birth',
        'recordAudit.noPlaceOfDeath': 'No place of death',
        'recordAudit.noPlaceOfMarriage': 'No place of marriage',
        'recordAudit.noStatus': 'No status',
        'recordAudit.noTrackingId': 'No tracking ID',
        'recordAudit.noType': 'No event',
        'recordAudit.placeOfBirth': 'Place of birth',
        'recordAudit.placeOfDeath': 'Place of death',
        'recordAudit.placeOfMarriage': 'Place of marriage',
        'recordAudit.regAction.assigned': 'Assigned',
        'recordAudit.regAction.downloaded': 'Retrieved',
        'recordAudit.regAction.reinstated':
          'Reinstated to {regStatus, select, validated{ready for review} in_progress{in progress} declared{ready for review} rejected{requires updates} other{}}',
        'recordAudit.regAction.requestedCorrection': 'Corrected record',
        'recordAudit.regAction.unassigned': 'Unassigned',
        'recordAudit.regAction.viewed': 'Viewed',
        'recordAudit.regAction.markedAsDuplicate': 'Marked as a duplicate',
        'recordAudit.regStatus.archived': 'Archived',
        'recordAudit.regStatus.declared': 'Declaration started',
        'recordAudit.regStatus.declared.sentNotification':
          'Sent notification for review',
        'recordAudit.regStatus.waitingValidation': 'Waiting for validation',
        'recordAudit.regStatus.registered': 'Registered',
        'recordAudit.regStatus.certified': 'Certified',
        'recordAudit.regStatus.issued': 'Issued',
        'recordAudit.regStatus.rejected': 'Rejected',
        'recordAudit.regStatus.updatedDeclaration': 'Updated',
        'recordAudit.regStatus.markedAsNotDuplicate': 'Marked not a duplicate',
        'recordAudit.regAction.flaggedAsPotentialDuplicate':
          'Flagged as potential duplicate',
        'recordAudit.status': 'Status',
        'recordAudit.trackingId': 'Tracking ID',
        'recordAudit.type': 'Event',
        'recordAudit.contact': 'Contact',
        'recordAudit.noContact': 'No contact details provided',
        'regHome.archived': 'Archived',
        'regHome.certified': 'Certified',
        'regHome.issued': 'Issued',
        'regHome.inPro.selector.field.agents': 'Field agents',
        'regHome.inPro.selector.hospital.drafts': 'Health system',
        'regHome.inPro.selector.own.drafts': 'My drafts',
        'regHome.inProgress': 'In progress',
        'regHome.outbox.statusArchiving': 'Archiving...',
        'regHome.outbox.statusCertifying': 'Certifying...',
        'regHome.outbox.statusIssuing': 'Issuing...',
        'regHome.outbox.statusRegistering': 'Registering...',
        'regHome.outbox.statusReinstating': 'Reinstating...',
        'regHome.outbox.statusRejecting': 'Sending for updates...',
        'regHome.outbox.statusRequestingCorrection': 'Correcting...',
        'regHome.outbox.statusSendingForApproval': 'Sending for approval...',
        'regHome.outbox.statusSubmitting': 'Sending...',
        'regHome.outbox.statusWaitingToBeArchived': 'Waiting to be archived',
        'regHome.outbox.statusWaitingToBeReinstated':
          'Waiting to be reinstated',
        'regHome.outbox.statusWaitingToCertify': 'Waiting to certify',
        'regHome.outbox.statusWaitingToIssue': 'Waiting to issue',
        'regHome.outbox.statusWaitingToRegister': 'Waiting to register',
        'regHome.outbox.statusWaitingToReject': 'Waiting to send for updates',
        'regHome.outbox.statusWaitingToRequestCorrection': 'Waiting to correct',
        'regHome.outbox.statusWaitingToSubmit': 'Waiting to send',
        'regHome.outbox.statusWaitingToValidate':
          'Waiting to send for approval',
        'regHome.outbox.waitingToRetry': 'Waiting to retry',
        'regHome.queryError': 'An error occurred while searching',
        'regHome.readyForReview': 'Ready for review',
        'regHome.readyToPrint': 'Ready to print',
        'regHome.registrationNumber': 'Registration no.',
        'regHome.requestedCorrection': 'Requested correction',
        'regHome.searchInput.placeholder': 'Look for a record',
        'regHome.sentForApprovals': 'Sent for approval',
        'regHome.sentForExternalValidation': 'Sent for external validation',
        'regHome.sentForUpdates': 'Sent for updates',
        'regHome.table.label.action': 'Action',
        'regHome.table.label.declarationDate': 'Declaration sent',
        'regHome.table.label.registeredDate': 'Registered',
        'regHome.table.label': 'Results',
        'regHome.val.regAgent.tooltip':
          'Declaration has been validated and waiting for approval',
        'regHome.validated.registrar.tooltip':
          'Declaration has been validated by a registration agent',
        'regHome.waitingForExternalValidation':
          'Waiting for external validation',
        'regHome.workqueue.downloadDeclarationFailed':
          'Failed to download record. Please try again',
        'register.conf.butt.back.dup': 'Back to duplicate',
        'register.conf.butt.newDecl': 'New declaration',
        'register.confirmationScreen.boxHeaderDesc':
          '{event, select, declaration {{eventType, select, birth {birth} death {death} other{birth}} declaration has been sent for review.} registration {{eventType, select, birth {birth} death {death} other{birth}} has been registered.} duplication {{eventType, select, birth {birth} death {death} other{birth}} has been registered.} rejection {{eventType, select, birth {birth} death {death} other{birth}} declaration has been rejected.} certificate {{eventType, select, birth {birth} death {death} other{birth}} certificate has been completed.} offline {{eventType, select, birth {birth} death {death} other{birth}} declaration will be sent when you reconnect.} other {{eventType, select, birth {birth} death {death} other{birth}}}',
        'register.confirmationScreen.buttons.back': 'Back to homescreen',
        'register.confirmationScreen.trackingSectionDesc':
          '{event, select, certificate {Certificates have been collected from your jurisdiction.} other {The informant will receive this number via SMS, but make sure they write it down and keep it safe. They should use the number as a reference if enquiring about their registration.} registration {The informant will receive this number via SMS with instructions on how and where to collect the certificate.} duplication{The informant will receive this number via SMS with instructions on how and where to collect the certificate.} rejection{The declaration agent will be informed about the reasons for rejection and instructed to follow up.} offline {The informant will receive the tracking ID number via SMS when the declaration has been sent for review.}} ',
        'register.confirmationScreen.trackingSectionTitle':
          '{event, select, declaration {Tracking number:} registration {{eventType, select, birth {Birth} death {Death}} Registration Number:} duplication {{eventType, select, birth {Birth} death {Death}} Registration Number:} other {Tracking number:} certificate {} offline {Tracking number:}} ',
        'register.eventInfo.birth.listItem0':
          'I am here to start the birth registration process for you.',
        'register.eventInfo.birth.listItem1':
          'You will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
        'register.eventInfo.birth.listItem2':
          'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
        'register.eventInfo.birth.listItem3': '',
        'register.eventInfo.death.listItem0':
          'I am here to start the death registration process for you.',
        'register.eventInfo.death.listItem1':
          'You will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
        'register.eventInfo.death.listItem2':
          'Make sure you collect the certificate. A death certificate is critical to support with inheritance claims and to resolve the affairs of the deceased e.g. closing bank accounts and settling loans.',
        'register.eventInfo.death.listItem3': '',
        'register.eventInfo.marriage.listItem0':
          'I am here to complete the marriage registration declaration for you. ',
        'register.eventInfo.marriage.listItem1':
          'Once I complete the declaration, it will be sent to the registration office for review.',
        'register.eventInfo.marriage.listItem2':
          'Wait for an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
        'register.eventInfo.event.title':
          'Introduce the {eventType, select, birth{birth} death{death} other{marriage}} registration process to the informant',
        'register.eventInfo.birth.title':
          'Introduce the birth registration process to the informant',
        'register.eventInfo.death.title':
          'Introduce the death registration process to the informant',
        'register.eventInfo.marriage.title':
          'Introduce the marriage registration process to the informant',
        'register.form.informationMissing': 'Information missing',
        'register.form.missingFieldsDescription':
          'The following information will be submitted for validation. Please\n    make sure all required details have been filled in correctly. There\n    are {numberOfErrors} missing mandatory fields in your form:',
        'register.form.modal.areYouReadyToSubmit': 'Are you ready to submit?',
        'register.form.modal.desc.saveDeclarationConfirm':
          'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?',
        'register.form.modal.desc.validateConfirmation':
          'This declaration will be sent to the registrar for approval.',
        'register.form.modal.submitDescription':
          'By clicking “Submit” you confirm that the informant has read and reviewed the information and understands that this information will be shared with Civil Registration authorities.',
        'register.form.modal.title.saveDeclarationConfirm': 'Save & exit?',
        'register.form.modal.title.deleteDeclarationConfirm': 'Delete draft?',
        'register.form.modal.desc.deleteDeclarationConfirm':
          'Are you certain you want to delete this draft declaration form? Please note, this action cant be undone.',
        'register.form.modal.title.exitWithoutSavingModalForCorrection':
          'Exit correct record?',
        'register.form.modal.desc.exitWithoutSavingModalForCorrection':
          'Are you sure you want to exit? Any corrections you have made will not be saved.',
        'register.form.modal.title.exitWithoutSavingDeclarationConfirm':
          'Exit without saving changes?',
        'register.form.modal.desc.exitWithoutSavingDeclarationConfirm':
          'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?',
        'register.form.modal.title.submitConfirmation':
          '{completeDeclaration, select, true {Send for review?} other {Send for review?}}',
        'register.form.modal.title.validateConfirmation': 'Send for approval?',
        'register.form.newVitalEventRegistration':
          '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} other {Adoption}} declaration',
        'register.form.previewEventRegistration':
          '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} other {Adoption}} declaration preview',
        'register.form.required': 'This field is required',
        'register.form.reviewEventRegistration':
          '{event, select, birth {Birth} death {Death} marriage {Marriage} divorce {Divorce} other {Adoption}} registration review',
        'register.form.saveAsDraft': 'Save as draft',
        'register.form.section.preview.name': 'Preview',
        'register.form.section.preview.title': 'Preview',
        'register.form.section.review.title': 'Review',
        'register.primaryInformant.description':
          'This person is responsible for providing accurate information in this declaration. ',
        'register.primaryInformant.errorMessage':
          'Please select who is the primary informant',
        'register.primaryInformant.registerNewEventHeading':
          'Primary informant',
        'register.registerForm.queryError':
          'The page cannot be loaded at this time due to low connectivity or a network error. Please click refresh to try again, or try again later.',
        'register.SelContact.birthRelLabel': 'Relationship to child',
        'register.SelectContactPoint.error':
          'Please select a main point of contact',
        'register.SelectContactPoint.heading': 'Main point of contact',
        'register.SelectContactPoint.phoneNoError': 'Not a valid mobile number',
        'register.SelectContactPoint.phoneNoLabel': 'Phone number',
        'register.SelectContactPoint.title': 'Birth declaration',
        'register.selectInformant.birthErrorMessage':
          'Please select who is the informant',
        'register.selectInformant.birthInformantTitle': 'Informant type',
        'register.selectInformant.marriageInformantTitle':
          "Informant's details",
        'register.selectInformant.daughter': 'Daughter',
        'register.selectInformant.deathErrorMessage':
          'Please select the relationship to the deceased',
        'register.selectInformant.deathInformantTitle': 'Informant type',
        'register.selectInformant.extendedFamily': 'Extended family',
        'register.selectinformant.legalGuardian': 'Legal guardian',
        'register.selectInformant.newBirthRegistration':
          'New birth declaration',
        'register.selectInformant.newDeathRegistration':
          'New death declaration',
        'register.selectInformant.newMarriageRegistration':
          'New marriage declaration',
        'register.selectInformant.parents': 'Mother & Father',
        'register.selectInformant.primaryInformant': 'Primary informant',
        'register.selectInformant.relationshipLabel':
          'Relationship to deceased',
        'register.selectInformant.son': 'Son',
        'register.selectInformant.spouse': 'Spouse',
        'register.selectVitalEvent.backToReviewButton': 'Back to review',
        'register.selectVitalEvent.errorMessage':
          'Please select the type of event',
        'register.selectVitalEvent.registerNewEventDesc': 'Event type',
        'register.selectVitalEvent.registerNewEventHeading': 'Event type',
        'register.selectVitalEvent.registerNewEventTitle': 'New declaration',
        'register.selInf.deathInfSomeoneElse': 'Relationship to the deceased',
        'register.workQueue.declarations.banner':
          'Declarations to register in your area',
        'review.actions.desc.regConfComp':
          'By clicking register, you confirm that the information entered is correct and the vital event can be registered.',
        'review.actions.desc.regConfInComp':
          'Please add mandatory information before registering.',
        'review.actions.description.confirmComplete':
          'The informant will receive an {deliveryMethod} with a registration number that they can use to collect the certificate.',
        'review.actions.description.confirmInComplete':
          'The informant will receive an {deliveryMethod} with a tracking ID that they can use to provide the additional mandatory information required for registration.',
        'review.actions.description':
          'By clicking register, you confirm that the information entered is correct and the vital event can be registered. ',
        'review.actions.title.declarationStatus':
          'Declaration {completeDeclaration, select, true {complete} other {incomplete}}',
        'review.actions.title.registerActionTitle': 'Ready to register?',
        'review.birthRegistration.queryError':
          'An error occurred while fetching birth registration',
        'review.button.approve': 'Send for approval',
        'review.documents.editDocuments': 'Upload',
        'review.documents.zeroDocumentsText':
          'No supporting documents for {section, select, child {child} mother {mother} father {father} deceased {deceased} informant {informant} other {Parent}}',
        'review.documents.zeroDocumentsTextForAnySection':
          'No supporting documents',
        'review.documentViewer.tagline': 'Select to preview',
        'review.documentViewer.title': 'Supporting documents',
        'review.edit.modal.backToPreview': 'Back to preview',
        'review.edit.modal.confirmationText':
          'A record will be created of any changes you make',
        'review.edit.modal.confirmationTitle': 'Edit declaration?',
        'review.error.unauthorized':
          'We are unable to display this page to you',
        'review.form.section.review.name': 'Review',
        'review.form.section.review.title': 'Review',
        'review.formData.header':
          '{isDraft, select, true {Check responses with the informant before sending for review} other {Review the answers with the supporting documents}}',
        'review.header.subject.subjectWithoutName':
          '{eventType, select, birth {Birth} death {Death} other {Marriage}} Declaration',
        'review.header.subject.subjectWitName':
          '{eventType, select, birth {Birth} death {Death} other {Marriage} } declaration for {name}',
        'review.header.title.govtName': 'Republic of Farajaland',
        'review.inputs.additionalComments': 'Comments',
        'review.modal.desc.submitConfirmation':
          '{completeDeclaration, select, true {This declaration will be sent for review.} other {This incomplete declaration will be sent for review.}}',
        'review.modal.title.registerConfirmation': 'Register the {event}?',
        'review.modal.title.submitConfirmation':
          '{completeDeclaration, select, true {Send for review?} other {Send for review?}}',
        'review.inputs.supportingDocuments': 'Supporting documents',
        'review.rej.form.reasons.missSupDoc': 'Missing supporting documents',
        'review.rejection.form.commentInstruction': '',
        'review.rejection.form.commentLabel': 'Comments',
        'review.rejection.form.instruction':
          'Please describe the updates required to this record for follow up action.',
        'review.rejection.form.reasons.markDuplicate': 'Mark as a duplicate',
        'review.rejection.form.reasons.duplicate': 'Duplicate declaration',
        'review.rejection.form.reasons.misspelling': 'Misspelling',
        'review.rejection.form.reasons.other': 'Other',
        'review.rejection.form.reasons': 'Reason(s) for rejection:',
        'review.rejection.form.submitButton': 'Submit rejection',
        'review.rejection.form.title': 'Reason for rejection?',
        'review.rejection.form': 'Rejection form',
        'search.informantContact': 'Informant contact number',
        'search.labels.results.eventRegistrationNumber':
          '{event, select, birth {B} death {D} marriage {M} divorce {Divorce } other {A}}RN',
        'search.loadingDeclarations': 'Loading declarations...',
        'search.locationNotFound': 'Location Not Found',
        'search.noDeclarations': 'No declarations to review',
        'search.noResults': 'No result to display',
        'search.results': 'Results',
        'search.searchingFor': 'Searching for “{param}”',
        'search.searchResultFor': 'Search result for “{param}”',
        'search.noResultFor': 'No results for ”{param}”',
        'search.totalResultText':
          '{total, plural, =0 {} one {# record found} other {# records found}} ',
        'search.waitingForConnection': 'Reconnect to load declarations',
        'search.bookmarkAdvancedSearchModalTitle': 'Save search query?',
        'search.bookmarkAdvancedSearchModalBody':
          'A shortcut will be added to the side bar so you can rerun this search query',
        'search.removeBookmarkAdvancedSearchModalTitle': 'Remove search query?',
        'search.removeBbookmarkAdvancedSearchModalBody':
          'This advanced search bookmark will be removed from the side bar shortcut',
        'search.bookmark.success.notification':
          'Your advanced search result has been bookmarked successfully',
        'search.bookmark.remove.success.notification':
          'Your advanced search bookmark has been removed successfully',
        'search.bookmark.error.notification':
          'Sorry, something went wrong. Please try again',
        'search.bookmark.loading.notification':
          'Bookmarking your advanced search results...',
        'search.bookmark.remove.loading.notification':
          'Removing your advanced search bookmark...',
        'advancedSearch.form.registrationDetails': 'Registration details',
        'advancedSearch.form.childDetails': 'Child details',
        'advancedSearch.form.eventDetails': 'Event details',
        'advancedSearch.form.motherDetails': 'Mother details',
        'advancedSearch.form.fatherDetails': 'Father details',
        'advancedSearch.form.placeOfRegistration': 'Place of registration',
        'advancedSearch.form.placeOfRegistrationHelperText':
          'Search for a province, district or registration office',
        'advancedSearch.form.dateOfRegistration': 'Date of registration',
        'advancedSearch.form.statusOfRecordLabel': 'Status of record',
        'advancedSearch.form.deceasedDetails': 'Deceased details',
        'advancedSearch.form.informantDetails': 'Informant details',
        'advancedSearch.form.recordStatusAny': 'Any status',
        'advancedSearch.form.recordStatusInprogress': 'In progress',
        'advancedSearch.form.recordStatusInReview': 'In review',
        'advancedSearch.form.recordStatusRequireUpdate': 'Requires updates',
        'advancedSearch.form.recordStatusRegistered': 'Registered',
        'advancedSearch.form.recordStatusCertified': 'Certified',
        'advancedSearch.form.recordStatusAchived': 'Archived',
        'advancedSearch.accordion.hide': 'Hide',
        'advancedSearch.accordion.show': 'Show',
        'advancedSearchResult.pill.event': 'Event',
        'advancedSearchResult.pill.registationStatus': 'Registration status',
        'advancedSearchResult.pill.eventDate': 'Event date',
        'advancedSearchResult.pill.regNumber': 'Registration number',
        'advancedSearchResult.pill.trackingId': 'Tracking ID',
        'advancedSearchResult.pill.regDate': 'Registration date',
        'advancedSearchResult.pill.eventLocation': 'Event location',
        'advancedSearchResult.pill.regLocation': 'Location',
        'advancedSearchResult.pill.childFirstName': 'Child firstname',
        'advancedSearchResult.pill.childLastName': 'Child lastname',
        'advancedSearchResult.pill.motherFirstName': 'Mother firstname',
        'advancedSearchResult.pill.motherLastName': 'Mother lastname',
        'advancedSearchResult.pill.fatherFirstName': 'Father firstname',
        'advancedSearchResult.pill.fatherLastName': 'Father lastname',
        'advancedSearchResult.pill.deceasedFirstName': 'Deceased firstname',
        'advancedSearchResult.pill.deceasedLastName': 'Deceased lastname',
        'advancedSearchResult.pill.informantFirstName': 'Informant firstname',
        'advancedSearchResult.pill.informantLastName': 'Informant lastname',
        'advancedSearchResult.pill.gender': 'Sex',
        'advancedSearchResult.pill.childDoB': 'Child d.o.b',
        'advancedSearchResult.pill.fatherDoB': 'Father d.o.b',
        'advancedSearchResult.pill.motherDoB': 'Mother d.o.b',
        'advancedSearchResult.pill.deceasedDoB': 'Deceased d.o.b',
        'advancedSearchResult.pill.informantDoB': 'Informant d.o.b',
        'advancedSearchResult.table.searchResult': 'Search results',
        'advancedSearchResult.table.noResult': 'No result',
        'secureAccount.page.title': 'Secure your account',
        'secureAccount.page.desc':
          'A personal identification number protects your account. Your pin will be required before each use of the {applicationName} app',
        'secureAccount.createPin.label': 'CREATE A PIN',
        'settings.account.tile': 'Account',
        'settings.changeAvatar.changeImage': 'Change',
        'settings.changeAvatar.resizeAvatar':
          'Resize and position the chosen image.',
        'settings.changeAvatar': 'Change profile image',
        'settings.changeLanguage.success': 'Language updated to {language}',
        'settings.changeLanguage': 'Change language',
        'settings.changePassword': 'Change password',
        'settings.changePhone': 'Change phone number',
        'settings.message.changeLanguage':
          'Your prefered language that you want to use on OpenCRVS',
        'settings.profile.tile': 'Profile',
        'settings.security.tile': 'Security',
        'settings.system.tile': 'System',
        'settings.title': 'Settings',
        'settings.user.label.assignedOffice': 'Assigned office',
        'settings.user.label.nameBN': 'Bengali name',
        'settings.user.label.nameEN': 'Full name',
        'system.user.unlock.pinLabel': 'Enter your pin',
        'settings.verifyPhone': 'Verify phone number',
        'wq.noRecords.draft': 'No records in progress',
        'wq.noRecords.fieldAgents': 'No records from field agents',
        'wq.noRecords.healthSystem': 'No records from health system',
        'wq.noRecords.externalValidation': 'No records in external validation',
        'wq.noRecords.readyForReview': 'No records ready for review',
        'wq.noRecords.readyToPrint': 'No records ready to print',
        'wq.noRecords.requiresUpdate': 'No records require updates',
        'wq.noRecords.sentForApproval': 'No records sent for approval',
        'wq.noRecords.sentForReview': 'No records sent for review',
        'wq.noRecords.readyToIssue': 'No records ready to issue',
        'sysAdHome.config': 'Config',
        'sysAdHome.devices': 'Devices',
        'sysAdHome.network': 'Network',
        'sysAdHome.offices': 'Offices',
        'sysAdHome.overview': 'Overview',
        'sysAdHome.sendUsernameReminderInvite': 'Send username reminder',
        'sysAdHome.sendUsernameReminderInviteSuccess':
          'Username reminder sent to {name}',
        'sysAdHome.sendUsernameReminderInviteError':
          'Username reminder could not be sent',
        'sysAdHome.sendUsernameReminderInviteModalTitle':
          'Send username reminder?',
        'sysAdHome.sendUsernameReminderInviteModalMessage':
          'The user will receive a username reminder via an {deliveryMethod} sent to {recipient}',
        'sysAdHome.resendInvite': 'Resend invite',
        'sysAdHome.resendInviteError': 'Invite could not be sent',
        'sysAdHome.resendInviteSuccess': 'Invite sent',
        'sysAdHome.resentPasswordSuccess':
          'Temporary password sent to {username}',
        'sysAdHome.resentPasswordError': 'Temporary password could not be sent',
        'sysAdHome.user.audit.comments': 'Comments: ',
        'sysAdHome.user.audit.deactiv.reasonInv':
          'Being investigated due to suspicious activity on their account',
        'sysAdHome.user.audit.deactiv.reasonNotEmp': 'No longer an employee',
        'sysAdHome.user.audit.deactivation.subtitle':
          "This will revoke {name}'s ability to login and access the system. The account can be reactivated at a later date.",
        'sysAdHome.user.audit.deactivation.title': 'Deactivate {name}?',
        'sysAdHome.user.audit.form.error':
          'A reason is required for {auditAction} this user',
        'sysAdHome.user.audit.reactiv.noLongerInv':
          'No longer being investigated for suspicious activity',
        'sysAdHome.user.audit.reactiv.returned': 'Returned to their role',
        'sysAdHome.user.audit.reactivation.subtitle':
          "This will reactivate {name}'s ability to login and access the system.",
        'sysAdHome.user.audit.reactivation.title': 'Reactivate {name}?',
        'sysAdHome.user.audit.reason': 'Please provide a reason: ',
        'sysAdHome.user.audit.reasonOther':
          'Other (please provide a reason in the comments)',
        'sysAdHome.user.deactivate': 'Deactivate',
        'sysAdHome.user.edit.commonGroupTitle': 'Edit user',
        'sysAdHome.user.resetpassword.title': 'Reset Password',
        'sysAdHome.user.resetPasswordModal.title': 'Reset password?',
        'sysAdHome.user.resetPasswordModal.message':
          'The user will receive a temporary password via {deliveryMethod} sent to {recipient}. They will then be prompted to create a new password on successful login',
        'sysAdHome.user.header': 'Edit details',
        'sysAdHome.user.reactivate': 'Reactivate',
        'sysAdHome.users': 'Users',
        'system.user.queryError':
          'An error occurred while loading system users',
        'system.user.settings.avatarUpdated':
          'Profile image successfully updated',
        'system.user.settings.avatarUpdating': 'Updating profile image',
        'system.user.settings.incorrectPassword':
          'Current password incorrect. Please try again.',
        'system.user.settings.incorrectVerifyCode':
          'Verify code incorrect. Please try again.',
        'system.user.settings.name': 'Name',
        'system.user.settings.passwordUpdated':
          'Password was successfully changed',
        'system.user.settings.phonedNumberUpdated': 'Phone number updated',
        'system.user.settings.emailAddressUpdated': 'Email address updated',
        'system.user.settings.profileImage': 'Profile Image',
        'system.user.duplicateMobileError':
          '{number} is already used by another user. Please use a different phone number',
        'system.user.duplicateEmailError':
          '{email} is already used by another user. Please use a different email',
        'system.user.newUser': 'New user',
        'system.user.active': 'Active',
        'system.user.pending': 'Pending',
        'system.user.disabled': 'Disabled',
        'system.user.deactivated': 'Deactivated',
        'system.user.total': '{totalUser} users',
        'system.user.settings.systemLanguage': 'System language',
        'team.header.sysadmin.home': 'Search for an office',
        'team.user.buttons.deactivate': 'Deactivate',
        'team.user.buttons.reactivate': 'Reactivate',
        'unlockApp.incorrectPin': 'Incorrect pin. Please try again',
        'unlockApp.lastTry': 'Last try',
        'unlockApp.locked':
          'Your account has been locked. Please try again in 1 minute.',
        'user.form.buttons.submit': 'Create user',
        'user.form.securityquestion.answer': 'Answer',
        'user.form.securityquestion.description':
          'From the drop down lists below, select questions that can be used later to confirm your identity should you forget your password.',
        'user.form.securityquestion.enterResponse':
          'Enter a response to your chosen security question',
        'user.form.securityquestion.heading': 'Set your security questions',
        'user.form.securityquestion.securityQuestionLabel':
          'Security question {count}',
        'user.form.securityquestion.selectSecurityQuestion':
          'Select a security question',
        'user.form.securityquestion.title': 'Security questions',
        'user.profile.assignedOffice': 'Assigned office',
        'user.profile.audit.column.action': 'Action',
        'user.profile.audit.column.date': 'Date',
        'user.profile.audit.column.eventType': 'Event',
        'user.profile.audit.column.trackingId': 'Record',
        'user.profile.audit.column.deviceIPAddress': 'Device/IP Address',
        'user.profile.audit.description.certified': 'Certified',
        'user.profile.audit.description.issued': 'Issued',
        'user.profile.audit.description.declared': 'Declaration started',
        'user.profile.audit.description.inProgress': 'Sent incomplete',
        'user.profile.audit.description.waiting_validation':
          'Sent declaration for external system validation',
        'user.profile.audit.description.registered': 'Registered',
        'user.profile.audit.description.rejected': 'Rejected',
        'user.profile.audit.description.validated': 'Sent for approval',
        'user.profile.audit.description.updated': 'Updated',
        'user.profile.audit.list.noDataFound': 'No audits to display',
        'user.profile.auditList.showMore':
          'Show next {pageSize} of {totalItems}',
        'user.profile.auditList.corrected': 'Corrected record',
        'user.profile.auditList.assigned': 'Assigned',
        'user.profile.auditList.unAssigned': 'Unassigned',
        'user.profile.auditList.archived': 'Archived',
        'user.profile.auditList.loggedIn': 'Logged in',
        'user.profile.auditList.loggedOut': 'Logged out',
        'user.profile.auditList.phoneNumberChanged': 'Phone number changed',
        'user.profile.auditList.emailAddressChanged': 'Email Address changed',
        'user.profile.auditList.passwordChanged': 'Password changed',
        'user.profile.auditList.userReactivated': 'Reactivated user',
        'user.profile.auditList.userDeactivated': 'Deactivated user',
        'user.profile.auditList.userCreated': 'Created user',
        'user.profile.auditList.userEdited': 'Edited user',
        'user.profile.auditList.passwordReset': 'Reset password',
        'user.profile.auditList.usernameRequested':
          'Username reminder requested',
        'user.profile.auditList.retrieved': 'Retrieved',
        'user.profile.auditList.viewed': 'Viewed',
        'user.profile.auditList.markedAsDuplicate': 'Marked as duplicate',
        'user.profile.auditList.markedAsNotDuplicate':
          'Marked as not duplicate',
        'user.profile.auditList.sentForApproval': 'Sent for approval',
        'user.profile.auditList.reInstatedToInProgress':
          'Reinstated to in progress',
        'user.profile.auditList.reInstatedToInReview':
          'Reinstated to ready for review',
        'user.profile.auditList.reInstatedToUpdate':
          'Reinstated to requires updates',
        'user.profile.auditList.usernameReminderByAdmin':
          'Sent username Reminder',
        'user.profile.auditList.passwordResetByAdmin': 'Sent password',
        'user.profile.phoneNumber': 'Phone number',
        'user.profile.roleType': 'Role',
        'user.profile.sectionTitle.audit': 'History',
        'user.profile.startDate': 'Start date',
        'user.profile.userName': 'Username',
        'user.profile.nid': 'National ID',
        'userSetup.complete.instruction':
          'Login to your account with your username and newly created password',
        'userSetup.complete.title': 'Account setup complete',
        'userSetup.instruction':
          'Check the details below to confirm your account details are correct',
        'userSetup.landing.instruction':
          'You are just a few steps away from completing your account set up',
        'userSetup.landing.title': 'Welcome to {applicationName}',
        'userSetup.review.header': 'Confirm your details',
        'userSetup.review.title': 'Your details',
        'userSetup.securityQuestions.birthTown': 'What city were you born in?',
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
        'userSetup.securityQuestions.motherName': "What is your mother's name?",
        'userSetup.type.hospital': 'Hospital',
        'userSetup.type.healthSystem': 'Health System',
        'userSetup.type.system': 'System',
        'userSetup.waiting': 'Setting up your account',
        'validate.complete.declaration.action.description':
          'The informant will receive an with a registration number that they can use to collect the certificate.',
        'validate.complete.declaration.action.title': 'Declaration complete',
        'validate.declaration.action.modal.description':
          'This declaration will be sent to the registrar for approval.',
        'review.inputs.informantsSignature': 'Signature of informant',
        'review.signature.description':
          'I, the undersigned, hereby declare that the particulars in this form are true and correct to the best of my knowledge.',
        'review.signature.input.description':
          'By signing this document with an electronic signature, I agree that such signature will be valid as handwritten signatures to the extent allowed by the laws of Farajaland.',
        'review.inputs.brideSignature': 'Signature of Bride',
        'review.inputs.groomSignature': 'Signature of Groom',
        'review.inputs.witnessOneSignature': 'Signature of Witness 1',
        'review.inputs.witnessTwoSignature': 'Signature of Witness 2',
        'review.inputs.terms':
          'We, the undersigned declare under penalty of perjury under the laws of Farajaland that the forgoing information is true and correct to the best of our knowledge and belief. We further declare that no legal objections to the marriage is known and hereby apply for a certificate of marriage',
        'review.signature.clear': 'Clear',
        'review.signature.open': 'Sign',
        'review.signature.delete': 'Delete',
        'validate.declaration.action.modal.title': 'Send for approval?',
        'validations.bengaliOnlyNameFormat':
          'Must contain only Bengali characters',
        'validations.blockAlphaNumericDot':
          'Can contain only block character, number and dot (e.g. C91.5)',
        'validations.correctionReason':
          'Please provide a reason for this correction',
        'validations.dateFormat':
          'Required for registration. Enter a valid date',
        'validations.dobEarlierThanDom': 'Must be earlier than marriage date',
        'validations.domLaterThanDob': 'Must be later than birth date',
        'validations.duplicateNationalID': 'National ID must be unique',
        'validations.emailAddressFormat': 'Must be a valid email address',
        'validations.englishOnlyNameFormat':
          "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-), apostrophes(') and underscores (_)",
        'validations.facilityMustBeSelected': 'No facility selected',
        'validations.greaterThanZero': 'Must be a greater than zero',
        'validations.isDateNotAfterDeath':
          'Date of birth must be before date of death',
        'validations.isDateNotBeforeBirth':
          'Date of death must be after deceased date of birth',
        'validations.isInformantOfLegalAge': 'Informant is not of legal age',
        'validations.isMoVisitAfterDeath':
          'Medical Practitioner visit date must not be after the date of death',
        'validations.isMoVisitBeforeBirth':
          'Medical Practitioner visit date must not be before the birth of deceased',
        'validations.isValidBirthDate': 'Must be a valid birth date',
        'validations.isValidDateOfDeath': 'Must be a valid date of death',
        'validations.maxLength': 'Must not be more than {max} characters',
        'validations.minLength': 'Must be {min} characters or more',
        'validations.nonDecimalPointNumber':
          'Can not have any decimal point number',
        'validations.notGreaterThan': 'Must not be more than {maxValue}',
        'validations.numberRequired': 'Must be a number',
        'validations.officeMustBeSelected': 'No office selected',
        'validations.phoneNumberFormat':
          'Must be a valid 10 digit number that starts with 0(7|9)',
        'validations.range': 'Must be within {min} and {max}',
        'validations.required': 'Required for registration',
        'validations.requiredSymbol': '',
        'validations.requiredBasic': 'Required',
        'validations.userform.required': 'Required to register a new user',
        'validations.correction.reason.required':
          'Please provide a reason for this correction',
        'validations.validBirthRegistrationNumber':
          'The Birth Registration Number can only be numeric and must be {validLength} characters long',
        'validations.validDeathRegistrationNumber':
          'The Death Registration Number can only be alpha numeric and must be {validLength} characters long',
        'validations.validDrivingLicenseNumber':
          'The Driving License Number can only be alpha numeric and must be {validLength} characters long',
        'validations.validNationalId':
          'The National ID can only be numeric and must be 10 digits long',
        'validations.validNationalIDLengths': '9',
        'validations.validPassportNumber':
          'The Passport Number can only be alpha numeric and must be {validLength} characters long',
        'validations.illegalMarriageAge': 'Illegal age of marriage',
        'performance.regRates.select.item.byRegistrar': 'By Registrars',
        'performance.registrationsListTable.monthColumn': 'Month',
        'performance.registrationsListTable.locationColumn': 'Location',
        'performance.registrationsListTable.registrarColumn': 'Registrar',
        'performance.registrationsListTable.totalRegistrationsColumn':
          'Total Registrations'
      }
    },
    {
      lang: 'fr',
      displayName: 'Français',
      messages: {
        'advancedSearch.birth.title': "Détails de l'inscription",
        'advancedSearch.birth.informantDetails': "Détails de l'informateur",
        'advancedSearch.birth.placeOfRegistration': "Lieu d'enregistrement",
        'advancedSearch.birth.placeOfRegistrationHelperText':
          "Recherche d'une province, d'un district ou d'un bureau d'enregistrement",
        'advancedSearch.birth.dateOfRegistration': "Date d'enregistrement",
        'advancedSearch.birth.statusOfRecordLabel':
          "Statut de l'enregistrement",
        'advancedSearch.birth.recordStatusAny': 'Tout statut',
        'advancedSearch.birth.recordStatusInprogress': 'En cours',
        'advancedSearch.birth.recordStatusInReview': 'En cours de révision',
        'advancedSearch.birth.recordStatusRequireUpdate':
          'Nécessite des mises à jour',
        'advancedSearch.birth.recordStatusRegistered': 'Enregistré',
        'advancedSearch.birth.recordStatusCertified': 'Certifié',
        'advancedSearch.birth.recordStatusAchived': 'Archivé',
        'advancedSearch.death.placeOfDeath': 'Lieu du décès',
        'buttons.add': 'Ajouter',
        'buttons.copy': 'Copie',
        'buttons.copied': 'Copié',
        'buttons.apply': 'Appliquer',
        'buttons.approve': 'Approuver',
        'buttons.archive': 'Archiver',
        'buttons.assign': 'Affecter',
        'buttons.back': 'Retour',
        'buttons.cancel': 'Annuler',
        'buttons.change': 'Modifier',
        'buttons.changeLanguage': 'Changer de langue',
        'buttons.closeDeclaration': 'Fermer la déclaration',
        'buttons.configure': 'Configurer',
        'buttons.confirm': 'Confirmer',
        'buttons.create': 'Créer',
        'buttons.continue': 'Continuer',
        'buttons.delete': 'Supprimer',
        'buttons.deleteDeclaration': 'Supprimer la déclaration',
        'buttons.drafts': 'Brouillons',
        'buttons.edit': 'Modifier',
        'buttons.editRecord': 'Non, faites la correction',
        'buttons.editRegistration': "Modifier l'enregistrement",
        'buttons.exit': 'EXIT',
        'buttons.finish': 'Terminer',
        'buttons.forgotPassword': 'Mot de passe oublié',
        'buttons.forgottenPIN': "Code d'accès oublié",
        'buttons.goToHomePage': "Aller à la page d'accueil",
        'buttons.homepage': "Page d'accueil",
        'buttons.login': 'Connexion',
        'buttons.logout': 'Déconnexion',
        'buttons.makeCorrection': 'Faire une correction',
        'buttons.menu': 'Menu',
        'buttons.next': 'Suivant',
        'buttons.no': 'Non',
        'buttons.preview': 'Aperçu',
        'buttons.print': 'Imprimer',
        'buttons.issue': 'Délivrer',
        'buttons.printCertificate': 'Imprimer le certificat',
        'buttons.publish': 'Publier',
        'buttons.register': 'Enregistrer',
        'buttons.reinstate': 'Rétablir',
        'buttons.reject': 'Rejeter',
        'buttons.rejectDeclaration': 'Rejeter la déclaration',
        'buttons.replace': 'Modifier tout',
        'buttons.retry': 'Réessayer',
        'buttons.review': 'Revoir',
        'buttons.save': 'Enregistrer',
        'buttons.saving': 'Sauver...',
        'buttons.saveAndExit': 'Sauvegarder et quitter',
        'buttons.saveDraft': 'Enregistrer comme brouillon',
        'buttons.search': 'Rechercher',
        'buttons.select': 'Sélectionnez',
        'buttons.send': 'Soumettre',
        'buttons.sendForApproval': 'Envoyer pour approbation',
        'buttons.sendForReview': 'Envoyer pour révision',
        'buttons.sendIncomplete': 'Envoi incomplet',
        'buttons.settings': 'Paramètres',
        'buttons.start': 'Démarrer',
        'buttons.status': 'Statut',
        'buttons.unassign': 'Désaffecter',
        'buttons.update': 'Mise à jour',
        'buttons.upload': 'Télécharger',
        'buttons.refresh': 'Rafraîchir',
        'buttons.verify': 'Vérifier',
        'buttons.view': 'Voir',
        'buttons.yes': 'Oui',
        'buttons.exactDateUnknown': 'Date exacte inconnue',
        'buttons.sendForUpdates': 'Envoyer pour les mises à jour',
        'certificate.confirmCorrect':
          "Veuillez confirmer que l'informateur a vérifié que les informations figurant sur le certificat sont correctes et que vous êtes prêt à imprimer.",
        'certificate.isCertificateCorrect':
          'Le certificat {event} est-il correct ?',
        'certificate.label.birth': 'Naissance',
        'certificate.label.death': 'Décès',
        'certificate.label.dob': 'D.o.B',
        'certificate.label.dod': 'D.o.D',
        'certificate.parent.details.label.dateOfBirth': 'Date de naissance',
        'certificate.parent.details.label.familyName': 'Nom de famille',
        'certificate.parent.details.label.familyNameInEng':
          'Nom de famille(en anglais)',
        'certificate.parent.details.label.firstName': 'Prénom(s)',
        'certificate.parent.details.label.firstNameInEng':
          'Prénom(s)(en anglais)',
        'certificate.parent.details.label.nationality': 'Nationalité',
        'certificate.parent.details.label.number': 'Numéro',
        'certificate.parent.details.label.typeOfID': "Type de carte d'identité",
        'certificate.receipt.amount': 'Montant payé :',
        'certificate.receipt.amountDue': "Droits d'inscription",
        'certificate.receipt.birthService.after':
          'Enregistrement de la naissance après {target} jours de la date de naissance',
        'certificate.receipt.birthService.before':
          'Enregistrement de la naissance avant {target} jours de la date de naissance',
        'certificate.receipt.birthService.between':
          'Enregistrement de la naissance entre {target} jours et {latetarget} jours de la date de naissance',
        'certificate.receipt.deathService.after':
          'Enregistrement du décès après {target} jours de la date du décès',
        'certificate.receipt.deathService.before':
          'Enregistrement du décès avant {target} jours de la date du décès',
        'certificate.receipt.marriageService.after':
          'Enregistrement du mariage après {target} jours de la date du mariage',
        'certificate.receipt.marriageService.before':
          'Enregistrement du mariage avant {target} jours de la date du mariage',
        'certificate.receipt.header': 'Reçu pour {event} Certificat de',
        'certificate.receipt.issuedAt': 'Délivré à :',
        'certificate.receipt.issuedBy': 'Par :',
        'certificate.receipt.issuedDate': 'Date du paiement :',
        'certificate.receipt.issuer':
          'Par : {role}, {name}\n Date de paiement : {dateOfPayment}',
        'certificate.receipt.service..5year.amount': '৳ 50.00',
        'certificate.receipt.service.5year':
          "{event} inscription après 5 ans de l'événement",
        'certificate.receipt.service.targetDay.amount': '৳ 25.00',
        'certificate.receipt.service.targetDay':
          "{event}  après 45 jours de l'événement.",
        'certificate.receipt.service': 'Service',
        'certificate.receipt.subheader':
          '{event} Enregistrement après {DOBDiff} de {DOE}',
        'changePhone.validation.msg':
          'Doit être un numéro valide à {num} chiffres qui commence par {start}.',
        'changeEmail.validation.msg': 'Doit être une adresse e-mail valide',
        'config.application.applicationNameChangeNotification':
          "Nom de l'application mise à jour",
        'config.application.applicationNameLabel': "Nom de l'application",
        'config.application.birthDelayedDialogTitle':
          "Délai d'enregistrement retardé pour l'enregistrement des naissances",
        'config.application.birthDelayedFeeChangeNotification':
          'Mise à jour de la taxe de retardement des naissances',
        'config.application.birthLateFeeChangeNotification':
          'Mise à jour de la taxe de retard à la naissance',
        'config.application.birthLateRegTargetChangeNotification':
          "Mise à jour des jours cibles d'enregistrement tardif des naissances",
        'config.application.birthLegallySpecifiedDialogTitle':
          "Délai légal pour l'enregistrement des naissances",
        'config.application.birthOnTimeFeeChangeNotification':
          'Mise à jour des frais de naissance à temps',
        'config.application.birthRegTargetChangeNotification':
          "Mise à jour des jours cibles pour l'enregistrement des naissances",
        'config.application.birthTabTitle': 'Naissance',
        'config.application.birthTabTitleExport': 'Naissances',
        'config.application.deathTabTitleExport': 'Des morts',
        'config.application.configChangeError':
          "Impossible d'effectuer la modification. Veuillez réessayer",
        'config.application.currencyChangeMessage':
          'Sélectionnez votre devise pour votre système CRVS',
        'config.application.updatingeMessage': 'Mise à jour de',
        'config.application.currencyChangeNotification':
          'Mise à jour de la devise',
        'config.application.currencyLabel': 'Monnaie',
        'config.application.deathDelayedFeeChangeNotification':
          'Mise à jour de la taxe de retardement du décès',
        'config.application.deathLegallySpecifiedDialogTitle':
          "Délai légal d'enregistrement du décès",
        'config.application.deathOnTimeFeeChangeNotification':
          'Mise à jour des frais de décès à temps',
        'config.application.deathRegTargetChangeNotification':
          "Mise à jour des jours cibles d'enregistrement des décès",
        'config.application.deathTabTitle': 'Décès',
        'config.application.marriageTabTitle': 'Mariage',
        'config.application.marriageLegallySpecifiedDialogTitle':
          "Délai légalement spécifié pour l'enregistrement du mariage",
        'config.application.marriageDelayedFeeChangeNotification':
          'Frais de retard de mariage mis à jour',
        'config.application.marriageOnTimeFeeChangeNotification':
          'Frais de mariage à temps mis à jour',
        'config.application.marriageRegTargetChangeNotification':
          "Jours cibles d'enregistrement des mariages mis à jour",
        'config.application.delayedFeeDialogTitle':
          "Frais d'inscription pour les inscriptions tardives",
        'config.application.delayedRegistrationLabel': 'Enregistrement retardé',
        'config.application.delayedRegistrationValue': 'Après {lateTime} jours',
        'config.application.eventTargetInputLabel': 'jours',
        'config.application.example': 'Exemple',
        'config.application.export': 'Exportieren',
        'config.application.generalTabTitle': 'Général',
        'config.application.govermentLogoLabel': 'Logo du gouvernement',
        'config.application.govtLogoChangeError':
          'Impossible de modifier le logo. Veuillez réessayer.',
        'config.application.govtLogoChangeNotification':
          'Mise à jour du logo du gouvernement',
        'config.application.govtLogoFileLimitError':
          'Le fichier image du logo doit être inférieur à 2 Mo',
        'config.application.invalidExample': 'Invalide',
        'config.application.lateFeeDialogTitle':
          "Frais d'inscription pour les inscriptions tardives",
        'config.application.lateRegistrationLabel': 'Inscription tardive',
        'config.application.lateRegistrationValue':
          'Entre {onTime} jours et {lateTime} jours',
        'config.application.legallySpecifiedLabel': 'Spécifié légalement',
        'config.application.legallySpecifiedValue': 'Sur {onTime} jours',
        'config.application.nameChangeMessage':
          'Choisissez un nom pour votre système CRVS',
        'config.application.vsExportDownloadFailed':
          "Désolé ! Quelque chose s'est mal passé",
        'config.application.nidPatternChangeError':
          'Expression régulière invalide pour un identifiant national',
        'config.application.nidPatternChangeMessage':
          'Expression régulière invalide pour un identifiant national',
        'config.application.nidPatternChangeNotification':
          "Mise à jour du modèle regex pour le numéro d'identification unique (UIN)",
        'config.application.nidPatternTitle':
          "Numéro d'identification unique (UIN), par exemple la carte d'identité nationale.",
        'config.application.onTimeFeeDialogTitle':
          "Droits d'inscription dans le délai légal",
        'config.application.pattern': 'Patronage',
        'config.application.phoneNumberChangeError':
          'Expression régulière invalide pour un numéro de téléphone',
        'config.application.phoneNumberChangeMessage':
          'Définissez le modèle regex pour le numéro de téléphone de votre pays. Pour obtenir des conseils, veuillez consulter le site www.regex101.com',
        'config.application.phoneNumberChangeNotification':
          'Mise à jour du modèle de regex téléphonique',
        'config.informantNotification.title': "Notifications d'informateurs",
        'config.informantNotification.subtitle':
          "Sélectionnez les notifications à envoyer à l'informateur pour le tenir informé de l'avancement de sa déclaration. Votre système est configuré pour envoyer {communicationType}",
        'config.informantNotification.inProgressSMS':
          'Notification envoyée au bureau',
        'config.informantNotification.declarationSMS':
          'Déclaration envoyée pour examen',
        'config.informantNotification.registrationSMS':
          'Déclaration enregistrée',
        'config.informantNotification.rejectionSMS': 'Déclaration rejetée',
        'config.informantNotification.success':
          'Mise à jour des notifications des informateurs',
        'config.userRoles.title': 'Rôles des utilisateurs',
        'config.userRoles.subtitle':
          "Associez les rôles d'utilisateur à chaque rôle système afin que les autorisations et les privilèges spécifiques soient correctement attribués. Pour en savoir plus sur les différents rôles système, voir ... {link}",
        'config.userRoles.systemRoles': 'RÔLES SYSTÈME',
        'config.userRoles.systemRoleSuccessMsg':
          'Rôle système mis à jour avec succès',
        'config.userRoles.role': 'RÔLE',
        'config.userRoles.roleUpdateInstruction':
          'Ajoutez les rôles auxquels attribuer le rôle système de {systemRole}',
        'config.application.phoneNumberExampleLabel': 'exemple: {example}',
        'config.application.phoneNumberLabel': 'Numéro de téléphone',
        'config.application.phoneNumberPatternLabel': 'motif: {pattern}',
        'config.application.phoneNumberPatternTitle':
          'Regex du numéro de téléphone',
        'config.application.registrationFeesGroupTitle': "Droits d'inscription",
        'config.application.registrationTimePeriodsGroupTitle':
          "Périodes d'enregistrement",
        'config.application.settings': 'Application',
        'config.advanced.search': 'Recherche avancée',
        'config.advanced.search.instruction':
          'Sélectionnez les options pour construire une recherche avancée. Un minimum de deux paramètres de recherche est requis.',
        'config.application.testNumber': 'Numéro de test',
        'config.application.validExample': 'Valable',
        'config.application.vitalStatistics':
          'Mois-{month}-Farajaland-{event, select, birth{birth} death{death} other{birth}}-Ereignis-Statistik.csv {fileSize}',
        'config.application.vsexport': 'Statistiques vitales',
        'config.application.emptystate':
          "Les données statistiques vitales du mois précédent (basées sur les enregistrements d'événements vitaux survenus au cours de ce mois) seront disponibles pour l'exportation à partir du 1er de chaque mois. Les grands fichiers CSV ne peuvent pas être ouverts dans Excel et doivent donc être ouverts dans un programme statistique tel que {posit}.",
        'config.application.withinLegallySpecifiedTimeLabel':
          'Dans les délais prévus par la loi',
        'config.application.govtLogoChangeMessage':
          'Téléchargez le logo du gouvernement qui sera utilisé sur le login et la décalcomanie du formulaire. Notez que le logo du certificat est téléchargé dans le cadre du modèle de certificat.',
        'config.birthDefaultTempDesc': "Modèle d'acte de naissance par défaut",
        'config.birthTemplate': 'Certificat de naissance',
        'config.birthUpdatedTempDesc': 'Mise à jour de {birthLongDate}',
        'config.deathUpdatedTempDesc': 'Mise à jour de {deathLongDate}',
        'config.eventUpdatedTempDesc':
          'Mis à jour {lastModified, date, ::dd MMMM yyyy}',
        'config.certificate.certificateUpdated':
          'Le certificat {eventName} a été mis à jour.',
        'config.certificate.certificateUploading':
          'Téléchargement et validation du certificat {eventName}.',
        'config.certificate.certificateValidationError':
          'Impossible de lire le SVG. Veuillez vérifier',
        'config.certificate.uploadCertificateDialogCancel': 'Annuler',
        'config.certificate.uploadCertificateDialogConfirm': 'Télécharger',
        'config.certificate.uploadCertificateDialogDescription':
          'Ceci remplacera le modèle de certificat actuel. Nous vous recommandons de télécharger le modèle de certificat existant comme référence.',
        'config.certificate.uploadCertificateDialogTitle':
          'Télécharger un nouveau certificat ?',
        'config.certificate.template': 'Gabarit',
        'config.certificate.allowPrinting':
          "Permettre l'impression à l'avance de l'émission",
        'config.certificate.options': 'Options',
        'config.certificate.printDescription':
          'Les documents imprimés avant les collectes seront ajoutés à la liste des documents prêts à être délivrés',
        'config.certificate.allowPrintingNotification':
          "Permettre l'impression avant la mise à jour de l'émission",
        'config.certificateConfiguration': 'Configuration du certificat',
        'config.deathDefaultTempDesc':
          'Modèle de certificat de décès par défaut',
        'config.deathTemplate': 'Acte de mariage',
        'config.marriageDefaultTempDesc':
          'Modèle de certificat de mariage par défaut',
        'config.marriageTemplate': 'Certificat de mariage',
        'config.downloadTemplate': 'Télécharger',
        'config.integrations': 'Intégrations',
        'config.listDetails':
          'Pour savoir comment modifier un SVG et télécharger un certificat en fonction des exigences de votre pays, veuillez consulter ce guide détaillé.',
        'config.listDetailsQsn': 'Comment configurer un certificat ?',
        'config.listTitle': 'La certification',
        'config.certTemplate': 'Modèle de certificat',
        'config.previewTemplate': 'Prévisualisation',
        'config.printTemplate': 'Imprimer',
        'config.uploadTemplate': 'Télécharger',
        'config.application.backgroundImageError':
          "Impossible de modifier l'image. Veuillez réessayer.",
        'config.application.loginBackgroundLabel': 'Historique de la connexion',
        'config.application.loginImageText':
          "Téléchargez une image et définissez comment vous souhaitez qu'elle s'affiche en arrière-plan.",
        'config.application.imageTabTitle': 'Image',
        'config.application.colourTabTitle': 'Couleur',
        'config.application.colourTabText': 'Code hexadécimal',
        'config.application.backgroundImageChangeNotification':
          "Mise à jour de l'image de fond",
        'config.application.backgroundImageFileLimitError':
          "Le fichier de l'image d'arrière-plan doit être inférieur à 2 Mo",
        'conflicts.modal.assign.description':
          "Veuillez noter que vous aurez un accès exclusif à cet enregistrement. Veuillez effectuer rapidement les mises à jour éventuelles, sinon vous désassignez l'enregistrement.",
        'conflicts.modal.assign.title': 'Attribuer un enregistrement ?',
        'conflicts.modal.assigned.description':
          '{name} à {officeName} a un accès unique et modifiable à cet enregistrement.',
        'conflicts.modal.assigned.title': 'Enregistrement assigné',
        'conflicts.modal.regUnassign.description':
          '{name} de {officeName} a actuellement le seul accès éditable à cet enregistrement. Si vous désassignez cet enregistrement, ses modifications actuelles seront perdues. Veuillez confirmer que vous souhaitez continuer.',
        'conflicts.modal.selfUnassign.description':
          'La désaffectation de cet enregistrement entraînera la perte de toutes les modifications en cours. Veuillez confirmer que vous souhaitez continuer.',
        'conflicts.modal.unassign.title': "Désaffecter l'enregistrement ?",
        'constants.notificationSent': 'Notification envoyée',
        'constants.refresh': 'Rafraîchir',
        'constants.marriage': 'Mariage',
        'constants.marriages': 'Mariages',
        'constants.duplicateOf': 'Duplicata de',
        'constants.matchedTo': 'Apparié à',
        'constants.sentForReview': 'Envoyé pour révision',
        'constants.sentForValidation': 'Envoyé pour validation',
        'constants.sentForUpdates': 'Envoyé pour les mises à jour',
        'constants.sentForApproval': 'Envoyé pour approbation',
        'constants.event': 'Événement',
        'constants.address': 'Adresse',
        'constants.ageVerificationApiUser':
          "Service API de vérification de l'âge",
        'constants.allEvents': 'Tous les événements',
        'constants.allStatuses': 'Tous les statuts',
        'constants.apiUser': 'Utilisateur API',
        'constants.applicationArchivedOn': 'Application archivée le',
        'constants.applicationName': 'OpenCRVS',
        'constants.archived_declaration': 'Archivé',
        'constants.integrations': 'Intégrations',
        'constants.assignRecord': 'Affecter un enregistrement',
        'constants.averageRateOfRegistrations':
          'Moyenne. {amount}% de la valeur',
        'constants.birth': 'Naissance',
        'constants.births': 'Naissances',
        'constants.by': 'Par',
        'constants.label.action': 'Action',
        'constants.label.date': 'Date',
        'constants.certificationPaymentTitle':
          'Paiement perçu pour les certificats {event, select, birth{birth} death{death} other{birth}}.',
        'constants.certified': 'certifiés',
        'constants.cha': 'CHA',
        'constants.chairman': 'Président',
        'constants.collected': 'Collecté par',
        'constants.collectedBy': 'Collecté par',
        'constants.comment': 'Commentaire',
        'constants.certificate.title': 'Certificat',
        'constants.application.title': 'Application',
        'constants.form.title': 'Formulaires de déclaration',
        'constants.config': 'Configuration',
        'constants.countryName': 'Farajaland',
        'constants.customTimePeriod': 'Période personnalisée',
        'constants.dataEntryClerk': 'Commis à la saisie des données',
        'constants.dateOfDeclaration': 'Date de la déclaration',
        'constants.daughter': 'Fille',
        'constants.death': 'Décès',
        'constants.deaths': 'Décès',
        'constants.declaration': 'Déclaration',
        'constants.declarationCollectedOn': 'Certificat collecté le',
        'constants.declarationFailedOn': "Échec de l'envoi le",
        'constants.declarationRegisteredOn': 'Enregistré le',
        'constants.declarationRejectedOn': 'Déclaration rejetée le',
        'constants.declarationRequestedCorrectionOn':
          'Déclaration demandant une correction le',
        'constants.declarations': 'Déclarations',
        'constants.declarationsCount': 'Déclarations ({totalItems})',
        'constants.declarationSentForExternalValidationOn':
          'Déclaration envoyée pour validation externe le',
        'constants.declarationStarted': 'Déclaration commencée',
        'constants.declarationStartedBy': 'Commencée par',
        'constants.declarationStartedOn': 'Commencée le',
        'constants.declarationState': 'Déclaration {action} le',
        'constants.declarationSubmittedOn': 'Déclaration soumise le',
        'constants.declarationUpdatedOn': 'Mise à jour le',
        'constants.declarationValidatedOn': 'Déclaration révisée le',
        'constants.declrationArchivedOn': 'Demande archivée le',
        'constants.districtRegistrar': "Officier d'état civil de district",
        'constants.dnrpc': 'DNRPC',
        'constants.healthcareWorker': 'Travailleur de la santé',
        'constants.policeOfficer': 'Agent de police',
        'constants.socialWorker': 'Travailleur social',
        'constants.localLeader': 'Leader local',
        'constants.dob': 'D.o.B.',
        'constants.dod': 'D.o.D.',
        'constants.downloaded': 'Téléchargé',
        'constants.downloading': 'Téléchargement...',
        'constants.entrepeneur': 'Entrepeneur',
        'constants.estimatedNumberOfEvents':
          'Estimation{lineBreak}no. de {eventType, select, birth {birth} death {death} other {birth}}s',
        'constants.estimatedNumberOfRegistartion':
          "Nombre estimé d'enregistrements",
        'constants.estimatedTargetDaysRegistrationTitle':
          "Estimation du nombre total d'enregistrements dans les {registrationTargetDays} jours",
        'constants.eventDate': "Date de l'événement",
        'constants.eventType': 'évènement',
        'constants.registeredAt': 'Enregistré à',
        'constants.registeredBy': 'Enregistré par',
        'constants.export': 'Exportation',
        'constants.extendedFamily': 'Famille élargie',
        'constants.failedToSend': "N'a pas réussi à envoyer",
        'constants.father': 'Père',
        'constants.female': 'Femme',
        'constants.femaleOver18': 'Femme de plus de 18 ans',
        'constants.femaleUnder18': 'Femme de moins de 18 ans',
        'constants.fieldAgent': 'Agent de terrain',
        'constants.from': 'De',
        'constants.gender': 'Sexe',
        'constants.healthDivision': 'Division de la santé',
        'constants.history': 'Histoire',
        'constants.id': 'ID',
        'constants.informant': 'Informateur',
        'constants.informantContactNumber':
          "Numéro de contact de l'informateur",
        'constants.issuedBy': 'Délivré par',
        'constants.language': 'Langue',
        'constants.last12Months': '12 derniers mois',
        'constants.last30Days': '30 derniers jours',
        'constants.lastEdited': 'Dernière édition',
        'constants.lastUpdated': 'Dernière mise à jour',
        'constants.loadMore': 'Charger plus',
        'constants.localRegistrar': 'Registrar',
        'constants.localSystemAdmin': 'Administrateur système (local)',
        'constants.location': 'Localisation',
        'constants.login': 'Connexion',
        'constants.male': 'Homme',
        'constants.maleOver18': 'Homme de plus de 18 ans',
        'constants.maleUnder18': 'Homme Moins de 18 ans',
        'constants.mayor': 'Maire',
        'constants.month': 'Mois',
        'constants.mother': 'Mère',
        'constants.name': 'Nom',
        'constants.nationalRegistrar': 'Greffier national',
        'constants.nationalSystemAdmin': 'Administrateur du système national',
        'constants.noNameProvided': 'Aucun nom fourni',
        'constants.noResults': 'Aucun résultat',
        'constants.noResultsOutbox': 'Aucun document à traiter',
        'constants.notificationApiUser': "Rôle de l'API de notification",
        'constants.orgDivision': 'Division ORG',
        'constants.over5Years': 'Plus de 5 ans',
        'constants.password': 'Mot de passe',
        'constants.pendingConnection': 'Connexion en attente',
        'constants.percentageOfEstimation': "Pourcentage de l'estimation",
        'constants.performance': 'Performance',
        'constants.performanceManagement': 'Responsable de la performance',
        'constants.phoneNumber': 'Numéro de téléphone',
        'constants.emailAddress': 'Adresse e-mail',
        'constants.user.role': 'Rôle',
        'constants.user.systemRole': 'Rôle du système',
        'constants.PIN': 'NIP',
        'constants.rateOfRegistrationWithinTargetd':
          "Taux dans les {registrationTargetDays}{lineBreak} jours de l'événement",
        'constants.rateOfRegistrationWithinYears':
          "Taux dans les {num} {num, plural, =0 {année} =1 {année} other {années}} de l'événement",
        'constants.reason': 'Raison',
        'constants.record': 'Dossier',
        'constants.registrationNumber': "N° d'enregistrement",
        'constants.issueCertificate': 'Certificat de délivrance',
        'constants.collectorDetails': 'Détails du collecteur',
        'constants.issueToMother': "Délivrance à l'informateur (Mère)",
        'constants.issueToFather': "Délivrance à l'informateur (Père)",
        'constants.issueToGroom': "Délivrer à l'informateur (Groom)",
        'constants.issueToBride': "Délivrer à l'informateur (Mariée)",
        'constants.issueToSomeoneElse': "Délivrer à quelqu'un d'autre",
        'constants.issueToInformant': 'Delivery to informant',
        'constants.issueConfirmationMessage':
          "Veuillez confirmer que le certificat a été délivré à l'informateur ou au collecteur.",
        'constants.idCheckWithoutVerify': "Continuer sans preuve d'identité?",
        'constants.requestReason': 'Motif de la demande',
        'constants.registered': 'Enregistré',
        'constants.inReview.status': 'En cours de révision',
        'constants.incomplete.status': 'Incomplet ',
        'constants.requiresUpdates.status': 'Nécessite des mises à jour',
        'constants.registered.status': 'Enregistré',
        'constants.registeredInTargetd':
          'Enregistré dans les {registrationTargetDays} jours',
        'constants.registeredWithinTargetd':
          "Enregistré dans un délai de{lineBreak}{registrationTargetDays} jours de l'événement",
        'constants.registrationAgent': "Responsable de l'enregistrement",
        'constants.rejected': 'rejeté',
        'constants.rejectedDays': 'Rejeté {text}',
        'constants.relationship': 'Relation',
        'constants.requestedCorrection': 'correction demandée',
        'constants.review': 'Examen',
        'constants.role': 'Rôle',
        'constants.systemrole': 'Rôle du système',
        'constants.search': 'Recherche',
        'constants.secretary': 'Secrétaire',
        'constants.sending': 'Envoi...',
        'constants.sent_incomplete': 'Envoyé incomplet',
        'constants.sentForUpdatesOn': 'Envoyé pour les mises à jour sur',
        'constants.sentOn': 'Envoyé le',
        'constants.showMore': 'Afficher la page suivante {pageSize}',
        'constants.son': 'Fils',
        'constants.spouse': 'Conjoint',
        'constants.startedAt': 'Commencé par',
        'constants.startedBy': 'Commencé par',
        'constants.stateRegistrar': 'État civil',
        'constants.status': 'Statut',
        'constants.submissionStatus': 'Statut de soumission',
        'constants.submitted': 'soumis',
        'constants.draft': 'Brouillon',
        'constants.timeFramesTitle':
          "{event, select, birth{Birth} death{Death} other{Birth}} enregistré par période, à partir de la date de l'événement",
        'constants.timeInProgress': 'Temps en cours',
        'constants.timePeriod': 'Période de temps',
        'constants.timeReadyForReview': 'Temps prêt pour la révision',
        'constants.timeReadyToPrint': "Temps prêt pour l'impression",
        'constants.timeRequireUpdates': 'Temps en attente de mise à jour',
        'constants.timeWaitingExternalValidation':
          'Temps de validation externe',
        'constants.timeWatingApproval': "Temps en attente d'approbation",
        'constants.to': "jusqu'à",
        'constants.toCapitalized': "Jusqu'à",
        'constants.total': 'Total',
        'constants.totalRegistered': 'Total{lineBreak}enregistré',
        'constants.totalRegisteredInTargetDays':
          'Total enregistré en {registrationTargetDays} jours',
        'constants.trackingId': 'ID de suivi',
        'constants.type': 'Type',
        'constants.update': 'Mise à jour',
        'constants.updated_declaration': 'Déclaration actualisée',
        'constants.updated': 'Mise à jour de',
        'constants.user': 'Utilisateur',
        'constants.username': "Nom d'utilisateur",
        'constants.validated': 'validés',
        'constants.validatorApiUser': "Rôle de l'API du validateur",
        'constants.viewAll': 'Afficher tout',
        'constants.waitingToSend': "En attente d'envoi",
        'constants.waitingValidated': 'En attente de validation',
        'constants.waitingValidation': 'envoyé pour validation',
        'constants.week': 'Semaine',
        'constants.within1YearTo5Years': '1 an - 5 ans',
        'constants.withinTargetDays': 'Dans les {registrationTargetDays} jours',
        'constants.withinTargetDaysTo1Year':
          'jours {registrationTargetDays} - 1 an',
        'constants.requireUpdatesLoading': 'Vérifier vos déclarations',
        'constants.noConnection': 'Pas de connexion',
        'constants.totalFileSizeExceed':
          'La taille totale des documents dépasse {fileSize}. Veuillez réduire la taille de vos téléchargements',
        'constants.skipToMainContent': 'Sauter au contenu principal',
        'verifyCertificate.loading': 'Vérification du certificat',
        'verifyCertificate.timeOut': 'Le temps est écoulé',
        'verifyCertificate.successTitle': 'Code QR valide',
        'verifyCertificate.successMessage':
          "Comparez les données partielles de l'enregistrement ci-dessous avec celles qui figurent sur le certificat.",
        'verifyCertificate.errorTitle': 'Code QR non valide',
        'verifyCertificate.errorMessage':
          "Le certificat est un faux potentiel, s'il vous plaît...",
        'verifyCertificate.successUrl': 'Vérification des URL',
        'verifyCertificate.fullname': 'Nom et prénom',
        'verifyCertificate.dateOfBirth': 'Date de naissance',
        'verifyCertificate.dateOfDeath': 'Date du décès',
        'verifyCertificate.sex': 'Sexe',
        'verifyCertificate.placeOfBirth': 'Lieu de naissance',
        'verifyCertificate.placeOfDeath': 'Lieu du décès',
        'verifyCertificate.registrationCenter': "Centre d'enregistrement",
        'verifyCertificate.registar': 'Nom du registraire',
        'verifyCertificate.createdAt': 'Date de la certification',
        'verifyCertificate.brn': 'BRN',
        'verifyCertificate.drn': 'DRN',
        'verifyCertificate.toastMessage':
          'Après avoir vérifié le certificat, veuillez fermer la fenêtre du navigateur.',
        'verifyCertificate.sexFemale': 'Femme',
        'verifyCertificate.sexMale': 'Homme',
        'correction.certificate.corrector.idCheck':
          "Vérifiez la preuve d'identité. Correspond-elle aux détails suivants ?",
        'correction.certificate.corrector.idCheckVerify': 'Oui',
        'correction.certificate.corrector.idCheckWithoutVerify': 'Non',
        'correction.certificate.corrector.otherIdCheck':
          "Avez-vous vérifié leur preuve d'identification ?",
        'correction.corrector.anotherAgent':
          "Un autre agent d'enregistrement ou un agent de terrain",
        'correction.corrector.birth.note':
          "Note : Si l'enfant a atteint l'âge légal (18 ans), il est le seul à pouvoir demander une modification de son acte de naissance.",
        'correction.corrector.child': 'Enfant',
        'correction.corrector.court': 'Tribunal',
        'correction.corrector.error':
          'Veuillez sélectionner la personne qui corrige le certificat',
        'correction.corrector.father': 'Père',
        'correction.corrector.idCheck':
          "Vérifiez la preuve d'identité. Correspond-elle aux détails suivants ?",
        'correction.corrector.idCheckVerify': 'Oui',
        'correction.corrector.idCheckWithoutVerify': 'Non',
        'correction.corrector.informant': 'Informateur',
        'correction.corrector.legalGuardian': 'Tuteur légal',
        'correction.corrector.me': 'Moi',
        'correction.corrector.mother': 'Mère',
        'correction.corrector.otherIdCheck':
          "Avez-vous vérifié leur preuve d'identité ?",
        'correction.corrector.others': "Quelqu'un d'autre",
        'correction.corrector.title':
          'Qui demande une modification de ce dossier ?',
        'correction.corrector.description':
          "Sachez que si vous poursuivez, vous serez responsable de la modification de cet enregistrement sans la preuve d'identification nécessaire",
        'correction.corrector.bride': 'Mariée',
        'correction.corrector.groom': 'Marié',
        'correction.informant.error': "Veuillez choisir qui est l'informateur",
        'correction.name': 'Correction',
        'correction.reason.additionalComment':
          'Un commentaire supplémentaire ?',
        'correction.reason.clericalError':
          "Moi-même ou un agent avons fait une erreur (erreur d'écriture)",
        'correction.reason.error': 'Veuillez indiquer la raison du changement',
        'correction.reason.judicialOrder':
          'Demandé par le tribunal (Ordonnance judiciaire)',
        'correction.reason.materialError':
          "L'informateur a fourni des informations incorrectes (erreur matérielle)",
        'correction.reason.materialOmission':
          "L'informateur n'a pas fourni cette information (Omission matérielle)",
        'correction.reason.reasonForChange': 'Motif de la correction',
        'correction.reason.title': 'Quelle était la raison de la correction ?',
        'correction.request': 'Correction demandée',
        'correction.summary.addComments': 'Ajouter des commentaires',
        'correction.summary.comments': 'Commentaires',
        'correction.summary.correction': 'Correction',
        'correction.summary.feesRequired': 'Frais exigés ?',
        'correction.summary.feesRequiredPositive': 'Oui',
        'correction.summary.feesRequiredNegative': 'Non',
        'correction.summary.idCheck': "Contrôle d'identité",
        'correction.summary.item': 'Point',
        'correction.summary.original': 'Original',
        'correction.summary.proofOfPayment': 'Preuve de paiement',
        'correction.summary.required': 'Nécessaire pour la correction',
        'correction.summary.proofOfPaymentRequired':
          'Une preuve de paiement est requise',
        'correction.summary.totalPaymentLabel': 'Total {currency}',
        'correction.summary.reasonForRequest': 'Raison de la demande',
        'correction.summary.requestedBy': 'Demandée par',
        'correction.summary.supportingDocuments': "Documents à l'appui",
        'correction.summary.title': 'Résumé de la correction',
        'correction.summary.idCheckForCorrection':
          "Correct sans pièce d'identité ?",
        'correction.supportingDocuments.attestToSeeCorrectionDocument':
          "J'atteste avoir vu les documents justificatifs et en avoir une copie déposée à mon bureau.",
        'correction.supportingDocuments.docTypeAffidavitProof': 'Affidavit',
        'correction.supportingDocuments.docTypeCourtDocument':
          'Document du tribunal',
        'correction.supportingDocuments.docTypeOther': 'Autre',
        'correction.supportingDocuments.noDocumentsRequiredForCorrection':
          'Aucune pièce justificative requise',
        'correction.supportingDocuments.proofOfLegalDocuments':
          'Preuve des documents de correction légale',
        'correction.supportingDocuments.select.placeholder': 'Sélectionnez',
        'correction.supportingDocuments.subtitle':
          "Pour toutes les corrections d'enregistrements",
        'correction.supportingDocuments.supportDocumentForCorrection':
          'Vérifier le document justificatif ?',
        'correction.supportingDocuments.title':
          'Télécharger les documents justificatifs',
        'correction.title': "Corriger l'enregistrement",
        'countries.ABW': 'Aruba',
        'countries.AFG': 'Afghanistan',
        'countries.AGO': 'Angola',
        'countries.AIA': 'Anguilla',
        'countries.ALA': 'Îles Åland',
        'countries.ALB': 'Albanie',
        'countries.AND': 'Andorre',
        'countries.ARE': 'Emirats Arabes Unis',
        'countries.ARG': 'Argentine',
        'countries.ARM': 'Arménie',
        'countries.ASM': 'Samoa Américaine',
        'countries.ATA': 'Antarctique',
        'countries.ATF': 'Terres australes françaises',
        'countries.ATG': 'Antigua et Barbuda',
        'countries.AUS': 'Australie',
        'countries.AUT': 'Autriche',
        'countries.AZE': 'Azerbaïdjan',
        'countries.BDI': 'Burundi',
        'countries.BEL': 'Belgique',
        'countries.BEN': 'Bénin',
        'countries.BES': 'Bonaire, Sint Eustatius et Saba',
        'countries.BFA': 'Burkina Faso',
        'countries.BGD': 'Bangladesh',
        'countries.BGR': 'Bulgarie',
        'countries.BHR': 'Bahreïn',
        'countries.BHS': 'Bahamas',
        'countries.BIH': 'Bosnie-Herzégovine',
        'countries.BLM': 'Saint Barthélemy',
        'countries.BLR': 'Bélarus',
        'countries.BLZ': 'Belize',
        'countries.BMU': 'Bermudes',
        'countries.BOL': 'Bolivie (État plurinational de)',
        'countries.BRA': 'Brésil',
        'countries.BRB': 'Barbade',
        'countries.BRN': 'Brunei Darussalam',
        'countries.BTN': 'Bhoutan',
        'countries.BVT': 'Bouvet, île',
        'countries.BWA': 'Botswana',
        'countries.CAF': 'République Centrafricaine',
        'countries.CAN': 'Canada',
        'countries.CCK': 'Cocos (Keeling), îles',
        'countries.CHE': 'Suisse',
        'countries.CHL': 'Chili',
        'countries.CHN': 'Chine',
        'countries.CIV': "Côte d'Ivoire",
        'countries.CMR': 'Cameroun',
        'countries.COD': 'République démocratique du Congo',
        'countries.COG': 'Congo',
        'countries.COK': 'Cook Islands',
        'countries.COL': 'Colombie',
        'countries.COM': 'Comores',
        'countries.CPV': 'Cabo Verde',
        'countries.CRI': 'Costa Rica',
        'countries.CUB': 'Cuba',
        'countries.CUW': 'Curaçao',
        'countries.CXR': 'Île Christmas',
        'countries.CYM': 'Caïmans (îles)',
        'countries.CYP': 'Chypre',
        'countries.CZE': 'Tchécoslovaquie',
        'countries.DEU': 'Allemagne',
        'countries.DJI': 'Djibouti',
        'countries.DMA': 'Dominique',
        'countries.DNK': 'Danemark',
        'countries.DOM': 'République Dominicaine',
        'countries.DZA': 'Algérie',
        'countries.ECU': 'Équateur',
        'countries.EGY': 'Égypte',
        'countries.ERI': 'Érythrée',
        'countries.ESH': 'Sahara occidental',
        'countries.ESP': 'Espagne',
        'countries.EST': 'Estonie',
        'countries.ETH': 'Éthiopie',
        'countries.FAR': 'Farajaland',
        'countries.FIN': 'Finlande',
        'countries.FJI': 'Fidji',
        'countries.FLK': 'Falkland Islands (Malvinas)',
        'countries.FRA': 'France',
        'countries.FRO': 'Îles Féroé',
        'countries.FSM': 'Micronésie (Etats fédérés de)',
        'countries.GAB': 'Gabon',
        'countries.GBR': "Royaume-Uni de Grande-Bretagne et d'Irlande du Nord",
        'countries.GEO': 'Géorgie',
        'countries.GGY': 'Guernesey',
        'countries.GHA': 'Ghana',
        'countries.GIB': 'Gibraltar',
        'countries.GIN': 'Guinée',
        'countries.GLP': 'Guadeloupe',
        'countries.GMB': 'Gambie',
        'countries.GNB': 'Guinée-Bissau',
        'countries.GNQ': 'Guinée équatoriale',
        'countries.GRC': 'Grèce',
        'countries.GRD': 'Grenade',
        'countries.GRL': 'Groenland',
        'countries.GTM': 'Guatemala',
        'countries.GUF': 'Guyane française',
        'countries.GUM': 'Guam',
        'countries.GUY': 'Guyane',
        'countries.HKG': 'Chine, région administrative spéciale de Hong Kong',
        'countries.HMD': 'Île Heard et îles McDonald',
        'countries.HND': 'Honduras',
        'countries.HRV': 'Croatie',
        'countries.HTI': 'Haïti',
        'countries.HUN': 'Hongrie',
        'countries.IDN': 'Indonésie',
        'countries.IMN': 'Ile de Man',
        'countries.IND': 'Inde',
        'countries.IOT': "Territoire britannique de l'océan Indien",
        'countries.IRL': 'Irlande',
        'countries.IRN': "Iran (République islamique d')",
        'countries.IRQ': 'Irak',
        'countries.ISL': 'Islande',
        'countries.ISR': 'Israël',
        'countries.ITA': 'Italie',
        'countries.JAM': 'Jamaïque',
        'countries.JEY': 'Jersey',
        'countries.JOR': 'Jordanie',
        'countries.JPN': 'Japon',
        'countries.KAZ': 'Kazakhstan',
        'countries.KEN': 'Kenya',
        'countries.KGZ': 'République démocratique populaire lao',
        'countries.KHM': 'Cambodge',
        'countries.KIR': 'Kiribati',
        'countries.KNA': 'Saint-Kitts-et-Nevis',
        'countries.KOR': 'République de Corée',
        'countries.KWT': 'Koweït',
        'countries.LBN': 'Liban',
        'countries.LBR': 'Liberia',
        'countries.LBY': 'Libye',
        'countries.LCA': 'Sainte-Lucie',
        'countries.LIE': 'Liechtenstein',
        'countries.LKA': 'Sri Lanka',
        'countries.LSO': 'Lesotho',
        'countries.LTU': 'Lituanie',
        'countries.LUX': 'Luxembourg',
        'countries.LVA': 'Lettonie',
        'countries.MAC': 'Chine, Région administrative spéciale de Macao',
        'countries.MAF': 'Saint Martin (partie française)',
        'countries.MAR': 'Maroc',
        'countries.MCO': 'Monaco',
        'countries.MDA': 'République de Moldavie',
        'countries.MDG': 'Madagascar',
        'countries.MDV': 'Maldives',
        'countries.MEX': 'Mexique',
        'countries.MHL': 'Îles Marshall',
        'countries.MKD': "L'ancienne République yougoslave de Macédoine",
        'countries.MLI': 'Mali',
        'countries.MLT': 'Malte',
        'countries.MMR': 'Myanmar',
        'countries.MNE': 'Monténégro',
        'countries.MNG': 'Mongolie',
        'countries.MNP': 'Mariannes du Nord (îles)',
        'countries.MOZ': 'Mozambique',
        'countries.MRT': 'Mauritanie',
        'countries.MSR': 'Montserrat',
        'countries.MTQ': 'Martinique',
        'countries.MUS': 'Maurice',
        'countries.MWI': 'Malawi',
        'countries.MYS': 'Malaisie',
        'countries.MYT': 'Mayotte',
        'countries.NAM': 'Namibie',
        'countries.NCL': 'Nouvelle-Calédonie',
        'countries.NER': 'Niger',
        'countries.NFK': 'Île Norfolk',
        'countries.NGA': 'Nigeria',
        'countries.NIC': 'Nicaragua',
        'countries.NIU': 'Niue',
        'countries.NLD': 'Pays-Bas',
        'countries.NOR': 'Norvège',
        'countries.NPL': 'Népal',
        'countries.NRU': 'Nauru',
        'countries.NZL': 'Nouvelle-Zélande',
        'countries.OMN': 'Oman',
        'countries.PAK': 'Pakistan',
        'countries.PAN': 'Panama',
        'countries.PCN': 'Pitcairn',
        'countries.PER': 'Pérou',
        'countries.PHL': 'Philippines',
        'countries.PLW': 'Palau',
        'countries.PNG': 'Papouasie-Nouvelle-Guinée',
        'countries.POL': 'Pologne',
        'countries.PRI': 'Porto Rico',
        'countries.PRK': 'République populaire démocratique de Corée',
        'countries.PRT': 'Portugal',
        'countries.PRY': 'Paraguay',
        'countries.PSE': 'Etat de Palestine',
        'countries.PYF': 'Polynésie française',
        'countries.QAT': 'Qatar',
        'countries.REU': 'Réunion',
        'countries.ROU': 'Roumanie',
        'countries.RUS': 'Fédération de Russie',
        'countries.RWA': 'Rwanda',
        'countries.SAU': 'Arabie Saoudite',
        'countries.SDN': 'Soudan',
        'countries.SEN': 'Sénégal',
        'countries.SGP': 'Singapour',
        'countries.SGS': 'Géorgie du Sud et les îles Sandwich du Sud',
        'countries.SHN': 'Sainte-Hélène',
        'countries.SJM': 'Svalbard et Jan Mayen (îles)',
        'countries.SLB': 'Salomon (îles)',
        'countries.SLE': 'Sierra Leone',
        'countries.SLV': 'El Salvador',
        'countries.SMR': 'Saint-Marin',
        'countries.SOM': 'Somalie',
        'countries.SPM': 'Saint Pierre et Miquelon',
        'countries.SRB': 'Serbie',
        'countries.SSD': 'Sud-Soudan',
        'countries.STP': 'Sao Tomé et Principe',
        'countries.SUR': 'Suriname',
        'countries.SVK': 'Slovaquie',
        'countries.SVN': 'Slovénie',
        'countries.SWE': 'Suède',
        'countries.SWZ': 'Eswatini',
        'countries.SXM': 'Sint Maarten (partie néerlandaise)',
        'countries.SYC': 'Seychelles',
        'countries.SYR': 'République arabe syrienne',
        'countries.TCA': 'Îles Turks et Caicos',
        'countries.TCD': 'Tchad',
        'countries.TGO': 'Togo',
        'countries.THA': 'Thaïlande',
        'countries.TJK': 'Tadjikistan',
        'countries.TKL': 'Tokelau',
        'countries.TKM': 'Turkménistan',
        'countries.TLS': 'Timor-Leste',
        'countries.TON': 'Tonga',
        'countries.TTO': 'Trinité-et-Tobago',
        'countries.TUN': 'Tunisie',
        'countries.TUR': 'Turquie',
        'countries.TUV': 'Tuvalu',
        'countries.TZA': 'République-Unie de Tanzanie',
        'countries.UGA': 'Ouganda',
        'countries.UKR': 'Ukraine',
        'countries.UMI': 'Îles mineures éloignées des États-Unis',
        'countries.URY': 'Uruguay',
        'countries.USA': "États-Unis d'Amérique",
        'countries.UZB': 'Ouzbékistan',
        'countries.VAT': 'Saint-Siège',
        'countries.VCT': 'Saint-Vincent-et-les-Grenadines',
        'countries.VEN': 'Venezuela (République bolivarienne du)',
        'countries.VGB': 'Vierges britanniques (îles)',
        'countries.VIR': 'Vierges américaines (îles)',
        'countries.VNM': 'Viet Nam',
        'countries.VUT': 'Vanuatu',
        'countries.WLF': 'Wallis et Futuna (îles)',
        'countries.WSM': 'Samoa',
        'countries.YEM': 'Yémen',
        'countries.ZAF': 'Afrique du Sud',
        'countries.ZMB': 'Zambie',
        'countries.ZWE': 'Zimbabwe',
        'custom.field.form.heading': 'Certificat guidon',
        'custom.field.text.heading': 'Saisie de texte personnalisé',
        'custom.field.textarea.heading': 'Zone de texte personnalisée',
        'custom.field.number.heading': "Saisie d'un numéro personnalisé",
        'custom.field.phone.heading': 'Numéro de téléphone personnalisé',
        'custom.field.form.hideField': 'Masquer le champ',
        'custom.field.form.requiredField': "Requis pour l'enregistrement",
        'custom.field.form.conditionalFieldHeader': 'Paramètres conditionnels',
        'custom.field.form.conditionalField': 'Champ conditionnel',
        'custom.field.form.conditionalFieldDesc':
          'Sélectionnez le champ et les conditions dans lesquelles ce champ doit apparaître.',
        'custom.field.form.conditionalRegex': 'Valeur RegEx',
        'custom.field.form.label': 'Étiquette',
        'custom.field.form.placeholder': 'Placeholder',
        'custom.field.form.description': 'Description',
        'custom.field.form.tooltip': 'Info-bulle',
        'custom.field.form.errorMessage': "Message d'erreur",
        'custom.field.form.maxLength': 'Longueur maximale',
        'custom.field.form.duplicateField':
          "L'étiquette existe déjà dans cette section du formulaire. Veuillez créer une étiquette unique",
        'custom.field.form.unit': 'Unité',
        'custom.field.form.unitOptionG': 'Gramme (g)',
        'custom.field.form.unitOptionKg': 'Kilogramme (Kg)',
        'custom.field.form.unitOptionCm': 'Centimeter (Cm)',
        'custom.field.form.unitOptionM': 'Centimètre (Cm)',
        'custom.field.form.unitOptionEmpty': 'Aucune',
        'custom.field.form.inputWidth': "Largeur d'entrée",
        'config.form.settings.time': "Saisie de l'heure",
        'config.form.tools.input.customSelectWithDynamicOptions':
          'Sélection personnalisée avec options dynamiques',
        'duplicates.warning':
          "Duplicata potentiel avec l'enregistrement {trackingId}",
        'duplicates.review.header': 'Potentiel {event} examen en double',
        'duplicates.content.title':
          'Est-ce que {nom} ({trackingId}) est un doublon ?',
        'duplicates.content.subtitle':
          'Cet enregistrement a été signalé comme un doublon potentiel de : {trackingIds}. Veuillez les examiner en cliquant sur chaque identifiant de suivi dans la section des onglets pour afficher une comparaison côte à côte ci-dessous et confirmer si cet enregistrement est un doublon',
        'duplicates.button.notDuplicate': 'Pas un duplicata',
        'duplicates.button.markAsDuplicate': 'Marquer comme duplicata',
        'duplicates.content.notDuplicateConfirmationTitle':
          "Êtes-vous sûr que {name} ({trackingId}) n'est pas en double?",
        'duplicates.content.markAsDuplicate':
          'Marquer {trackingId} comme dupliqué?',
        'duplicates.content.duplicateDropdownMessage': 'Duplicata de',
        'duplicates.content.markAsDuplicateReason':
          'Veuillez décrire votre raison',
        'duplicates.compare.title':
          'Comparez {actualTrackingId} avec {duplicateTrackingId}',
        'duplicates.compare.supportingDocuments': 'Documents justificatifs',
        'duplicates.content.header': 'Détails de la déclaration',
        'error.code': '401',
        'error.draftFailed':
          "Il s'agit d'un message indiquant à l'utilisateur ce qu'il doit faire... en cas d'échec de la déclaration.",
        'error.occurred': "Une erreur s'est produite. Veuillez réessayer.",
        'error.page.load.failed':
          "Désolé, nous n'avons pas pu charger le contenu de cette page.",
        'error.passwordSubmissionError':
          "Désolé que le mot de passe n'ait pas fonctionné",
        'error.required.password': "Le nouveau mot de passe n'est pas valide",
        'error.search': "Une erreur s'est produite lors de la recherche",
        'error.somethingWentWrong': "Quelque chose s'est mal passé.",
        'error.title.unauthorized': 'Non autorisé !',
        'error.title': 'Oups !',
        'error.userListError': 'Impossible de charger les utilisateurs',
        'error.weAreTryingToFixThisError':
          "Ce n'est pas vous, c'est nous. C'est notre faute.",
        'fieldAgentHome.allUpdatesText':
          'Bon travail ! Vous avez mis à jour toutes les déclarations',
        'fieldAgentHome.inProgressCount': 'En cours ({total})',
        'fieldAgentHome.queryError':
          "Une erreur s'est produite lors du chargement des déclarations",
        'fieldAgentHome.requireUpdatesCount':
          'Mises à jour nécessaires ({total})',
        'fieldAgentHome.requireUpdatesCountLoading':
          'Vérification de vos déclarations',
        'fieldAgentHome.sentForReviewCount': 'Envoyées pour révision ({total})',
        'fieldAgentHome.zeroUpdatesText':
          'Aucune déclaration ne nécessite de mise à jour',
        'form.field.showLabel': 'Afficher',
        'form.field.hideLabel': 'Cacher',
        'form.field.nidNotVerified': 'Authentifier',
        'form.field.nidVerified': 'Authentifié',
        'form.field.nidOffline':
          "L'authentification de la carte d'identité nationale n'est actuellement pas disponible hors ligne.",
        'form.field.nidNotVerifiedReviewSection': 'Non authentifié',
        'form.field.label.addFile': 'Télécharger',
        'form.field.label.updatingUser': "Mise à jour de l'utilisateur",
        'form.field.label.uploadFile': 'Télécharger',
        'form.field.label.addressLine1RuralOption': 'Village',
        'form.field.label.addressLine2': 'Zone / Quartier / Mouja / Village',
        'form.field.label.addressLine2UrbanOption': 'Rue / Numéro de parcelle',
        'form.field.label.addressLine3': 'Union / Municipalité / Cantonment',
        'form.field.label.addressLine1UrbanOption': 'Zone résidentielle',
        'form.field.label.cityUrbanOption': 'Ville',
        'form.field.label.secondaryAddressSameAsOtherSecondary':
          "L'adresse secondaire est-elle la même que celle de la mère ?",
        'form.field.label.app.phoneVerWarn':
          "Vérifiez auprès de l'informateur que le numéro de téléphone mobile que vous avez indiqué est correct.",
        'form.field.label.app.whoContDet.app': 'Informateur',
        'form.field.label.app.whoContDet.both': 'Les deux parents',
        'form.field.label.app.whoContDet.brother': 'Frère',
        'form.field.label.app.whoContDet.daughterInLaw': 'Belle-fille',
        'form.field.label.app.whoContDet.father': 'Père',
        'form.field.label.app.whoContDet.grandDaughter': 'Petite-fille',
        'form.field.label.app.whoContDet.grandFather': 'Grand-père',
        'form.field.label.app.whoContDet.grandMother': 'Grand-mère',
        'form.field.label.app.whoContDet.grandSon': 'Petit-fils',
        'form.field.label.app.whoContDet.legalGuardian': 'Tuteur légal',
        'form.field.label.app.whoContDet.mother': 'Mère',
        'form.field.label.app.certifyRecordTo.mother':
          "Imprimer et délivrer à l'informateur (Mère)",
        'form.field.label.app.certifyRecordTo.father':
          "Imprimer et délivrer à l'informateur (Père)",
        'form.field.label.app.whoContDet.other': 'Autre',
        'form.field.label.app.whoContDet.sister': 'Sœur',
        'form.field.label.app.whoContDet.sonInLaw': 'Beau-fils ou belle-fille',
        'form.field.label.app.whoContDet.spouse': 'Conjoint',
        'form.field.label.appCurrAddSameAsPerm':
          "L'adresse permanente de l'informateur est-elle la même que son adresse actuelle ?",
        'form.field.label.assignedResponsibilityProof':
          "Preuve de l'attribution de la responsabilité",
        'form.field.label.attBirthOtherParaPers': 'Autre personnel paramédical',
        'form.field.label.attendantAtBirth': 'Accoucheur',
        'form.field.label.attendantAtBirthLayperson': 'Laïque',
        'form.field.label.attendantAtBirthMidwife': 'Sage-femme',
        'form.field.label.layReported': 'Lay a déclaré',
        'form.field.label.attendantAtBirthNone': 'Aucun',
        'form.field.label.attendantAtBirthNurse': 'Infirmière',
        'form.field.label.attendantAtBirthOther': 'Autre',
        'form.field.label.physician': 'Médecin',
        'form.field.label.deathDescription': 'Description',
        'form.field.label.attendantAtBirthTraditionalBirthAttendant':
          'Accoucheur traditionnel',
        'form.field.label.birthLocation': 'Hôpital / Clinique',
        'form.field.label.birthType': "Type d'accouchement",
        'form.field.label.birthTypeHigherMultipleDelivery':
          'Accouchement multiple supérieur',
        'form.field.label.birthTypeQuadruplet': 'Quadruplet',
        'form.field.label.birthTypeSingle': 'Simple',
        'form.field.label.birthTypeTriplet': 'Triplet',
        'form.field.label.birthTypeTwin': 'Jumeau',
        'form.field.label.caregiver.father': 'Père',
        'form.field.label.caregiver.informant':
          "L'informateur est le principal responsable des soins",
        'form.field.label.caregiver.legalGuardian': 'Tuteur légal',
        'form.field.label.caregiver.mother': 'Mère',
        'form.field.label.caregiver.other': 'Autre dispensateur de soins',
        'form.field.label.caregiver.parents': 'Mère et père',
        'form.field.label.causeOfDeathProof': 'Preuve de la cause du décès',
        'form.field.label.causeOfDeathMethod': 'Source de la cause du décès',
        'form.field.label.causeOfDeathEstablished':
          'La cause du décès a été établie',
        'form.field.label.certificatePrintInAdvance':
          "Imprimer à l'avance pour les signatures et la collecte",
        'form.field.label.dateOfBirth': 'Date de naissance',
        'form.field.label.childFamilyName': 'Nom de famille',
        'form.field.label.childFirstNames': 'Prénom(s)',
        'form.field.label.sex': 'Sexe',
        'form.field.label.sexFemale': 'Femme',
        'form.field.label.sexMale': 'Homme',
        'form.field.label.childSexOther': 'Autre',
        'form.field.label.sexUnknown': 'Inconnu',
        'form.field.label.confirm': 'Oui',
        'form.field.label.corrector.supportDocumentSubtitle':
          'Pour toutes les corrections de dossiers, il faut au moins fournir un affidavit. Pour les erreurs matérielles et les omissions, par exemple dans les cas de paternité, une décision de justice doit également être fournie.',
        'form.field.label.country': 'Pays',
        'form.field.label.secondaryAddress': 'Adresse secondaire',
        'form.field.label.secondaryAddressSameAsPermanent':
          'Son lieu de résidence habituel est-il le même que son adresse résidentielle ?',
        'form.field.label.dateOfMarriage': 'Date du mariage',
        'form.field.label.deathAtFacility':
          "Dans quel hôpital le décès s'est-il produit ?",
        'form.field.label.deathAtOtherLocation':
          "Quelle est l'autre adresse où le décès a eu lieu ?",
        'form.field.label.deathAtPrivateHome':
          "Quelle est l'adresse de la maison privée ?",
        'form.field.label.deathDate':
          'Indiquez la date sous la forme : jour, mois, année, par exemple 24 10 2020',
        'form.field.label.deathPlace': 'Lieu de survenance du décès',
        'form.field.label.placeOfDeath': "Où le décès s'est-il produit ?",
        'form.field.label.placeOfDeathOther': 'Adresse différente',
        'form.field.label.placeOfDeathSameAsCurrent':
          'Adresse actuelle du défunt',
        'form.field.label.placeOfDeathSameAsPermanent':
          'Adresse permanente du défunt',
        'form.field.label.placeOfDeathType': 'Type de lieu',
        'form.field.label.nationality': 'Nationalité',
        'form.field.label.deceasedCurAddSamePerm':
          "L'adresse actuelle du défunt est-elle la même que son adresse permanente ?",
        'form.field.label.deceasedDeathProof': 'Preuve du décès du défunt',
        'form.field.label.deceasedDoBProof':
          'Preuve de la date de naissance de la personne décédée',
        'form.field.label.deceasedDocumentParagraph':
          "Pour l'enregistrement d'un décès, les documents suivants sont requis :",
        'form.field.label.deceasedFamilyName':
          "Nom(s) de famille dans un jeu de caractères par défaut autre que l'anglais",
        'form.field.label.deceasedFathersFamilyNameEng':
          'Nom(s) de famille en anglais',
        'form.field.label.deceasedFathersGivenNamesEng': 'Prénom(s) en anglais',
        'form.field.label.deceasedGivenNames':
          "Prénom(s) dans un jeu de caractères par défaut autre que l'anglais",
        'form.field.label.deceasedIDProof':
          "Preuve de l'identité de la personne décédée",
        'form.field.label.deceasedIdType': "Pièce d'identité existante",
        'form.field.label.deceasedMothersFamilyNameEng':
          'Nom(s) de famille en anglais',
        'form.field.label.deceasedMothersGivenNamesEng': 'Prénom(s) en anglais',
        'form.field.label.deceasedPrimaryAddressProof':
          "Preuve de l'adresse permanente de la personne décédée",
        'form.field.label.deceasedSecondaryAddressSameAsPrimary':
          'Leur adresse secondaire était-elle la même que leur adresse principale ?',
        'form.field.label.deceasedSexOther': 'Autre',
        'form.field.label.deceasedSpousesFamilyNameEng':
          'Nom(s) de famille en anglais',
        'form.field.label.deceasedSpousesGivenNamesEng': 'Prénom(s) en anglais',
        'form.field.label.declaration.certificateLanguage':
          "Dans quelles langues l'informateur souhaite-t-il que le certificat soit établi ?",
        'form.field.label.declaration.certLang.other': 'Autre',
        'form.field.label.declaration.comment.desc':
          'Utilisez cette section pour ajouter tout commentaire ou note qui pourrait être pertinent pour remplir et certifier cette déclaration. Ces informations ne seront pas communiquées aux informateurs.',
        'form.field.label.declaration.commentsOrNotes': 'Commentaires ou notes',
        'form.field.label.declaration.phone': 'Numéro de téléphone',
        'form.field.label.declaration.whoIsPresent.both': 'Les deux parents',
        'form.field.label.declaration.whoIsPresent.father': 'Père',
        'form.field.label.declaration.whoIsPresent.mother': 'Mère',
        'form.field.label.declaration.whoIsPresent.other': 'Autre',
        'form.field.label.declaration.whoIsPresent':
          'Qui est présent pour la déclaration',
        'form.field.label.declaration.whoseContactDetails':
          'Qui est la personne de contact pour cette déclaration ?',
        'form.field.label.defaultLabel': "L'étiquette va ici",
        'form.field.label.deliveryAddress': "Adresse du lieu d'accouchement",
        'form.field.label.deliveryInstitution':
          "Tapez ou sélectionnez l'institution",
        'form.field.label.deny': 'Non',
        'form.field.label.district': 'District',
        'form.field.label.docTypeHospitalDeathCertificate':
          "Certificat de décès de l'hôpital",
        'form.field.label.docTypebirthAttendant':
          "Preuve de naissance fournie par l'accoucheur",
        'form.field.label.docTypeBirthCert': 'Certificat de la naissance',
        'form.field.label.docTypeChildAgeProof': "Preuve de l'âge de l'enfant",
        'form.field.label.docTypeChildBirthProof':
          'Notification de la naissance',
        'form.field.label.docTypeCopyOfBurialReceipt':
          "Copie certifiée du reçu d'enterrement",
        'form.field.label.docTypeCoronersReport': 'Rapport du coroner',
        'form.field.label.docTypeDeathCertificate':
          'Certificat de décès attesté',
        'form.field.label.docTypeDoctorCertificate': 'Certificat médical',
        'form.field.label.docTypeEPICard': 'Carte PEV',
        'form.field.label.docTypeEPIStaffCertificate':
          'Certificat du personnel du PEV',
        'form.field.label.docTypeFuneralReceipt':
          "Copie certifiée conforme du reçu d'obsèques",
        'form.field.label.docTypeLetterOfDeath': 'Lettre de décès attestée',
        'form.field.label.docTypeMedicalInstitution':
          "Preuve de naissance provenant d'un établissement médical",
        'form.field.label.docTypeNID': "Carte d'identité nationale",
        'form.field.label.docTypeOther': 'Autre',
        'form.field.label.docTypePassport': 'Passeport',
        'form.field.label.docTypePoliceCertificate':
          'Certificat de décès de la police',
        'form.field.label.docTypePostMortemReport':
          "Rapport d'autopsie certifié",
        'form.field.label.docTypeSC': 'Certificat de scolarité',
        'form.field.label.docTypeSignedAffidavit': 'Affidavit signé',
        'form.field.label.docTypeTaxReceipt':
          'Récépissé de paiement des impôts',
        'form.field.label.educationAttainmentISCED1': 'Primaire',
        'form.field.label.educationAttainmentISCED2': 'Secondaire inférieur',
        'form.field.label.educationAttainmentISCED3': 'Secondaire supérieur',
        'form.field.label.educationAttainmentISCED4': 'Secondaire',
        'form.field.label.educationAttainmentISCED5': 'Tertiaire',
        'form.field.label.educationAttainmentISCED6': 'Second degré tertiaire',
        'form.field.label.educationAttainmentNone': 'Pas de scolarité',
        'form.field.label.educationAttainmentNotStated': 'Non déclaré',
        'form.field.label.father.nationality': 'Nationalité',
        'form.field.label.father.nationalityBangladesh': 'Bangladesh',
        'form.field.label.fatherFamilyName':
          "Nom(s) de famille dans un jeu de caractères par défaut autre que l'anglais",
        'form.field.label.fatherFirstNames':
          "Prénom(s) dans un jeu de caractères par défaut autre que l'anglais",
        'form.field.label.fatherIsDeceased': 'Le père est décédé',
        'form.field.label.fatherPrimaryAddress':
          'Quelle est son adresse résidentielle ?',
        'form.field.label.fatherPlaceOfBirth':
          "Quel est son village d'origine ?",
        'form.field.label.fathersDetailsExist':
          'Les détails du père ne sont pas disponibles',
        'form.field.label.mothersDetailsExist':
          'Les coordonnées de la mère ne sont pas disponibles',
        'form.field.label.exactDateOfBirthUnknown':
          'Date de naissance exacte inconnue',
        'form.field.label.fetchDeceasedDetails':
          "VÉRIFIER L'IDENTITÉ NATIONALE",
        'form.field.label.fetchFatherDetails': "VÉRIFIER L'IDENTITÉ NATIONALE",
        'form.field.label.fetchIdentifierModalErrorTitle': 'Id. non valide',
        'form.field.label.fetchIdentifierModalSuccessTitle': 'ID valide',
        'form.field.label.fetchIdentifierModalTitle': 'Vérification de',
        'form.field.label.fetchInformantDetails':
          "VÉRIFIER L'IDENTITÉ NATIONALE",
        'form.field.label.fetchMotherDetails': "VÉRIFIER L'IDENTITÉ NATIONALE",
        'form.field.label.fetchPersonByNIDModalErrorText':
          "L'identifiant national n'a pas été trouvé.  Veuillez saisir un identifiant national et une date de naissance valides.",
        'form.field.label.fetchPersonByNIDModalInfo': 'ID national',
        'form.field.label.fetchRegistrationModalErrorText':
          'Aucun enregistrement trouvé pour le BRN fourni',
        'form.field.label.fetchRegistrationModalInfo':
          "Numéro d'enregistrement de naissance",
        'form.field.label.fileUploadError': '{type} supporté uniquement',
        'form.field.label.fileSizeError':
          'La taille du fichier doit être inférieure à 2 Mo',
        'form.field.label.firstName': 'Prénom',
        'form.field.label.firstNames': 'Prénom(s)',
        'form.field.label.firstNameEN': 'Prénom anglais',
        'form.field.label.healthInstitution': 'Institution de santé',
        'form.field.label.placeOfDeathSameAsPrimary':
          'Lieu de résidence habituel du défunt',
        'form.field.label.hospital': 'Hôpital',
        'form.field.label.iD': "Numéro d'identification",
        'form.field.label.iDType': "Type d'identification",
        'form.field.label.iDTypeAlienNumber': "Numéro d'étranger",
        'form.field.label.iDTypeBRN': "Numéro d'enregistrement de naissance",
        'form.field.label.iDTypeDrivingLicense': 'Permis de conduire',
        'form.field.label.iDTypeDRN': "Numéro d'enregistrement de décès",
        'form.field.label.iDTypeNationalID': "Carte d'identité nationale",
        'form.field.label.iDTypeNoID': "Aucune pièce d'identité disponible",
        'form.field.label.iDTypeOther': 'Autre',
        'form.field.label.iDTypeOtherLabel': "Autre type de carte d'identité",
        'form.field.label.iDTypePassport': 'Passeport',
        'form.field.label.iDTypeRefugeeNumber': 'Numéro de réfugié',
        'form.field.label.imageUpload.uploadedList': 'Téléchargé :',
        'form.field.label.informant': 'Informateur',
        'form.field.label.informantAthorityToApplyProof':
          "Preuve de l'autorité de l'informateur pour faire la demande",
        'form.field.label.proofOfInformantsID': "Identité de l'informateur",
        'form.field.label.informantOtherRelationship': 'Autre lien de parenté',
        'form.field.label.informantPrimaryAddress':
          "Quelle est l'adresse de leur domicile ?",
        'form.field.label.informantSecondaryAddress': 'Adresse secondaire',
        'form.field.label.informantSecondaryAddressSameAsPrimary':
          'Leur adresse secondaire est-elle la même que leur adresse principale ?',
        'form.field.label.informantRelation.contactPoint': 'point de contact',
        'form.field.label.informantRelation.brother': 'Frère',
        'form.field.label.informantRelation.daughter': 'Fille',
        'form.field.label.informantRelation.daughterInLaw':
          'Fille par alliance',
        'form.field.label.informantRelation.driver':
          "Conducteur ou opérateur du véhicule terrestre ou maritime ou de l'aéronef où le décès a eu lieu.",
        'form.field.label.informantRelation.extendedFamily': 'Famille élargie',
        'form.field.label.informantRelation.father': 'Père',
        'form.field.label.informantRelation.granddaughter': 'Petite-fille',
        'form.field.label.informantRelation.grandfather': 'Grand-père',
        'form.field.label.informantRelation.grandmother': 'Grand-mère',
        'form.field.label.informantRelation.grandson': 'Petit-fils',
        'form.field.label.informantRelation.headInst':
          "Chef de l'établissement où le décès a eu lieu",
        'form.field.label.informantRelation.legalGuardian': 'Tuteur légal',
        'form.field.label.informantRelation.mother': 'Mère',
        'form.field.label.informantRelation.officer':
          "Officier responsable d'une route ou d'un espace public où le décès a eu lieu.",
        'form.field.label.informantRelation.other': 'Autre(Précisez)',
        'form.field.label.informantRelation.others': 'Autre',
        'form.field.label.informantRelation.owner':
          'Propriétaire de la maison ou du bâtiment où le décès a eu lieu.',
        'form.field.label.informantRelation.sister': 'Soeur',
        'form.field.label.informantRelation.son': 'Fils',
        'form.field.label.informantRelation.sonInLaw': 'Fils par alliance',
        'form.field.label.informantRelation.spouse': 'Conjoint',
        'form.field.label.informantRelation.whoIsBirthInformant':
          "Qui est l'informateur",
        'form.field.label.informantRelation.whoIsDeathInformant':
          "Qui est l'informateur",
        'form.field.label.informants.nationality': 'Nationalité',
        'form.field.label.informantsDateOfBirth': 'Date de naissance',
        'form.field.label.informantsFamilyName':
          "Nom(s) de famille dans un jeu de caractères par défaut autre que l'anglais",
        'form.field.label.informantsFamilyNameEng':
          'Nom(s) de famille en anglais',
        'form.field.label.informantsGivenNames':
          "Prénom(s) dans un jeu de caractères par défaut autre que l'anglais",
        'form.field.label.informantsGivenNamesEng': 'Prénom(s) en anglais',
        'form.field.label.informantsIdType': 'Identifiant existant',
        'form.field.label.informantsRelationWithChild':
          "Lien de parenté avec l'enfant",
        'form.field.label.informantsRelationWithDeceased':
          'Lien de parenté avec le défunt',
        'form.field.label.internationalAddressLine1': 'Adresse ligne 1',
        'form.field.label.internationalAddressLine2': "Ligne d'adresse 2",
        'form.field.label.internationalAddressLine3': "Ligne d'adresse 3",
        'form.field.label.internationalCity': 'Ville / Village',
        'form.field.label.internationalDistrict': 'District',
        'form.field.label.internationalPostcode': 'Code postal / Zip',
        'form.field.label.internationalState': 'État',
        'form.field.label.lastName': 'Nom de famille',
        'form.field.label.lastNameEN': 'Nom de famille anglais',
        'form.field.label.otherBirthSupportingDocuments': 'Autre',
        'form.field.label.legalGuardianProof': 'Preuve de la tutelle légale',
        'form.field.label.mannerOfDeath': 'Mode de décès',
        'form.field.label.mannerOfDeathAccident': 'Accident',
        'form.field.label.mannerOfDeathHomicide': 'Homicide',
        'form.field.label.mannerOfDeathNatural': 'Cause naturelle',
        'form.field.label.mannerOfDeathSuicide': 'Suicide',
        'form.field.label.mannerOfDeathUndetermined': 'Manière indéterminée',
        'form.field.label.maritalStatus': 'État civil',
        'form.field.label.maritalStatusDivorced': 'Divorcé',
        'form.field.label.maritalStatusMarried': 'Marié(e)',
        'form.field.label.maritalStatusNotStated': 'Non déclaré',
        'form.field.label.maritalStatusSeparated': 'Séparé(e)',
        'form.field.label.maritalStatusSingle': 'Célibataire',
        'form.field.label.maritalStatusWidowed': 'Veuf(ve)',
        'form.field.label.medicallyCertified':
          'Cause du décès médicalement certifiée',
        'form.field.label.methodOfCauseOfDeath':
          'Méthode de détermination de la cause du décès',
        'form.field.label.mother.nationality': 'Nationalité',
        'form.field.label.mother.nationalityBangladesh': 'Bangladesh',
        'form.field.label.educationAttainment': "Niveau d'éducation",
        'form.field.label.motherFamilyName':
          "Nom(s) de famille dans un jeu de caractères par défaut autre que l'anglais",
        'form.field.label.motherFirstNames':
          "Prénom(s) dans un jeu de caractères par défaut autre que l'anglais",
        'form.field.label.motherIsDeceased': 'La mère est décédée',
        'form.field.label.motherPrimaryAddress':
          "Quelle est l'adresse de son domicile ?",
        'form.field.label.motherPlaceOfBirth':
          "Quel est son village d'origine ?",
        'form.field.label.motherPlaceOfHeritage':
          "Quel est son lieu d'origine (patrimoine) ?",
        'form.field.label.multipleBirth': 'Nombre de naissances antérieures',
        'form.field.label.name': 'Nom',
        'form.field.label.NID': 'NID',
        'form.field.label.NIDNetErr':
          "La demande au système NID n'a pas abouti. Veuillez réessayer avec une meilleure connexion.",
        'form.field.label.occupation': 'Profession',
        'form.field.label.optionalLabel': 'Facultatif',
        'form.field.label.otherAddress': 'Autre adresse',
        'form.field.label.otherInformantType': 'Autre lien de parenté',
        'form.field.label.otherInstitution': 'Autre',
        'form.field.label.otherOption': 'Autre',
        'form.field.label.parentDetailsType':
          'Avez-vous les coordonnées de la mère et du père ?',
        'form.field.label.deceasedPrimaryAddress': 'Lieu de résidence habituel',
        'form.field.label.deceasedSecondaryAddress': 'Adresse secondaire',
        'form.field.label.email': 'e-mail',
        'form.field.label.registrationName': "nom d'enregistrement",
        'form.field.label.informantTitle': "Coordonnées de l'informateur",
        'form.field.label.phoneNumber': 'Numéro de téléphone',
        'form.field.label.placeOfBirth': 'Lieu',
        'form.field.label.placeOfBirthPreview': "Lieu de l'accouchement",
        'form.field.label.postCode': 'Numéro',
        'form.field.label.primaryAddress': 'Lieu de résidence habituel',
        'form.field.label.primaryAddressSameAsOtherPrimary':
          'Même que le lieu de résidence habituel de la mère ?',
        'form.field.label.primaryAddressSameAsDeceasedsPrimary':
          'Le même que le lieu de résidence habituel du défunt ?',
        'form.field.label.primaryCaregiverType': "Qui s'occupe de l'enfant ?",
        'form.field.label.print.confirmMotherInformation':
          "Sa pièce d'identité correspond-elle aux informations suivantes ?",
        'form.field.label.print.documentNumber': 'Numéro du document',
        'form.field.label.familyName': 'Nom de famille',
        'form.field.label.print.otherPersonGivenNames': 'Prénom',
        'form.field.label.print.otherPersonPrompt':
          "Comme il n'y a pas de détails sur cette personne dans le dossier, nous devons saisir ses détails :",
        'form.field.label.print.signedAffidavit':
          'A-t-il une déclaration sous serment signée ?',
        'form.field.label.print.warningNotVerified':
          "Sachez que si vous poursuivez, vous serez responsable de la délivrance d'un certificat sans la preuve d'identité nécessaire du collecteur.",
        'form.field.label.privateHome': 'Adresse résidentielle',
        'form.field.label.proofOfBirth': 'Preuve de naissance',
        'form.field.label.proofOfDocCertificateOfChild':
          "Certificat du médecin attestant de l'âge de l'enfant OU certificat de scolarité",
        'form.field.label.proofOfEPICardOfChild': "Carte EPI de l'enfant",
        'form.field.label.proofOfFathersID': 'Identité du père',
        'form.field.label.proofOfMothersID': 'Identité de la mère',
        'form.field.label.proofOfParentPrimaryAddress':
          "Preuve de l'adresse permanente du parent",
        'form.field.label.radio.father': 'Seulement du père',
        'form.field.label.radio.mother': 'Seulement celles de la mère',
        'form.field.label.reasonFatherNotApplying': 'Motif du père',
        'form.field.label.reasonFatherNotApplyingPreview':
          'Raison pour laquelle le père ne fait pas de demande',
        'form.field.label.reasonNotApplying': 'Motif de la mère',
        'form.field.label.reasonMotherNotApplyingPreview':
          "Raison pour laquelle la mère ne s'est pas présentée",
        'form.field.label.registrationOffice': "Bureau d'enregistrement",
        'form.field.label.relationBrother': 'Frère',
        'form.field.label.relationGrandfather': 'Grand-père',
        'form.field.label.relationGrandmother': 'Grand-mère',
        'form.field.label.relationHouseOwner':
          'Propriétaire de la maison ou du bâtiment où la naissance a eu lieu',
        'form.field.label.relationOfficeInCharge':
          "Officier responsable d'une route ou d'un espace public où la naissance a eu lieu",
        'form.field.label.relationOperator':
          "Conducteur ou exploitant du véhicule terrestre ou maritime ou de l'aéronef où la naissance a eu lieu.",
        'form.field.label.relationOtherFamilyMember':
          'Autre membre de la famille',
        'form.field.label.relationship': 'Lien de parenté',
        'form.field.label.relationshipPlaceHolder': 'ex. Grand-mère',
        'form.field.label.relationSister': 'Sœur',
        'form.field.label.relationSomeoneElse': "Quelqu'un d'autre",
        'form.field.label.relInstHeadPlaceOfBirth':
          "Chef de l'institution où la naissance a eu lieu",
        'form.field.label.resedentialAddress':
          'Adresse résidentielle du défunt',
        'form.field.label.rural': 'Ruralitè',
        'form.field.label.secondaryAddressSameAsPrimary':
          'Leur adresse secondaire est-elle la même que leur adresse principale ?',
        'form.field.label.selectOne': 'Veuillez choisir une option',
        'form.field.label.self': 'Vous-même',
        'form.field.label.socialSecurityNumber':
          'N° de sécurité sociale /NAPSA',
        'form.field.label.someoneElse': "Quelqu'un d'autre",
        'form.field.label.someoneElseCollector':
          "Imprimer et remettre à quelqu'un d'autre",
        'form.field.label.state': 'Province',
        'form.field.label.typeOfDocument': 'Choisissez le type de document',
        'form.field.label.typeOfId': "Type d'identification",
        'form.field.label.uploadDocForChild': 'Enfant',
        'form.field.label.uploadDocForFather': 'Père',
        'form.field.label.uploadDocForMother': 'Mère',
        'form.field.label.uploadDocForOther': 'Autre',
        'form.field.label.uploadDocForWhom':
          'A qui appartient le document de soutien que vous téléchargez ?',
        'form.field.label.urban': 'Urbain',
        'form.field.label.userAttachmentSection': 'Signature',
        'form.field.label.creatingNewUser': 'Créer un nouvel utilisateur',
        'form.field.label.userDevice': 'Dispositif',
        'form.field.label.userSignatureAttachment':
          "Signature de l'utilisateur",
        'form.field.label.userSignatureAttachmentDesc':
          "Demandez à l'utilisateur de signer une feuille de papier, puis scannez ou prenez une photo.",
        'form.field.label.userSignatureAttachmentTitle': 'Joindre la signature',
        'form.field.label.verbalAutopsy': 'Autopsie verbale',
        'form.field.label.verbalAutopsyReport': "Rapport d'autopsie verbal",
        'form.field.label.weightAtBirth': 'Poids à la naissance',
        'form.field.label.ageOfMother': 'Âge de la mère',
        'form.field.label.ageOfFather': 'Âge du père',
        'form.field.label.ageOfInformant': "Âge de l'informateur",
        'form.field.label.ageOfDeceased': 'âge du défunt',
        'form.field.label.whatDocToUpload':
          'Quel type de document téléchargez-vous ?',
        'form.field.previewGroups.primaryAddress': 'Adresse résidentielle',
        'form.field.previewGroups.secondaryAddress': 'Adresse secondaire',
        'form.field.SearchField.changeButtonLabel':
          "{fieldName, select, registrationOffice {Bureau d'enregistrement assigné} autre {Instituts de santé}}",
        'form.field.SearchField.modalTitle':
          "{fieldName, select, registrationOffice {Bureau d'enregistrement assigné} autre {Instituts de santé}}",
        'form.field.SearchField.officeLocationId': 'Id : {locationId}',
        'form.field.SearchField.placeHolderText': 'Recherche',
        'form.field.select.placeholder': 'Sélectionnez',
        'form.field.tooltip.tooltipNationalID':
          "Il s'agit d'une info-bulle pour guider l'utilisateur dans la saisie de l'identifiant national.",
        'form.field.dateRangepicker.checkbox.dateLabel':
          '{rangeStart} à {rangeEnd}',
        'form.group.reasonNotApplying.parents':
          'Pourquoi la mère et le père ne font-ils pas de demande ?',
        'form.preview.group.label.english.name': 'Nom anglais',
        'form.preview.group.label.father.english.name': 'Nom anglais du père',
        'form.preview.group.label.informant.english.name':
          "Nom anglais de l'informateur",
        'form.preview.group.label.mother.english.name':
          'Nom anglais de la mère',
        'form.preview.group.label.spouse.english.name':
          'Nom anglais du conjoint',
        'form.preview.tag.other.institution': "Adresse d'une autre institution",
        'form.preview.tag.permanent.address': 'Adresse du domicile',
        'form.preview.tag.placeOfHeritage': "Lieu d'origine",
        'form.preview.tag.private.home': 'Adresse du domicile privé',
        'form.review.label.mainContact': 'Contact principal',
        'form.section.accountDetails': 'Coordonnées du compte',
        'form.section.assignedRegistrationOffice':
          'A quel bureau voulez-vous affecter un nouvel utilisateur ?',
        'form.section.assignedRegistrationOfficeGroupTitle':
          "Bureau d'enregistrement assigné",
        'form.section.causeOfDeath.name': 'Cause du décès',
        'form.section.causeOfDeath.title':
          'Quelle est la cause de décès médicalement certifiée ?',
        'form.section.causeOfDeathNotice':
          "Une cause de décès médicalement certifiée n'est pas obligatoire pour soumettre la déclaration. Elle peut être ajoutée à une date ultérieure.",
        'form.section.child.name': 'Enfant',
        'form.section.child.title': "Détails de l'enfant",
        'form.section.deathEvent.name': "Détails de l'événement de décès",
        'form.section.deathEvent.title': 'Les détails de la mort?',
        'form.section.deathEvent.date': 'Date du décès',
        'form.section.deceased.father.name':
          'Quel est le nom du père de la personne décédée ?',
        'form.section.deceased.father.title': 'Détails du père',
        'form.section.deceased.hasSpouse': 'Oui',
        'form.section.deceased.mother.name':
          'Quel est le nom de la mère de la personne décédée ?',
        'form.section.deceased.mother.title': 'Détails de la mère',
        'form.section.deceased.name': 'Défunt',
        'form.section.deceased.relationship': 'Relation avec le défunt',
        'form.section.deceased.noSpouse': 'Non / Inconnu',
        'form.section.deceased.spouse.name': 'Le défunt a-t-il un conjoint ?',
        'form.section.deceased.spouse.title': 'Coordonnées du conjoint',
        'form.section.deceased.title': 'Détails du défunt',
        'form.section.declaration.name': 'Déclaration',
        'form.section.information.name': 'Informations',
        'form.section.information.birth.bullet1':
          'Je vais vous aider à faire une déclaration de naissance.',
        'form.section.information.birth.bullet2':
          "En tant qu'informateur légal, il est important que toutes les informations que vous fournissez soient exactes.",
        'form.section.information.birth.bullet3':
          "Une fois la déclaration traitée, vous recevrez un SMS vous indiquant quand vous rendre au bureau pour retirer le certificat - Munissez-vous d'une pièce d'identité.",
        'form.section.information.birth.bullet4':
          "Veillez à récupérer le certificat. Un certificat de naissance est essentiel pour cet enfant, notamment pour lui faciliter la vie plus tard. Il l'aidera à accéder aux services de santé, aux examens scolaires et aux prestations de l'État.",
        'form.section.information.death.bullet1':
          'Je vais vous aider à faire une déclaration de décès.',
        'form.section.information.death.bullet2':
          "En tant qu'informateur légal, il est important que toutes les informations que vous fournissez soient exactes.",
        'form.section.information.death.bullet3':
          "Une fois la déclaration traitée, vous recevrez un SMS vous indiquant quand vous rendre au bureau pour retirer le certificat - Munissez-vous d'une pièce d'identité.",
        'form.section.information.death.bullet4':
          "Veillez à récupérer le certificat. Le certificat de décès est essentiel pour les demandes d'héritage et pour régler les affaires de la personne décédée, par exemple la fermeture des comptes bancaires et la mise en place des prêts.",
        'form.section.declaration.title': 'Détails de la déclaration',
        'form.section.documents.birth.requirements':
          'Les documents suivants sont requis',
        'form.section.documents.list.attestedBirthRecord':
          "Copie certifiée conforme du document de l'hôpital ou de l'acte de naissance, ou",
        'form.section.documents.list.attestedVaccination':
          'Copie certifiée conforme de la carte de vaccination (EPI), ou',
        'form.section.documents.list.certification':
          "Attestation d'un travailleur d'une ONG autorisé par l'officier d'état civil en faveur de la date de naissance, ou",
        'form.section.documents.list.informantAttestation':
          "Attestation de l'informateur, ou",
        'form.section.documents.list.otherDocuments':
          "Copie(s) certifiée(s) du document prescrit par l'officier d'état civil.",
        'form.section.documents.name': 'Documents',
        'form.section.documents.paragraphAbove5Years':
          "Pour l'enregistrement des naissances survenues après 5 ans, les documents suivants sont requis :",
        'form.section.documents.paragraphTargetdaysTo5Years':
          "Pour l'enregistrement des naissances survenues entre {BIRTH_REGISTRATION_TARGET} jours et 5 ans, les documents suivants sont requis :",
        'form.section.documents.title': 'Joindre les pièces justificatives',
        'form.section.documents.uploadImage':
          'Télécharger une photo de la pièce justificative',
        'form.section.father.name': 'Père',
        'form.section.father.title': 'Coordonnées du père',
        'form.section.informant.name': 'Informateur',
        'form.section.informant.title': "Coordonnées de l'informateur",
        'form.section.mother.name': 'Mère',
        'form.section.mother.title': 'Coordonnées de la mère',
        'form.section.primaryCaregiver.nameOrTitle': 'Détails des parents',
        'form.section.upload.documentsName': 'Téléchargement de documents',
        'form.section.upload.documentsTitle':
          'Joindre des documents justificatifs',
        'form.section.user.preview.title': 'Confirmer les détails',
        'form.section.user.title': 'Créer un nouvel utilisateur',
        'form.section.userDetails': "Détails de l'utilisateur",
        'home.header.helpTitle': 'Aide',
        'home.header.localSystemAdmin': 'Admin système local',
        'home.header.placeHolderBrnDrn': "Recherche d'un BRN/DRN",
        'home.header.placeholderName': 'Rechercher un nom',
        'home.header.placeHolderPhone': "Recherche d'un numéro de téléphone",
        'home.header.placeHolderNationalId':
          "Recherche d'une carte d'identité nationale",
        'home.header.placeHolderTrackingId': "Recherche d'un ID de suivi",
        'home.header.settingsTitle': 'Paramètres',
        'home.header.systemTitle': 'Système',
        'home.header.teamTitle': 'Équipe',
        'home.header.typeRN': "N ° d'enregistrement.",
        'home.header.typeName': 'Nom',
        'home.header.advancedSearch': 'Recherche avancée',
        'home.header.typePhone': 'N° de téléphone',
        'home.header.nationalId': "Carte d'identité nationale",
        'imageUploadOption.upload.documentType':
          "Veuillez d'abord sélectionner le type de document",
        'imageUploadOption.upload.error':
          'Format de fichier non pris en charge. Veuillez joindre un png, jpg (max 5mb)',
        'imageUploadOption.upload.imageFormat':
          "Le format d'image n'est pas supporté. Veuillez joindre un png ou un jpg (max 5mb)",
        'imageUploadOption.upload.overSized':
          'Le fichier est trop volumineux. Veuillez joindre un fichier de moins de 5mb',
        'informant.name': 'Informateur',
        'integrations.createClient': 'Créer un client',
        'integrations.pageIntroduction':
          "Pour chaque nouveau client qui doit s'intégrer à OpenCRVS, vous pouvez créer des identifiants client uniques. Un certain nombre de cas d'utilisation de l'intégration sont actuellement pris en charge, sur la base des technologies API et webhook",
        'integrations.supportingDescription':
          "Description complémentaire pour aider l'utilisateur à prendre une décision et à naviguer dans le contenu.",
        'integrations.revealKeys': 'Clés de révélation',
        'integrations.disable': 'Désactiver',
        'integrations.enable': 'Activé',
        'integrations.delete': 'Supprimer',
        'integrations.copy': 'copie',
        'integrations.recordSearchDescription':
          "Un client de recherche d'enregistrements peut effectuer une recherche avancée sur les données OpenCRVS. Pour plus d'informations, visitez :",
        'integrations.nationalidAlertDescription':
          "Un client d'identification nationale (par exemple MOSIP) peut réagir aux webhooks de naissance ou de décès pour créer ou invalider des numéros d'identification nationale, et répondre à OpenCRVS pour fournir une identification temporaire aux enfants, et relier les événements d'état civil entre eux. Pour plus d'informations, visitez le site :",
        'integrations.webhookDescription':
          "Un client Webhook peut s'abonner pour être notifié lors de l'enregistrement d'une naissance ou d'un décès selon les normes WebSub du W3C. Pour plus d'informations, consultez le site :",
        'integrations.eventNotificationDescription':
          "Un client de notification (par exemple un hôpital) peut envoyer une notification partielle ou une déclaration complète d'une naissance ou d'un décès dans la norme HL7 FHIR à OpenCRVS pour traitement. Pour plus d'informations, consultez le site :",
        'integrations.integratingSystemTypeMosip': 'MOSIP',
        'integrations.integratingSystemTypeOsia': 'OSIA (Prochainement)',
        'integrations.integratingSystemTypeOther': 'Autres',
        'integrations.integratingSystemType': 'Système',
        'integrations.integratingSystemTypeAlertMosip':
          "Lorsque le type d'identification nationale \"MOSIP\" est activé, tous les formulaires requièrent l'authentification E-Signet. est activé, tous les formulaires requièrent l'authentification MOSIP E-Signet. Le MOSIP Token Seeder et le médiateur MOSIP compatible avec le webhook OpenCRVS doivent être installés. Pour plus d'informations, visitez le site:",
        'integrations.integratingSystemTypeAlertOsia':
          "Lorsque l'option \"OSIA\" National ID est activée, les points de terminaison compatibles avec le cas d'utilisation de la naissance seront activés. Pour plus d'informations, visitez le site:",
        'integrations.integratingSystemTypeAlertOther':
          'Lorsque l\'option "Other ID" est activée, le médiateur OpenCRVS National ID par défaut doit être installé. Pour plus d\'informations, visitez le site:',
        'integrations.name': 'Nom',
        'integrations.nationalIDName': 'Nom',
        'integrations.client.type': 'Type',
        'integrations.label': 'Étiquette',
        'integrations.webhookPermissionsDescription':
          'Sélectionnez les données que vous souhaitez voir figurer dans les données utiles du webhook.',
        'integrations.webhook.PII': 'Inclure les données PII',
        'integrations.birth': 'Naissance',
        'integrations.death': 'Décès',
        'integrations.type.eventNotification': "Notification d'événement",
        'integrations.type.nationalID': "Carte d'identité nationale",
        'integrations.childDetails': 'Détails sur les enfants',
        'integrations.motherDetails': 'Détails sur les mères',
        'integrations.documentDetails': 'Détails du document',
        'integrations.deathEventDetails': "Détails de l'événement de décès",
        'integrations.fatherDetails': 'Détails sur les pères',
        'integrations.informantDetails': "Détails de l'informateur",
        'integrations.registrationDetailsnNoPII':
          "Détails de l'enregistrement (pas de PII)",
        'integrations.childDetailsNoPII': "Détails sur l'enfant (pas de PII)",
        'integrations.motherDetailsNoPII': 'Détails sur la mère (pas de PII)',
        'integrations.fatherDetailsNoPII': 'Détails du père (pas de PII)',
        'integrations.informantDetailsNoPII':
          "Détails de l'informateur (pas de PII)",
        'integrations.type.recordSearch': "Recherche d'enregistrements",
        'integrations.type.webhook': 'Webhook',
        'integrations.otherAlertDescription': '...Veuillez visiter',
        'integrations.active': 'Actif',
        'integrations.inactive': 'Inactif',
        'integrations.loading': 'Chargement',
        'integrations.error': 'Quelque chose a mal tourné',
        'integrations.activate.client': 'Activer le client?',
        'integrations.activate.status': 'Client activé',
        'integrations.deactivate.status': 'Client désactivé',
        'integrations.deactivate.client': 'Désactiver le client?',
        'integrations.activatetext': 'Cela va activer le client',
        'integrations.deactivatetext': 'Cela va désactiver le client',
        'integrations.updatePermissionsMsg':
          'Mise à jour des permissions avec succès',
        'integrations.diseaseDetails': 'Détails de la maladie',
        'integrations.deleteSystemText': 'Cela supprimera le système',
        'integrations.deleteSystemMsg': 'Le système a été supprimé avec succès',
        'integrations.pageTitle': 'Intégrations',
        'navigation.integration': 'Intégrations',
        'navigation.communications': 'Communications',
        'navigation.userroles': 'Rôles des utilisateurs',
        'navigation.informantNotification': 'Notifications des informateurs',
        'integrations.type.healthSystem': 'Intégration de la santé',
        'integrations.newIntegrationDescription':
          'Ajoutez un nom unique et sélectionnez le type de client que vous souhaitez créer',
        'integrations.onlyOneNationalId':
          "Une seule intégration d'identité nationale est autorisée",
        'informant.title': "Sélectionner l'informateur",
        'integrations.clientId': 'ID du client',
        'integrations.clientSecret': 'Secret du client',
        'integrations.shaSecret': 'SHA Secret',
        'integrations.uniqueKeyDescription':
          'Ces clés uniques seront requises par le client intégrant...',
        'form.field.label.locationLevel3': 'Emplacement Niveau 3',
        'form.field.label.locationLevel4': 'Emplacement Niveau 4',
        'form.field.label.locationLevel5': 'Emplacement Niveau 5',
        'form.field.label.informantRelation.groomAndBride':
          'Le marié et la mariée',
        'form.field.label.informantRelation.groom': 'Marié',
        'form.field.label.informantRelation.bride': 'Mariée',
        'form.section.groom.name': 'Marié',
        'form.section.groom.title': 'Détails du marié',
        'form.section.bride.name': 'Mariée',
        'form.section.bride.title': 'Détails de la mariée',
        'form.section.groom.headOfGroomFamily': 'Chef de la famille du marié',
        'form.section.bride.headOfBrideFamily':
          'Chef de la famille de la mariée',
        'form.field.label.ageOfGroom': 'Âge du marié',
        'form.field.label.ageOfBride': 'Âge de la mariée',
        'form.section.marriageEvent.date': 'Date du mariage',
        'form.field.label.placeOfMarriage': 'Lieu du mariage',
        'form.field.label.typeOfMarriage': 'Type de mariage',
        'form.field.label.polygamy': 'Polygame',
        'form.field.label.monogamy': 'Monogame',
        'form.section.witnessOne.title': 'Détails du témoin 1',
        'form.section.witnessTwo.title': 'Détails du témoin 2',
        'form.section.witness.name': 'Témoin',
        'form.field.label.relationshipToSpouses': 'Relation avec les époux',
        'form.preview.group.label.witness.one.english.name':
          'Témoin un nom anglais',
        'form.preview.group.label.witness.two.english.name':
          'Témoin deux nom anglais',
        'form.section.marriageEvent.name': "Détails de l'événement de mariage",
        'form.section.marriageEvent.title': 'Détails du mariage',
        'form.field.label.marriedLastName':
          'Marié Nom de famille (si différent)',
        'form.field.label.proofOfMarriageNotice':
          "Déclaration d'intention de mariage",
        'form.field.label.lastNameAtBirth':
          'Nom de famille à la naissance (si différent de ci-dessus)',
        'form.field.label.docTypeMarriageNotice': 'Avis de mariage',
        'form.field.label.proofOfGroomsID': "Preuve de l'identité du marié",
        'form.field.label.proofOfBridesID': "Preuve de l'identité de la mariée",
        'misc.createDescription':
          'Choisissez un code PIN qui ne comporte pas 4 chiffres répétitifs ou des numéros séquentiels.',
        'misc.createTitle': 'Créer un code PIN',
        'misc.description.Complete':
          'En envoyant pour approbation, vous confirmez que la déclaration est prête à être approuvée.',
        'misc.description.inComplete':
          'Des informations obligatoires sont manquantes. Veuillez ajouter ces informations afin de pouvoir les envoyer pour approbation.',
        'misc.newPass.header': 'Choisissez un nouveau mot de passe',
        'misc.newPass.instruction':
          "Nous vous recommandons de créer un mot de passe unique - un mot de passe que vous n'utilisez pas pour un autre site Web ou une autre application. Remarque. Vous ne pouvez pas réutiliser votre ancien mot de passe une fois que vous l'avez modifié.",
        'misc.notif.declarationsSynced':
          "Comme vous disposez d'une connectivité, nous pouvons synchroniser vos déclarations.",
        'misc.notif.draftsSaved': 'Votre brouillon a été enregistré',
        'misc.notif.outboxText': "Boîte d'envoi({num})",
        'misc.notif.processingText': 'Traitement de la déclaration {num}...',
        'misc.notif.sorryError': "Désolé ! Quelque chose s'est mal passé",
        'misc.notif.unassign': 'Vous avez été désassigné de {trackingId}',
        'misc.notif.onlineUserStatus': 'Vous êtes de nouveau en ligne',
        'misc.notif.updatePINSuccess':
          'Votre code a été mis à jour avec succès',
        'misc.notif.userAuditSuccess':
          '{name} était {action, select, DEACTIVATE {désactivé} REACTIVATE {réactivé} other{désactivé}}',
        'misc.notif.userFormSuccess': 'Nouvel utilisateur créé',
        'misc.notif.userFormUpdateSuccess':
          "Les détails de l'utilisateur ont été mis à jour",
        'misc.notif.duplicateRecord':
          "{trackingId} est un doublon potentiel. L'enregistrement est prêt à être examiné.",
        'misc.notif.offlineError': 'Hors ligne. Réessayez une fois reconnecté',
        'misc.pinMatchError':
          'Le code PIN ne correspond pas. Veuillez réessayer.',
        'misc.confirmPinTitle': 'Confirmer le PIN',
        'misc.pinSameDigitsError':
          'Le code PIN ne peut pas avoir les mêmes 4 chiffres',
        'misc.pinSeqDigitsError':
          'Le code PIN ne peut pas contenir de chiffres séquentiels',
        'misc.reEnterDescription':
          'Assurons-nous que nous avons recueilli votre code PIN correctement.',
        'misc.reEnterTitle': 'Saisissez à nouveau votre nouveau code PIN',
        'misc.session.expired':
          'Votre session a expiré. Veuillez vous connecter à nouveau.',
        'misc.title.declarationStatus':
          'Envoyer pour {draftStatus, select, true {approbation} other {approbation ou rejeter}}?',
        'misc.nidCallback.authenticatingNid':
          "Authentification de l'identité nationale",
        'misc.nidCallback.failedToAuthenticateNid':
          "Échec de l'authentification de l'ID national",
        'navigation.application': 'Application',
        'navigation.approvals': 'Envoyé pour approbation',
        'navigation.certificate': 'Certificats',
        'navigation.completenessRates': 'Taux de complétude',
        'navigation.config': 'Config',
        'navigation.declarationForms': 'Formulaires de déclaration',
        'navigation.outbox': "Boîte d'envoi",
        'navigation.performance': 'Performance',
        'navigation.print': 'Prêt à être imprimé',
        'navigation.progress': 'En cours',
        'navigation.readyForReview': 'Prêt pour la révision',
        'navigation.readyToIssue': 'Prêts à émettre',
        'navigation.requiresUpdate': 'Nécessite une mise à jour',
        'navigation.sentForReview': 'Envoyé pour révision',
        'navigation.sentForUpdates': 'Envoyé pour les mises à jour',
        'navigation.team': 'Équipe',
        'navigation.waitingValidation': 'En attente de validation',
        'navigation.reports': 'Statistiques vitales',
        'navigation.organisation': 'Organisation',
        'navigation.analytic': 'Analytique',
        'navigation.performanceStatistics': 'Statistiques',
        'navigation.leaderboards': 'Classements',
        'navigation.dashboard': 'Tableau de bord',
        'navigation.report': 'Rapport',
        'password.cases': 'Contient des majuscules et des minuscules',
        'password.label.confirm': 'Confirmez le mot de passe',
        'password.label.current': 'Mot de passe actuel',
        'password.label.new': 'Nouveau mot de passe',
        'password.match': 'Les mots de passe correspondent',
        'password.minLength': '{min} caractères minimum',
        'password.mismatch': 'Les mots de passe ne correspondent pas',
        'password.number': 'Au moins un chiffre',
        'password.validation.msg': 'Le mot de passe doit avoir :',
        'performance.fieldAgents.col.avgCompTime':
          "Délai moyen d'envoi de la déclaration complète de",
        'performance.fieldAgents.col.totInProg': 'Envoyé{linebreak}incomplet',
        'performance.fieldAgents.col.totRej': 'Rejeté',
        'performance.fieldAgents.columnHeader.name':
          'Agents de terrain ({totalAgents})',
        'performance.fieldAgents.columnHeader.office': 'Bureau',
        'performance.fieldAgents.columnHeader.startMonth': 'Mois de début',
        'performance.fieldAgents.columnHeader.totalSent':
          'Déclarations{linebreak} envoyées',
        'performance.fieldAgents.columnHeader.type': 'Type',
        'performance.fieldAgents.columnHeader.role': 'Rôle',
        'performance.fieldAgents.noResult': 'Aucun utilisateur trouvé',
        'performance.fieldAgents.options.event.births': 'Naissances',
        'performance.fieldAgents.options.event.both': 'Naissances et décès',
        'performance.fieldAgents.options.event.deaths': 'Décès',
        'performance.fieldAgents.options.status.active': 'Actif',
        'performance.fieldAgents.options.status.deactive': 'Désactivé',
        'performance.fieldAgents.options.status.pending': 'En attente',
        'performance.fieldAgents.showMore': 'Afficher le prochain {pageSize}',
        'performance.fieldAgents.title': 'Agents de terrain',
        'performance.header.sysadmin.home':
          "Recherche d'une zone administrative ou d'un bureau",
        'performance.operational.workflowStatus.header':
          'Déclarations actuelles en cours de traitement',
        'performance.ops.statCount.desc':
          'État actuel des enregistrements {event, select, BIRTH{naissance} DEATH{décès} other{naissance}} en cours de traitement.',
        'performance.regRates.column.location': 'Sites',
        'performance.regRates.select.item.byLocation': 'Par lieux',
        'performance.regRates.select.item.overTime': 'Par période',
        'performance.reports.appStart.desc':
          'Répartition totale et en pourcentage des déclarations entamées par source à partir de',
        'performance.reports.appStart.fieldAgents': 'Agents de terrain',
        'performance.reports.corrections.other.label': 'Autre',
        'performance.reports.declarationsStarted.hospitals': 'Hôpitaux (DHIS2)',
        'performance.reports.declarationsStarted.offices':
          "Bureaux d'enregistrement",
        'performance.reports.declarationsStarted.title':
          'Déclarations entamées',
        'performance.reports.declarationsStarted.total':
          'Total des déclarations entamées',
        'performance.reports.header.completenessRates': 'Taux de complétude',
        'performance.reports.header.totalCertificates': 'Certificats émis',
        'performance.reports.header.totalCorrections': 'Corrections',
        'performance.reports.header.totalPayments': 'Droits perçus',
        'performance.reports.header.totalRegistrations': 'Enregistrements',
        'performance.reports.header.applicationSources':
          'Sources des déclarations',
        'performance.reports.subHeader.applicationSources':
          'Le nombre et le pourcentage de déclarations lancées par chaque rôle du système qui ont été enregistrées.',
        'performance.reports.select.item.operational': 'Opérationnel',
        'performance.reports.select.item.reports': 'Rapports',
        'performance.reports.subHeader.completenessRates':
          "Le nombre d'enregistrements, exprimé en % du nombre total estimé de {event, select, BIRTH{naissance} DEATH{décès} other{naissances}} survenus.",
        'performance.reports.subHeader.totalCertificates':
          "Le taux de certification est le nombre de certificats émis, exprimé en pourcentage du nombre total d'enregistrements.",
        'performance.values.labels.total': 'Total',
        'performance.values.labels.delayed': 'Enregistrements tardifs',
        'performance.values.labels.birth.healthFacility':
          'Naissances dans les établissements de santé',
        'performance.values.labels.death.healthFacility':
          'Décès dans les établissements de santé',
        'performance.values.labels.birth.home': 'Naissances à domicile',
        'performance.values.labels.death.home': 'Décès à domicile',
        'performance.values.labels.male': 'Homme',
        'performance.values.labels.female': 'Femme',
        'performance.values.labels.late': 'Inscriptions tardives',
        'performance.values.labels.within1Year': 'Dans un délai de 1 an',
        'performance.values.labels.within5Years': 'Dans les 5 ans',
        'performance.values.labels.withinTargetDays':
          '{withPrefix, select, true {Enregistré dans un délai de} other {Dans un délai de}} {target} jours',
        'performance.payments.label.certificationFee': 'Frais de certification',
        'performance.payments.label.correctionFee': 'Frais de correction',
        'performance.appSrc.labels.hospitalApplications':
          'Système de santé (intégration)',
        'performance.appSrc.labels.fieldAgents': 'Agents de terrain',
        'performance.appSrc.labels.registrars': 'Greffiers',
        'performance.appSrc.labels.nationalRegistrars': 'Greffiers nationaux',
        'performance.appSrc.labels.registrationAgents':
          "Agents d'enregistrement",
        'performance.labels.certificationRate': 'Taux de certification',
        'performance.stats.header': 'Stats',
        'performance.registrarsToCitizen': 'Des greffiers aux citoyens',
        'performance.registrarsToCitizenValue': '1 à {citizen}',
        'performance.registrationByStatus.header': 'Inscription par statut',
        'performance.completenessTable.completenessRate': 'taux de complétude',
        'phone.label.changeNumber': 'Quel est votre nouveau numéro ?',
        'phone.label.changeEmail': 'Quelle est votre nouvelle adresse e-mail ?',
        'phone.label.confirmation':
          'Un SMS de confirmation a été envoyé à {num}.',
        'email.label.confirmation':
          'Un code de vérification a été envoyé à {email}',
        'phone.label.verify': 'Entrez le code de vérification à 6 chiffres',
        'print.cert.coll.id.actions.cancel': 'Annuler',
        'print.cert.coll.id.actions.send': 'Confirmer',
        'print.cert.coll.id.description':
          "Sachez que si vous continuez, vous serez responsable de l'émission d'un certificat sans la preuve d'identité nécessaire du collecteur.",
        'print.cert.coll.idCheck.actions.noVer': 'Non',
        'print.cert.coll.idCheck.actions.ver': 'Oui',
        'print.cert.coll.other.aff.check': "Ils n'ont pas d'affidavit signé.",
        'print.cert.coll.other.aff.description':
          "Sachez que si vous continuez, vous serez responsable de l'émission d'un certificat sans les preuves nécessaires de la part de l'agent de recouvrement.",
        'print.cert.coll.other.aff.error':
          "Joignez une déclaration sous serment signée ou cochez la case si vous n'en avez pas.",
        'print.cert.coll.other.aff.form.title':
          'Joindre une déclaration sous serment signée',
        'print.cert.coll.other.aff.label': 'Affidavit signé',
        'print.cert.coll.other.aff.paragraph':
          'Ce document doit prouver clairement que la personne est habilitée à collecter le certificat.',
        'print.cert.coll.other.aff.title': 'Continuer sans affidavit signé ?',
        'print.certificate.addAnotherSignature': 'Ajouter un autre',
        'print.certificate.birthService':
          'Service: <strong>Enregistrement de la naissance après  {service} de D.o.B.</strong><br/>Montant dû:',
        'print.certificate.button.confirmPrint': 'Oui, imprimer le certificat',
        'print.certificate.certificatePreview': 'Aperçu du certificat',
        'print.certificate.collector.father': 'Père',
        'print.certificate.collector.form.error':
          'Veuillez sélectionner la personne qui collecte le certificat',
        'print.certificate.collector.idCheck.title':
          "Vérifiez la preuve d'identité. Correspond-elle aux détails suivants ?",
        'print.certificate.collector.idCheckDialog.title':
          "Continuer sans preuve d'identité ?",
        'print.certificate.collector.informant': 'Informateur',
        'print.certificate.collector.mother': 'Mère',
        'print.certificate.collector.other.form.error':
          'Remplissez tous les champs obligatoires',
        'print.certificate.collector.other.paragraph':
          "Parce qu'il n'y a pas de détails sur cette personne dans le dossier, nous devons capturer ses détails.",
        'print.certificate.collector.other.title':
          'Quelle est son identité et son nom ?',
        'print.certificate.collector.other': 'Autre',
        'print.certificate.collector.whoToCollect':
          "Certifier l'enregistrement",
        'print.certificate.collectPayment':
          'Veuillez encaisser le paiement, imprimer le reçu et le remettre au bénéficiaire.',
        'print.certificate.deathService':
          'Service: <strong>Enregistrement du décès après {service} de D.o.D.</strong><br/>Montant dû:',
        'print.certificate.form.name': 'Imprimer',
        'print.certificate.form.title': 'Imprimer le certificat',
        'print.certificate.manualPaymentMethod': 'Manuel',
        'print.certificate.next': 'Suivant',
        'print.certificate.noLabel': '',
        'print.certificate.payment': 'Le paiement est requis',
        'print.certificate.paymentAmount': '৳ {paymentAmount}',
        'print.certificate.paymentInstruction':
          'Veuillez encaisser le paiement, imprimer le reçu et le remettre au bénéficiaire.',
        'print.certificate.paymentMethod': 'Mode de paiement',
        'print.certificate.printCertificate': 'Imprimer le certificat',
        'print.certificate.printReceipt': 'Imprimer le reçu',
        'print.certificate.queryError':
          "Une erreur s'est produite lors de la recherche de données d'enregistrement des naissances.",
        'print.certificate.review.description':
          "Veuillez confirmer que l'informateur a vérifié que les informations figurant sur le certificat sont correctes et que celui-ci est prêt à être imprimé.",
        'print.certificate.review.modal.body':
          "Un fichier PDF du certificat s'ouvrira dans un nouvel onglet - veuillez l'imprimer à partir de là.",
        'print.certificate.review.printModalTitle': 'Imprimer le certificat ?',
        'print.certificate.review.printAndIssueModalTitle':
          'Imprimer et émettre le certificat ?',
        'print.certificate.review.modal.body.print':
          "Un PDF du certificat s'ouvrira dans un nouvel onglet que vous pourrez imprimer. Cet enregistrement sera ensuite déplacé vers votre file d'attente de travail prêt à émettre",
        'print.certificate.review.modal.body.printAndIssue':
          "Un PDF du certificat s'ouvrira dans un nouvel onglet que vous pourrez imprimer et émettre",
        'print.certificate.review.title': 'Prêt à certifier ?',
        'print.certificate.section.title': "Certifier l'enregistrement",
        'print.certificate.selectSignature':
          'Sélectionner les signatures électroniques',
        'print.certificate.serviceMonth':
          'Service: <strong>Enregistrement de la naissance après  {service, plural, =0 {0 month} un {1 month} other{{service} months}} of D.o.B.</strong><br/>Montant dû:',
        'print.certificate.serviceYear':
          'Service: <strong>Enregistrement de la naissance après {service, plural, =0 {0 year} un {1 year} other{{service} years}} of D.o.B.</strong><br/>Montant dû:',
        'print.certificate.toast.message':
          'Le certificat est prêt à être imprimé',
        'print.certificate.userReviewed':
          "L'informateur a examiné et confirmé que les informations figurant sur le certificat sont correctes.",
        'print.certificate.signature.person1': 'UP Secrétaire Kylian Mbappe',
        'print.certificate.signature.person2':
          'Registrar local Antoine Griezmann',
        'print.certificate.noPayment': 'Aucun paiement requis',
        'record.certificate.collector': "Contrôle d'identité",
        'record.certificate.collectedInAdvance': "Imprimé à l'avance par",
        'recordAudit.archive.confirmation.body':
          "Cela supprimera la déclaration de la file d'attente et changera son statut en archive. Pour annuler ce changement, vous devrez rechercher la déclaration.",
        'recordAudit.archive.confirmation.title': 'Archiver la déclaration ?',
        'recordAudit.archive.status': 'Archivé',
        'recordAudit.rn': "N ° d'enregistrement.",
        'recordAudit.dateOfBirth': 'Date de naissance',
        'recordAudit.dateOfDeath': 'Date de décès',
        'recordAudit.dateOfMarriage': 'Date du mariage',
        'recordAudit.declaration.reinstateDialog.actions.cancel': 'Annuler',
        'recordAudit.declaration.reinstateDialog.actions.confirm': 'Confirmer',
        'recordAudit.declaration.reinstateDialogDescription':
          "Cette opération rétablira la demande dans son statut initial et l'ajoutera à votre file d'attente.",
        'recordAudit.declaration.markAsDuplicate': 'Marqué comme un doublon',
        'recordAudit.declaration.reinstateDialogTitle':
          'Rétablir la déclaration ?',
        'recordAudit.registrationNo': "Numéro d'enregistrement",
        'recordAudit.noDateOfBirth': 'Pas de date de naissance',
        'recordAudit.noDateOfDeath': 'Pas de date de décès',
        'recordAudit.noDateOfMarriage': 'Pas de date de mariage',
        'recordAudit.noName': "Aucun nom n'a été fourni",
        'recordAudit.history.started': 'Démarré',
        'recordAudit.noPlaceOfBirth': 'Pas de lieu de naissance',
        'recordAudit.noPlaceOfDeath': 'Pas de lieu de décès',
        'recordAudit.noPlaceOfMarriage': 'Pas de lieu de mariage',
        'recordAudit.noStatus': 'Pas de statut',
        'recordAudit.noTrackingId': "Pas d'identifiant de suivi",
        'recordAudit.noType': 'Aucun événement',
        'recordAudit.placeOfBirth': 'Lieu de naissance',
        'recordAudit.placeOfDeath': 'Lieu de décès',
        'recordAudit.placeOfMarriage': 'Lieu du mariage',
        'recordAudit.regAction.assigned': 'Assigné',
        'recordAudit.regAction.downloaded': 'Consulté sur',
        'recordAudit.regAction.reinstated':
          'Réintégré à {regStatus, select, validated{prêt pour la révision} in_progress{en cours} declared{prêt pour la révision} rejected{nécessite des mises à jour} other{}}',
        'recordAudit.regAction.requestedCorrection': 'Enregistrement corrigé',
        'recordAudit.regAction.unassigned': 'Non assigné',
        'recordAudit.regAction.viewed': 'Vu',
        'recordAudit.regAction.markedAsDuplicate': 'Marqué comme un doublon',
        'recordAudit.regStatus.archived': 'Archivé',
        'recordAudit.regStatus.declared': 'Déclaration entamée',
        'recordAudit.regStatus.waitingValidation': 'En attente de validation',
        'recordAudit.regStatus.registered': 'Enregistré',
        'recordAudit.regStatus.certified': 'Certifié',
        'recordAudit.regStatus.issued': 'Émis',
        'recordAudit.regStatus.rejected': 'Rejeté',
        'recordAudit.regStatus.updatedDeclaration': 'Mise à jour de',
        'recordAudit.regStatus.markedAsNotDuplicate':
          "Marqué comme n'étant pas un doublon",
        'recordAudit.regAction.flaggedAsPotentialDuplicate':
          'Marqué comme doublon potentiel',
        'recordAudit.status': 'Statut',
        'recordAudit.trackingId': 'TrackingId',
        'recordAudit.type': 'Événement',
        'recordAudit.contact': 'Contact',
        'recordAudit.noContact': 'Pas de coordonnées fournies',
        'regHome.certified': 'Certifié',
        'regHome.issued': 'Émis',
        'regHome.inPro.selector.field.agents': 'Agents de terrain',
        'regHome.inPro.selector.hospital.drafts': 'Système de santé',
        'regHome.inPro.selector.own.drafts': 'Mes brouillons',
        'regHome.inProgress': 'En cours',
        'regHome.outbox.statusArchiving': 'Archiver...',
        'regHome.outbox.statusCertifying': 'Certifier...',
        'regHome.outbox.statusIssuing': "En cours d'émission...",
        'regHome.outbox.statusRegistering': 'Enregistrement...',
        'regHome.outbox.statusReinstating': 'Réintégration...',
        'regHome.outbox.statusRejecting': 'Je vous envoie des nouvelles...',
        'regHome.outbox.statusRequestingCorrection': 'Corriger...',
        'regHome.outbox.statusSendingForApproval': 'Envoi pour approbation...',
        'regHome.outbox.statusSubmitting': 'Envoi...',
        'regHome.outbox.statusWaitingToBeArchived': "En attente d'être archivé",
        'regHome.outbox.statusWaitingToBeReinstated':
          "Attendre d'être réintégré",
        'regHome.outbox.statusWaitingToCertify': 'En attente de certification',
        'regHome.outbox.statusWaitingToIssue': "En attente d'émission",
        'regHome.outbox.statusWaitingToRegister': "En attente d'enregistrement",
        'regHome.outbox.statusWaitingToReject':
          "En attente d'envoi pour les mises à jour",
        'regHome.outbox.statusWaitingToRequestCorrection':
          'En attendant de corriger',
        'regHome.outbox.statusWaitingToSubmit': "En attente d'envoi",
        'regHome.outbox.statusWaitingToValidate':
          "En attente d'envoi pour approbation",
        'regHome.outbox.waitingToRetry': 'Attendre de réessayer',
        'regHome.queryError': "Une erreur s'est produite lors de la recherche",
        'regHome.readyForReview': 'Prêt pour la révision',
        'regHome.readyToPrint': 'Prêt à imprimer',
        'regHome.registrationNumber': "N° d'enregistrement",
        'regHome.requestedCorrection': 'Correction demandée',
        'regHome.searchInput.placeholder': "Recherche d'un enregistrement",
        'regHome.sentForApprovals': 'Envoyé pour approbation',
        'regHome.sentForExternalValidation': 'Envoyé pour validation externe',
        'regHome.sentForUpdates': 'Envoyé pour mise à jour',
        'regHome.table.label.action': 'Action',
        'regHome.table.label.declarationDate': 'Déclaration envoyée',
        'regHome.table.label.registeredDate': 'Déclaration enregistrée',
        'regHome.table.label': 'Résultats',
        'recordAudit.regStatus.declared.sentNotification':
          "Envoi d'une notification pour examen",
        'regHome.val.regAgent.tooltip':
          "La déclaration a été validée et est en attente d'approbation",
        'regHome.validated.registrar.tooltip':
          "La déclaration a été validée par un agent d'enregistrement",
        'regHome.waitingForExternalValidation':
          "En attente d'une validation externe",
        'regHome.workqueue.downloadDeclarationFailed':
          'Échec du téléchargement de la déclaration. Veuillez réessayer',
        'register.conf.butt.back.dup': 'Retour au duplicata',
        'register.conf.butt.newDecl': 'Nouvelle déclaration',
        'register.confirmationScreen.boxHeaderDesc':
          '{event, select, declaration {{eventType, select, birth {Naissance} death {Décès} other{Naissance}} la déclaration a été envoyée pour examen.} registration {{eventType, select, birth {birth} death {death} other{birth}} a été enregistré.} duplication {{eventType, select, birth {birth} death {death} other{birth}} has been registered.} rejection {{eventType, select, birth {birth} death {death} other{birth}} la déclaration a été rejetée.} certificate {{eventType, select, birth {birth} death {death} other{birth}} certificate has been completed.} offline {{eventType, select, birth {birth} death {death} other{birth}} declaration will be sent when you reconnect.} other {{eventType, select, birth {birth} death {death} other{birth}}}',
        'register.confirmationScreen.buttons.back':
          "Retour à l'écran d'accueil",
        'register.confirmationScreen.trackingSectionDesc':
          "{event, select, certificate {Les certificats ont été collectés auprès de votre juridiction.} other {L'informateur recevra ce numéro par SMS, mais assurez-vous qu'il le note et le conserve en lieu sûr. Il doit utiliser ce numéro comme référence s'il souhaite obtenir des informations sur son inscription.} registration {L'informateur recevra ce numéro par SMS avec des instructions sur la manière et le lieu de retrait du certificat.} duplication{L'informateur recevra ce numéro par SMS avec des instructions sur la manière et le lieu de retrait du certificat.} rejection{L'agent déclarant sera informé des raisons du rejet et chargé d'y donner suite.} offline {L'informateur recevra le numéro d'identification de suivi par SMS lorsque la déclaration aura été envoyée pour examen..}}",
        'register.confirmationScreen.trackingSectionTitle':
          '{event, select, declaration {Tracking number:} registration {{eventType, select, birth {Birth} death {Death}} Registration Number:} duplication {{eventType, select, birth {Birth} death {Death}} Registration Number:} other {Tracking number:} certificate {} offline {Tracking number:}}',
        'register.eventInfo.birth.listItem0':
          'Je suis ici pour remplir la déclaration de naissance pour vous.',
        'register.eventInfo.birth.listItem1':
          "Une fois que j'aurai rempli la déclaration, elle sera envoyée au bureau d'enregistrement pour examen.",
        'register.eventInfo.birth.listItem2':
          "Attendez un SMS vous indiquant quand vous devez vous rendre au bureau pour retirer le certificat - Prenez votre carte d'identité avec vous.",
        'register.eventInfo.birth.listItem3':
          "Assurez-vous d'aller chercher le certificat. Un certificat de naissance est essentiel pour cet enfant, notamment pour lui faciliter la vie par la suite. Il l'aidera à accéder aux services de santé, aux examens scolaires et aux allocations gouvernementales.",
        'register.eventInfo.death.listItem0':
          'Je suis ici pour remplir la déclaration de décès pour vous.',
        'register.eventInfo.death.listItem1':
          "Une fois que j'aurai rempli la déclaration, elle sera envoyée au bureau d'enregistrement pour examen.",
        'register.eventInfo.death.listItem2':
          "Attendez un SMS vous indiquant quand vous devez vous rendre au bureau pour retirer le certificat - Prenez votre carte d'identité avec vous.",
        'register.eventInfo.death.listItem3':
          "Assurez-vous d'aller chercher le certificat. Un certificat de décès est essentiel pour soutenir les demandes d'héritage et pour régler les affaires du défunt, par exemple la clôture des comptes bancaires et le règlement des prêts.",
        'register.eventInfo.marriage.listItem0':
          "Je suis ici pour remplir la déclaration d'enregistrement du mariage pour vous. ",
        'register.eventInfo.marriage.listItem1':
          "Une fois que j'aurai complété la déclaration, elle sera envoyée au bureau d'enregistrement pour examen.",
        'register.eventInfo.marriage.listItem2':
          "Attendez un SMS vous indiquant quand vous rendre au bureau pour retirer le certificat - Prenez votre pièce d'identité avec vous",
        'register.eventInfo.event.title':
          "Présentez le processus d'enregistrement des {eventType, select, birth{naissance} death{décès} other{mariage}} à l'informateur.",
        'register.eventInfo.birth.title':
          "Présenter la procédure d'enregistrement des naissances à l'informateur",
        'register.eventInfo.death.title':
          "Présenter la procédure d'enregistrement des décès à l'informateur",
        'register.eventInfo.marriage.title':
          "Présenter la procédure d'enregistrement des mariages à l'informateur",
        'register.form.informationMissing': 'Informations manquantes',
        'register.form.missingFieldsDescription':
          'Les informations suivantes seront soumises pour validation. Veuillez vous assurer que tous les détails requis ont été remplis correctement. Il y a  {numberOfErrors} de champs obligatoires manquants dans votre formulaire :',
        'register.form.modal.areYouReadyToSubmit':
          'Êtes-vous prêt à soumettre ?',
        'register.form.modal.desc.saveDeclarationConfirm':
          'Toutes les données saisies seront conservées en toute sécurité pour de futures modifications. Êtes-vous prêt à enregistrer les modifications apportées à ce formulaire de déclaration?',
        'register.form.modal.desc.validateConfirmation':
          "Cette déclaration sera envoyée à l'officier d'état civil pour qu'il l'approuve.",
        'register.form.modal.submitDescription':
          "En cliquant sur Soumettre, vous confirmez que l'informateur a lu et revu les informations et qu'il comprend que ces informations seront partagées avec les autorités de l'état civil.",
        'register.form.modal.title.saveDeclarationConfirm':
          'Enregistrer et quitter?',
        'register.form.modal.title.submitConfirmation':
          '{completeDeclaration, select, true {Envoyer une déclaration pour examen ?} other {Envoyer une déclaration incomplète ?}}',
        'register.form.modal.title.validateConfirmation':
          'Envoyer pour approbation ?',
        'register.form.newVitalEventRegistration':
          '{event, select, birth {Naissance} death {Décès} marriage {Mariage} divorce {Divorce} other {Adoption}} déclaration',
        'register.form.previewEventRegistration':
          '{event, select, birth {Naissance} death {Décès} marriage {Mariage} divorce {Divorce} other {Adoption}} Declaration Preview',
        'register.form.required': 'Ce champ est obligatoire',
        'register.form.reviewEventRegistration':
          '{event, select, birth {Naissance} death {Décès} marriage {Mariage} divorce {Divorce} other {Adoption}} Registration Review',
        'register.form.saveAsDraft': 'Enregistrer comme brouillon',
        'register.form.section.preview.name': 'Prévisualiser',
        'register.form.section.preview.title': 'Prévisualiser',
        'register.form.section.review.title': 'Réviser',
        'register.primaryInformant.description':
          'Cette personne est chargée de fournir des informations exactes dans cette déclaration.',
        'register.form.modal.title.deleteDeclarationConfirm':
          'Supprimer le brouillon?',
        'register.form.modal.desc.deleteDeclarationConfirm':
          'Êtes-vous certain de vouloir supprimer ce projet de formulaire de déclaration? Veuillez noter que cette action ne peut pas être annulée.',
        'register.form.modal.title.exitWithoutSavingModalForCorrection':
          "Quitter l'enregistrement correct ?",
        'register.form.modal.desc.exitWithoutSavingModalForCorrection':
          'Êtes-vous sûr de vouloir quitter ? Les corrections que vous avez apportées ne seront pas sauvegardées.',
        'register.form.modal.title.exitWithoutSavingDeclarationConfirm':
          'Quitter sans enregistrer les modifications?',
        'register.form.modal.desc.exitWithoutSavingDeclarationConfirm':
          'Vous avez des modifications non enregistrées sur votre formulaire de déclaration. Voulez-vous vraiment quitter sans enregistrer ?',
        'register.primaryInformant.errorMessage':
          "Veuillez sélectionner qui est l'informateur principal",
        'register.primaryInformant.registerNewEventHeading':
          "Qui est l'informateur principal de cette déclaration ?",
        'register.registerForm.queryError':
          "La page ne peut être chargée pour le moment en raison d'une faible connectivité ou d'une erreur de réseau. Veuillez cliquer sur actualiser pour réessayer, ou réessayer plus tard.",
        'register.SelContact.birthRelLabel': "Relation avec l'enfant",
        'register.SelectContactPoint.error':
          'Veuillez sélectionner un point de contact principal',
        'register.SelectContactPoint.heading':
          'Qui est le point de contact principal pour cette déclaration ?',
        'register.SelectContactPoint.phoneNoError':
          'Numéro de portable non valide',
        'register.SelectContactPoint.phoneNoLabel': 'Numéro de téléphone',
        'register.SelectContactPoint.title': 'Déclaration de naissance',
        'register.selectInformant.birthErrorMessage':
          'Veuillez sélectionner qui est présent et qui fait la demande',
        'register.selectInformant.birthInformantTitle': "Type d'informateur",
        'register.selectInformant.marriageInformantTitle':
          "Coordonnées de l'informateur",
        'register.selectInformant.daughter': 'Fille',
        'register.selectInformant.deathErrorMessage':
          'Veuillez sélectionner le lien de parenté avec la personne décédée.',
        'register.selectInformant.deathInformantTitle':
          "Quel est le lien de parenté de l'informateur avec la personne décédée ?",
        'register.selectInformant.extendedFamily': 'Famille élargie',
        'register.selectinformant.legalGuardian': 'Tuteur légal',
        'register.selectInformant.newBirthRegistration':
          'Nouvelle déclaration de naissance',
        'register.selectInformant.newDeathRegistration':
          'Nouvelle déclaration de décès',
        'register.selectInformant.newMarriageRegistration':
          'Nouvelle déclaration de mariage',
        'register.selectInformant.parents': 'Mère et père',
        'register.selectInformant.primaryInformant':
          "Qui est l'informateur principal ?",
        'register.selectInformant.relationshipLabel':
          'Lien de parenté avec le défunt',
        'register.selectInformant.son': 'Fils',
        'register.selectInformant.spouse': 'Conjoint',
        'register.selectVitalEvent.backToReviewButton': "Retour à l'examen",
        'register.selectVitalEvent.errorMessage':
          "Veuillez sélectionner le type d'événement",
        'register.selectVitalEvent.registerNewEventDesc':
          "Commencez par sélectionner l'événement que vous souhaitez déclarer.",
        'register.selectVitalEvent.registerNewEventHeading':
          "Quel type d'événement voulez-vous déclarer ?",
        'register.selectVitalEvent.registerNewEventTitle':
          'Nouvelle déclaration',
        'register.selInf.deathInfSomeoneElse':
          "Quel est le lien de parenté de l'informateur avec la personne décédée ?",
        'register.workQueue.declarations.banner':
          'Déclarations à enregistrer dans votre région',
        'review.actions.desc.regConfComp':
          "En cliquant sur Enregistrer, vous confirmez que les informations sont correctes et ont été vérifiées par l'informateur. L'informateur comprend qu'elles seront utilisées pour enregistrer la naissance et à des fins de planification. En enregistrant cette naissance, un certificat de naissance sera généré avec votre signature pour être délivré.",
        'review.actions.desc.regConfInComp':
          "Des informations obligatoires sont manquantes. Veuillez ajouter ces informations afin de pouvoir terminer le processus d'enregistrement.",
        'review.actions.description.confirmComplete':
          "En envoyant cette déclaration pour examen, vous confirmez que les informations ont été examinées par l'informateur et qu'il sait qu'il recevra un {deliveryMethod} avec un identifiant de suivi et des détails sur la manière de récupérer l'acte de naissance.",
        'review.actions.description.confirmInComplete':
          "En envoyant cette déclaration {deliveryMethod}omplète, vous créez un enregistrement numérique. Nous informons l'informateur qu'il recevra un {deliveryMethod} avec un identifiant de suivi. Il en aura besoin pour compléter la déclaration dans un bureau d'enregistrement dans les 30 jours. L'informateur devra fournir toutes les informations obligatoires avant que la naissance puisse être enregistrée.",
        'review.actions.description':
          "En vous enregistrant, vous confirmez que vous avez examiné cette déclaration et que vous êtes convaincu qu'elle remplit les conditions requises pour l'enregistrement.",
        'review.actions.title.declarationStatus':
          'Déclaration {completeDeclaration, select, true {complet} other {incomplet}}',
        'review.actions.title.registerActionTitle': 'Prêt à vous enregistrer ?',
        'review.birthRegistration.queryError':
          "Une erreur s'est produite lors de la récupération de l'enregistrement de la naissance",
        'review.button.approve': 'Envoyer pour approbation',
        'review.documents.editDocuments': 'Ajouter une pièce jointe',
        'review.documents.zeroDocumentsText':
          'Aucune pièce justificative pour  {section, select, child {child} mother {mother} father {father} deceased {deceased} informant {informant} other {Parent}}',
        'review.documents.zeroDocumentsTextForAnySection':
          'Aucune pièce justificative',
        'review.documentViewer.tagline': 'Sélectionner pour prévisualiser',
        'review.documentViewer.title': "Documents d'appui",
        'review.edit.modal.backToPreview': "Retour à l'aperçu",
        'review.edit.modal.confirmationText':
          'Un enregistrement sera créé pour toutes les modifications que vous apporterez.',
        'review.edit.modal.confirmationTitle': 'Modifier la déclaration ?',
        'review.error.unauthorized':
          'Nous ne sommes pas en mesure de vous afficher cette page',
        'review.form.section.review.name': 'Réviser',
        'review.form.section.review.title': 'Critique de',
        'review.formData.header':
          "{isDraft, select, true {Vérifiez les réponses auprès de l'informateur avant de les envoyer pour examen.} other {Examinez les réponses avec les documents justificatifs}}",
        'review.header.subject.subjectWithoutName':
          '{eventType, select, birth {Naissance} death {Décès} other {Marriage}} Déclaration',
        'review.header.subject.subjectWitName':
          '{eventType, select, birth {Naissance} death {Décès} other {Mariage}} declaration for {name}',
        'review.header.title.govtName': 'République du Farajaland',
        'review.inputs.additionalComments':
          'Des commentaires supplémentaires ?',
        'review.modal.desc.submitConfirmation':
          "{completeDeclaration, select, true {Cette déclaration sera envoyée au greffier pour qu'il l'examine.} other {Cette déclaration sera envoyée au greffier pour être complétée. Veuillez informer l'informateur qu'il devra se présenter au bureau avec les informations manquantes et les documents justificatifs.}}",
        'review.modal.title.registerConfirmation': 'Enregistrer cet {event}?',
        'review.modal.title.submitConfirmation':
          '{completeDeclaration, select, true {Envoyer la déclaration pour examen?} other {Envoyer une déclaration incomplète?}}',
        'review.inputs.supportingDocuments': 'Documents justificatifs',
        'review.rej.form.reasons.missSupDoc':
          'Documents justificatifs manquants',
        'review.rejection.form.commentInstruction':
          'Veuillez fournir des instructions spécifiques sur ce qui doit être mis à jour par le travailleur de la santé pour rectifier correctement la déclaration',
        'review.rejection.form.commentLabel':
          "Commentaires ou instructions à l'intention de l'agent de santé pour rectifier la déclaration",
        'review.rejection.form.instruction':
          "Veuillez décrire les mises à jour nécessaires à cet enregistrement pour le suivi de l'action.",
        'review.rejection.form.reasons.markDuplicate':
          'Marquer comme duplicata',
        'review.rejection.form.reasons.duplicate': 'Déclaration en double',
        'review.rejection.form.reasons.misspelling': 'Mauvaise orthographe',
        'review.rejection.form.reasons.other': 'Autre',
        'review.rejection.form.reasons': 'Raison(s) du rejet :',
        'review.rejection.form.submitButton': 'Soumettre le rejet',
        'review.rejection.form.title':
          'Quelle mise à jour la déclaration nécessite-t-elle ?',
        'review.rejection.form': 'Formulaire de rejet',
        'search.informantContact': "Numéro de contact de l'informateur",
        'search.labels.results.eventRegistrationNumber':
          '{event, select, birth {B} death {D} marriage {M} divorce {Divorce } other {A}}RN',
        'search.loadingDeclarations': 'Chargement des déclarations...',
        'search.locationNotFound': 'Emplacement non trouvé',
        'search.bookmarkAdvancedSearchModalTitle':
          'Enregistrer la requête de recherche ?',
        'search.bookmarkAdvancedSearchModalBody':
          'Un raccourci sera ajouté à la barre latérale pour vous permettre de relancer cette requête de recherche.',
        'search.removeBookmarkAdvancedSearchModalTitle':
          'Supprimer la requête de recherche ?',
        'search.removeBbookmarkAdvancedSearchModalBody':
          'Ce signet de recherche avancée sera supprimé du raccourci de la barre latérale',
        'search.bookmark.success.notification':
          'Le résultat de votre recherche avancée a été ajouté aux favoris avec succès',
        'search.bookmark.remove.success.notification':
          'Votre signet de recherche avancée a été supprimé avec succès',
        'search.bookmark.error.notification':
          "Désolé, quelque chose s'est mal passé. Veuillez réessayer",
        'search.bookmark.loading.notification':
          'Mettre en signet les résultats de votre recherche avancée...',
        'search.bookmark.remove.loading.notification':
          'Suppression de votre signet de recherche avancée...',
        'search.noDeclarations': 'Aucune déclaration à examiner',
        'search.noResults': 'Aucun résultat à afficher',
        'search.results': 'Résultats',
        'search.searchingFor': 'Recherche de  “{param}”',
        'search.searchResultFor': 'résultat de la recherche pour “{param}”',
        'search.noResultFor': 'Aucun résultat pour “{param}”',
        'search.totalResultText':
          '{total, plural, =0 {} one {# record found} other {# records found}}',
        'search.waitingForConnection':
          'Se reconnecter pour charger les déclarations',
        'advancedSearch.form.registrationDetails': "Détails d'inscription",
        'advancedSearch.form.childDetails': "Détails de l'enfant",
        'advancedSearch.form.eventDetails': "Détails de l'évènement",
        'advancedSearch.form.motherDetails': 'Détails de la mère',
        'advancedSearch.form.fatherDetails': 'Détails du père ',
        'advancedSearch.form.placeOfRegistration': "Lieu d'enregistrement",
        'advancedSearch.form.placeOfRegistrationHelperText':
          "Rechercher une province, un district ou un bureau d'enregistrement",
        'advancedSearch.form.dateOfRegistration': "Date d'enregistrement",
        'advancedSearch.form.statusOfRecordLabel': 'Etat du dossier',
        'advancedSearch.form.deceasedDetails': 'Détails du défunt',
        'advancedSearch.form.informantDetails': "Détails de l'informateur",
        'advancedSearch.form.recordStatusAny': 'Tout statut',
        'advancedSearch.form.recordStatusInprogress': 'En cours',
        'advancedSearch.form.recordStatusInReview': 'En revue',
        'advancedSearch.form.recordStatusRequireUpdate':
          'Nécessite des mises à jour',
        'advancedSearch.form.recordStatusRegistered': 'Inscrit',
        'advancedSearch.form.recordStatusCertified': 'Agréé',
        'advancedSearch.form.recordStatusAchived': 'Archivé',
        'advancedSearch.accordion.hide': 'Cacher',
        'advancedSearch.accordion.show': 'Spectacle',
        'advancedSearchResult.pill.event': 'Événement',
        'advancedSearchResult.pill.registationStatus':
          "Statut d'enregistrement",
        'advancedSearchResult.pill.eventDate': "Date de l'événement",
        'advancedSearchResult.pill.regNumber': "Numéro d'enregistrement",
        'advancedSearchResult.pill.trackingId': 'Identifiant de suivi',
        'advancedSearchResult.pill.regDate': "Date d'inscription",
        'advancedSearchResult.pill.eventLocation': "Lieu de l'événement",
        'advancedSearchResult.pill.regLocation': 'Emplacement',
        'advancedSearchResult.pill.childFirstName': "Prénom de l'enfant",
        'advancedSearchResult.pill.childLastName': "Nom de l'enfant",
        'advancedSearchResult.pill.motherFirstName': 'Mère Prénom',
        'advancedSearchResult.pill.motherLastName': 'Nom de famille de la mère',
        'advancedSearchResult.pill.fatherFirstName': 'Prénom du père',
        'advancedSearchResult.pill.fatherLastName': 'Nom de famille du père',
        'advancedSearchResult.pill.deceasedFirstName': 'Prénom du défunt',
        'advancedSearchResult.pill.deceasedLastName': 'Nom de famille décédé',
        'advancedSearchResult.pill.informantFirstName':
          "Prénom de l'informateur",
        'advancedSearchResult.pill.informantLastName': "Nom de l'informateur",
        'advancedSearchResult.pill.gender': 'Le genre',
        'advancedSearchResult.pill.childDoB': 'Enfant d.o.b',
        'advancedSearchResult.pill.fatherDoB': 'Père d.o.b',
        'advancedSearchResult.pill.motherDoB': 'Mère d.o.b',
        'advancedSearchResult.pill.deceasedDoB': 'd.o.b décédé',
        'advancedSearchResult.pill.informantDoB': 'Informateur d.o.b',
        'advancedSearchResult.table.searchResult': 'Résultat de la recherche',
        'advancedSearchResult.table.noResult': 'Pas de résultat',
        'secureAccount.page.title': 'Sécurisez votre compte',
        'secureAccount.page.desc':
          "Un numéro d'identification personnel protège votre compte. Votre code PIN vous sera demandé avant chaque utilisation de l'application {applicationName} application",
        'secureAccount.createPin.label': 'CRÉER UN PIN',
        'settings.account.tile': 'Compte',
        'settings.changeAvatar.changeImage': "Modifier l'image",
        'settings.changeAvatar.resizeAvatar':
          "Redimensionnez et positionnez l'image choisie.",
        'settings.changeAvatar': "Modifier l'image du profil",
        'settings.changeLanguage.success': 'Langue mise à jour en {language}',
        'settings.changeLanguage': 'Changer de langue',
        'settings.changePassword': 'Modifier le mot de passe',
        'settings.changePhone': 'Changer de numéro de téléphone',
        'settings.message.changeLanguage':
          'Votre langue préférée que vous souhaitez utiliser sur OpenCRVS',
        'settings.profile.tile': 'Profil',
        'settings.security.tile': 'Sécurité',
        'settings.system.tile': 'Système',
        'settings.title': 'Paramètres',
        'settings.user.label.assignedOffice': 'Bureau assigné',
        'settings.user.label.nameBN': 'Nom en bengali',
        'settings.user.label.nameEN': 'Nom anglais',
        'system.user.unlock.pinLabel': 'Entrez votre NIP',
        'settings.verifyPhone': 'Vérifier le numéro de téléphone',
        'wq.noRecords.draft': 'Aucun enregistrement en cours',
        'wq.noRecords.fieldAgents':
          'Aucun enregistrement des agents de terrain',
        'wq.noRecords.healthSystem': 'Aucun dossier du système de santé',
        'wq.noRecords.externalValidation':
          'Aucun enregistrement dans la validation externe',
        'wq.noRecords.readyForReview': 'Aucun dossier prêt à être examiné',
        'wq.noRecords.readyToPrint': 'Aucun document prêt à être imprimé',
        'wq.noRecords.requiresUpdate':
          'Aucun enregistrement ne nécessite de mise à jour',
        'wq.noRecords.sentForApproval': 'Aucun dossier envoyé pour approbation',
        'wq.noRecords.sentForReview': 'Aucun dossier envoyé pour examen',
        'wq.noRecords.readyToIssue': 'Aucun document prêt à être publié',
        'sysAdHome.config': 'Config',
        'sysAdHome.devices': 'Appareils',
        'sysAdHome.network': 'Réseau',
        'sysAdHome.offices': 'Bureaux',
        'sysAdHome.overview': "Vue d'ensemble",
        'sysAdHome.sendUsernameReminderInvite':
          "Envoyer un rappel de nom d'utilisateur",
        'sysAdHome.sendUsernameReminderInviteSuccess':
          "Rappel de l'identifiant envoyé à {name}",
        'sysAdHome.sendUsernameReminderInviteError':
          "Le rappel du nom d'utilisateur n'a pas pu être envoyé",
        'sysAdHome.sendUsernameReminderInviteModalTitle':
          "Envoyer un rappel de nom d'utilisateur ?",
        'sysAdHome.sendUsernameReminderInviteModalMessage':
          "L'utilisateur recevra un rappel de son nom d'utilisateur par un {deliveryMethod} envoyé à {recipient}.",
        'sysAdHome.resendInvite': "Renvoyer l'invitation",
        'sysAdHome.resendInviteError': "L'invitation n'a pas pu être envoyée",
        'sysAdHome.resendInviteSuccess': 'Invitation envoyée',
        'sysAdHome.resentPasswordSuccess':
          'Mot de passe temporaire envoyé à {username}',
        'sysAdHome.resentPasswordError':
          "Le mot de passe temporaire n'a pas pu être envoyé",
        'sysAdHome.user.audit.comments': 'Commentaires :',
        'sysAdHome.user.audit.deactiv.reasonInv':
          "Fait l'objet d'une enquête en raison d'une activité suspecte sur son compte",
        'sysAdHome.user.audit.deactiv.reasonNotEmp': "N'est plus un employé",
        'sysAdHome.user.audit.deactivation.subtitle':
          "Cette mesure aura pour effet de retirer à {name} la possibilité de se connecter et d'accéder au système. Le compte peut être réactivé à une date ultérieure.",
        'sysAdHome.user.audit.deactivation.title': 'Désactiver {name}?',
        'sysAdHome.user.audit.form.error':
          'Une raison est requise pour {auditAction} cet utilisateur.',
        'sysAdHome.user.audit.reactiv.noLongerInv':
          "Ne fait plus l'objet d'une enquête pour activité suspecte",
        'sysAdHome.user.audit.reactiv.returned': 'Repris dans leur rôle',
        'sysAdHome.user.audit.reactivation.subtitle':
          'Cela réactivera la capacité de {name} à se connecter et à accéder au système.',
        'sysAdHome.user.audit.reactivation.title': 'Réactiver {name}?',
        'sysAdHome.user.audit.reason': 'Veuillez fournir une raison :',
        'sysAdHome.user.audit.reasonOther':
          'Autre (veuillez fournir une raison dans les commentaires)',
        'sysAdHome.user.deactivate': 'Désactiver',
        'sysAdHome.user.edit.commonGroupTitle': "Modifier l'utilisateur",
        'sysAdHome.user.resetpassword.title': 'Réinitialiser le mot de passe',
        'sysAdHome.user.resetPasswordModal.title':
          'Réinitialiser le mot de passe?',
        'sysAdHome.user.resetPasswordModal.message':
          "L'utilisateur recevra un mot de passe temporaire par {deliveryMethod} envoyé à {recipient}. Il sera ensuite invité à créer un nouveau mot de passe après avoir réussi à se connecter.",
        'sysAdHome.user.header': 'Modifier les détails',
        'sysAdHome.user.reactivate': 'Réactiver',
        'sysAdHome.users': 'Utilisateurs',
        'system.user.queryError':
          "Une erreur s'est produite lors du chargement des utilisateurs du système",
        'system.user.settings.avatarUpdated':
          "L'image du profil a été mise à jour avec succès",
        'system.user.settings.avatarUpdating':
          "Mise à jour de l'image du profil",
        'system.user.settings.incorrectPassword':
          'Le mot de passe actuel est incorrect. Veuillez réessayer.',
        'system.user.settings.incorrectVerifyCode':
          'Code de vérification incorrect. Veuillez réessayer.',
        'system.user.settings.name': 'Nom',
        'system.user.settings.passwordUpdated':
          'Le mot de passe a été changé avec succès',
        'system.user.settings.phonedNumberUpdated':
          'Numéro de téléphone mis à jour',
        'system.user.settings.emailAddressUpdated':
          'Adresse e-mail mise à jour',
        'system.user.settings.profileImage': 'Image de profil',
        'system.user.duplicateMobileError':
          '{number} est déjà utilisé par un autre utilisateur. Veuillez utiliser un autre numéro de téléphone',
        'system.user.duplicateEmailError':
          '{email} est déjà utilisé par un autre utilisateur. Veuillez utiliser une autre adresse e-mail',
        'system.user.newUser': 'Nouvel utilisateur',
        'system.user.active': 'Actif',
        'system.user.pending': 'En attente',
        'system.user.disabled': 'Handicapés',
        'system.user.deactivated': 'Désactivé',
        'system.user.total': '{totalUser} utilisateurs',
        'system.user.settings.systemLanguage': 'Langue du système',
        'team.header.sysadmin.home': 'Rechercher un bureau',
        'team.user.buttons.deactivate': 'Désactiver',
        'team.user.buttons.reactivate': 'Réactiver',
        'unlockApp.incorrectPin': 'Le code est incorrect. Veuillez réessayer',
        'unlockApp.lastTry': 'Dernier essai',
        'unlockApp.locked':
          'Votre compte a été verrouillé. Veuillez réessayer dans 1 minute.',
        'user.form.buttons.submit': 'Créer un utilisateur',
        'user.form.securityquestion.answer': 'Répondre à',
        'user.form.securityquestion.description':
          'Dans les listes déroulantes ci-dessous, sélectionnez des questions qui pourront être utilisées ultérieurement pour confirmer votre identité si vous oubliez votre mot de passe.',
        'user.form.securityquestion.enterResponse':
          'Entrez une réponse à la question de sécurité que vous avez choisie',
        'user.form.securityquestion.heading':
          'Définissez vos questions de sécurité',
        'user.form.securityquestion.securityQuestionLabel':
          'Question de sécurité {count}',
        'user.form.securityquestion.selectSecurityQuestion':
          'Sélectionnez une question de sécurité',
        'user.form.securityquestion.title': 'Questions de sécurité',
        'user.profile.assignedOffice': 'Bureau assigné',
        'user.profile.audit.column.action': 'Action',
        'user.profile.audit.column.date': 'Date',
        'user.profile.audit.column.eventType': 'Événement',
        'user.profile.audit.column.trackingId': 'Dossier',
        'user.profile.audit.column.deviceIPAddress': 'Dispositif/adresse IP',
        'user.profile.auditList.assigned': 'Assigné',
        'user.profile.auditList.unAssigned': 'Non attribué',
        'user.profile.auditList.archived': 'Archivé',
        'user.profile.auditList.loggedIn': 'Connecté',
        'user.profile.auditList.loggedOut': 'Déconnecté',
        'user.profile.auditList.phoneNumberChanged':
          'Changement de numéro de téléphone',
        'user.profile.auditList.emailAddressChanged':
          "L'adresse e-mail a été modifiée",
        'user.profile.auditList.passwordChanged': 'Password changed',
        'user.profile.auditList.userReactivated': 'Mot de passe modifié',
        'user.profile.auditList.userDeactivated': 'Utilisateur désactivé',
        'user.profile.auditList.userCreated': 'Utilisateur créé',
        'user.profile.auditList.userEdited': 'Utilisateur modifié',
        'user.profile.auditList.passwordReset': 'Réinitialiser un mot de passe',
        'user.profile.auditList.usernameRequested':
          "Rappel du nom d'utilisateur demandé",
        'user.profile.auditList.sentForApproval': 'Envoyé pour approbation',
        'user.profile.audit.description.certified': 'Certifié',
        'user.profile.audit.description.issued': 'Émis',
        'user.profile.audit.description.declared': 'Déclaration entamée',
        'user.profile.audit.description.inProgress': 'Envoyé incomplet',
        'user.profile.audit.description.waiting_validation':
          'Déclaration envoyée pour la validation du système externe',
        'user.profile.audit.description.registered': 'Enregistré',
        'user.profile.auditList.corrected': 'dossier corrigé',
        'user.profile.auditList.retrieved': 'Récupéré',
        'user.profile.auditList.viewed': 'Vu',
        'user.profile.auditList.markedAsDuplicate': 'Marqué comme duplicata',
        'user.profile.auditList.markedAsNotDuplicate':
          'Marqué comme non dupliqué',
        'user.profile.auditList.reInstatedToInProgress':
          'Réintégré dans les travaux en cours',
        'user.profile.auditList.reInstatedToInReview':
          'Réintégré à en révision',
        'user.profile.auditList.reInstatedToUpdate':
          'Réintégré pour demander des mises à jour',
        'user.profile.auditList.usernameReminderByAdmin':
          "Rappel du nom d'utilisateur envoyé",
        'user.profile.auditList.passwordResetByAdmin': 'Mot de passe envoyé',
        'user.profile.audit.description.rejected': 'Rejeté',
        'user.profile.audit.description.validated':
          'Déclaration envoyée pour approbation',
        'user.profile.audit.description.updated': 'Mise à jour de',
        'user.profile.audit.list.noDataFound': 'Aucun audit à afficher',
        'user.profile.auditList.showMore':
          'Afficher le prochain {pageSize} de {totalItems',
        'user.profile.phoneNumber': 'Numéro de téléphone',
        'user.profile.roleType': 'Rôle/Type',
        'user.profile.sectionTitle.audit': 'Histoire',
        'user.profile.startDate': 'Date de début',
        'user.profile.userName': "Nom d'utilisateur",
        'user.profile.nid': "Carte d'identité nationale",
        'userSetup.complete.instruction':
          "Connectez-vous maintenant à votre compte avec votre nom d'utilisateur et votre mot de passe nouvellement créé.",
        'userSetup.complete.title': 'Configuration du compte terminée',
        'userSetup.instruction':
          'Vérifiez les détails ci-dessous pour confirmer que les détails de votre compte sont corrects. et faites les changements nécessaires pour confirmer que les détails de votre compte sont corrects.',
        'userSetup.landing.instruction':
          "Vous n'êtes plus qu'à quelques étapes de la création de votre compte.",
        'userSetup.landing.title': 'Bienvenue à {applicationName}',
        'userSetup.review.header': 'Confirmez vos coordonnées',
        'userSetup.review.title': 'Vos coordonnées',
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
        'userSetup.type.hospital': 'Hôpital',
        'userSetup.type.healthSystem': 'Système de santé',
        'userSetup.type.system': 'Système',
        'userSetup.waiting': 'Configuration de votre compte',
        'validate.complete.declaration.action.description':
          'En envoyant pour approbation, vous confirmez que la déclaration est prête à être approuvée.',
        'validate.complete.declaration.action.title':
          'Envoyer pour approbation ou rejeter ?',
        'validate.declaration.action.modal.description':
          "Cette déclaration sera envoyée à l'officier d'état civil pour l'enregistrement.",
        'review.inputs.informantsSignature': "Signature de l'informateur",
        'review.signature.description':
          'Je soussigné(e) déclare par la présente que les informations contenues dans ce formulaire sont, à ma connaissance, vraies et correctes.',
        'review.signature.input.description':
          "En signant ce document avec une signature électronique, j'accepte que cette signature soit valable comme les signatures manuscrites dans la mesure où les lois du Farajaland le permettent.",
        'review.inputs.brideSignature': 'Signature de la mariée',
        'review.inputs.groomSignature': 'Signature du marié',
        'review.inputs.witnessOneSignature': 'Signature du témoin 1',
        'review.inputs.witnessTwoSignature': 'Signature du témoin 2',
        'review.inputs.terms':
          "Nous, les soussignés, déclarons sous peine de parjure en vertu des lois du Farajaland que les informations ci-dessus sont vraies et correctes au mieux de nos connaissances et de nos convictions. Nous déclarons également qu'aucune objection légale au mariage n'est connue et demandons par la présente un certificat de mariage.",
        'review.signature.clear': 'Clair',
        'review.signature.open': 'Signer',
        'review.signature.delete': 'Supprimer',
        'validate.declaration.action.modal.title': 'Envoyer pour approbation ?',
        'validations.bengaliOnlyNameFormat':
          'Doit contenir uniquement des caractères bengalis',
        'validations.blockAlphaNumericDot':
          "Ne peut contenir que des caractères d'imprimerie, des chiffres et des points (par exemple, C91.5).",
        'validations.correctionReason':
          'Veuillez fournir une raison pour cette correction',
        'validations.dateFormat': 'Doit être une date valide',
        'validations.dobEarlierThanDom':
          'Doit être antérieure à la date du mariage',
        'validations.domLaterThanDob':
          'Doit être postérieure à la date de naissance',
        'validations.duplicateNationalID':
          "L'identifiant national doit être unique",
        'validations.emailAddressFormat':
          'Doit être une adresse électronique valide',
        'validations.englishOnlyNameFormat':
          "L'entrée contient des caractères non valides. Veuillez n'utiliser que des lettres (a-z, A-Z), des chiffres (0-9), des traits d'union (-), des apostrophes (') et des traits de soulignement (_)",
        'validations.facilityMustBeSelected': 'Aucun établissement sélectionné',
        'validations.greaterThanZero': 'Doit être supérieur à zéro',
        'validations.isDateNotAfterDeath':
          'La date doit être antérieure à la date de décès',
        'validations.isDateNotBeforeBirth':
          'La date doit être postérieure à la date de naissance du défunt',
        'validations.isInformantOfLegalAge': "L'informateur n'est pas majeur",
        'validations.isMoVisitAfterDeath':
          'La date de visite du médecin ne doit pas être postérieure à la date du décès.',
        'validations.isMoVisitBeforeBirth':
          'La date de la visite du médecin ne doit pas être antérieure à la naissance du défunt.',
        'validations.isValidBirthDate':
          'Doit être une date de naissance valide',
        'validations.isValidDateOfDeath': 'Doit être une date de décès valide',
        'validations.maxLength':
          'Ne doit pas comporter plus de {max} caractères.',
        'validations.minLength': 'Doit comporter {min} caractères ou plus',
        'validations.nonDecimalPointNumber':
          'Ne peut pas avoir de nombre à virgule',
        'validations.notGreaterThan':
          'Ne doit pas être supérieur à {maxValue}.',
        'validations.numberRequired': 'Doit être un nombre',
        'validations.officeMustBeSelected': 'Aucun bureau sélectionné',
        'validations.phoneNumberFormat':
          'Doit être un nombre valide de  {num} chiffres qui commence par  {start}',
        'validations.range': 'Doit être compris entre {min} et {max}.',
        'validations.required': "Requis pour l'enregistrement",
        'validations.requiredSymbo': 'validations.requiredSymbol : ',
        'validations.requiredBasic': 'Requis',
        'validations.userform.required':
          "Requis pour l'enregistrement d'un nouvel utilisateur",
        'validations.correction.reason.required':
          'Veuillez fournir une raison pour cette correction',
        'validations.validBirthRegistrationNumber':
          "Le numéro d'enregistrement de la naissance ne peut être que numérique et doit comporter {validLength} caractères.",
        'validations.validDeathRegistrationNumber':
          "Le numéro d'enregistrement du décès ne peut être qu'alphanumérique et doit comporter {validLength} caractères.",
        'validations.validDrivingLicenseNumber':
          "Le numéro de permis de conduire ne peut être qu'alphanumérique et doit comporter {longueur valide} caractères.",
        'validations.validNationalId':
          "Le numéro d'identification national ne peut être que numérique et doit avoir une longueur de 9 chiffres.",
        'validations.validNationalIDLengths': '9',
        'validations.validPassportNumber':
          "Le numéro de passeport ne peut être qu'alphanumérique et doit comporter {validLength} caractères.",
        'validations.illegalMarriageAge': 'Âge illégal du mariage',
        'performance.regRates.select.item.byRegistrar': 'Par les greffiers',
        'performance.registrationsListTable.monthColumn': 'Mois',
        'performance.registrationsListTable.locationColumn': 'Localisation',
        'performance.registrationsListTable.registrarColumn': 'Registrar',
        'performance.registrationsListTable.totalRegistrationsColumn':
          'Total des inscriptions',
        'dashboard.noContent':
          'Aucun contenu à afficher. Assurez-vous que les variables suivantes sont configurées dans le <strong>client-config.js</strong> fourni par le package de configuration de votre pays:<br /><ul><li><strong>LEADERBOARDS_DASHBOARD_URL</strong></li><li><strong>REGISTRATIONS_DASHBOARD_URL</strong></li><li><strong>STATISTICS_DASHBOARD_URL</strong></li></ul>',
        'dashboard.dashboardTitle': 'Tableau de bord',
        'dashboard.leaderboardTitle': 'Classements',
        'dashboard.statisticTitle': 'Statistiques'
      }
    }
  ]
}

export default content
