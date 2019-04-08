context('Review', () => {
  beforeEach(() => {
    cy.login('registrar')
  })

  it('select an application from queue to see more information', () => {
    cy.wait(10000)
    cy.contains('Review').click()

    //Edit child details
    cy.get('#Childsdetails_link').click()
    cy.get('#edit_confirm').click()
    cy.get('#firstNames').type('গায়ত্রী')
    cy.get('#familyName').type('রাবণ')
    cy.get('#firstNamesEng').type('Mahesh')
    cy.get('#multipleBirth').type('1')
    cy.get('#next_section').click()

    //Edit MOther details
    cy.get('#firstNames').type('গায়ত্রী')
    cy.get('#firstNamesEng').type('Fathername')
    cy.get('#familyNameEng').type('Familyname')
    cy.get('#next_section').click()

    //Edit Father details
    cy.get('#next_section').click()

    //Edit application details
    cy.get('#registrationPhone').type('0643354797')
    cy.get('#next_section').click()

    //Edit document details
    cy.get('#next_section').click()

    cy.get('#next_button_child').click()
    cy.get('#next_button_mother').click()
    cy.get('#next_button_father').click()
    cy.get('#registerApplicationBtn').click()

    cy.get('#register_confirm').click()
  })
})
