context('Review', () => {
  beforeEach(() => {
    cy.login('registrar')
  })

  it('select an application from queue to see more information', () => {
    cy.wait(5000)

    // let trackid2 = 'BKJTABF'
    // cy.contains(`${trackid2}`).click()
    // cy.wait(5000)
    // cy.get(`#printCertificate_${trackid2}`).click()

    cy.contains('Print').click()
    cy.selectOption('#personCollectingCertificate', 'Other', 'Other')
    cy.selectOption('#otherPersonIDType', 'National ID', 'National ID')

    cy.get('#documentNumber').type('1020607910288')
    cy.get('#otherPersonGivenNames').type('Md. Rakibul Islam')
    cy.get('#otherPersonFamilyName').type('Mohemmad')
    cy.get('#otherPersonSignedAffidavit_true').click()
    cy.get('#print-confirm-button').click()

    //payment method

    cy.get('#payment-confirm-button').click()
    cy.wait(5000)

    //Certificate Preview
    //Confirm details button
    cy.get('#registerApplicationBtn').click()
    // Finish Print
    cy.get('#finish-printing-certificate').click()
  })
})
