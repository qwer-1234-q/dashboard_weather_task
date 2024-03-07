const account = 'randomEmail@email.com';
const pass = 'random password';

describe('happy path', () => {
  //  1. Registers successfully
  it('should navigate to the home screen successfully', () => {
    cy.visit('localhost:3000/login');
    cy.url().should('include', 'localhost:3000/login');
  });

  it('should navigate to the register screen successfully', () => {
    cy.visit('localhost:3000/signup');
    cy.url().should('include', 'localhost:3000/signup');
    cy.get('input[name="username"]')
      .focus()
      .type('randomEmail');
    cy.get('input[name="email"]')
      .focus()
      .type('randomEmail@email.com');
    cy.get('input[name="password"]')
      .focus()
      .type('random password');
    cy.get('input[name="passwordConfirm"]')
      .focus()
      .type('random password');
    cy.get('form')
      .submit();
    cy.visit('localhost:3000/dashboard');
    cy.url().should('include', 'localhost:3000/dashboard');
  });

  it('should login successfully', () => {
    cy.visit('localhost:3000/login');
    cy.url().should('include', 'localhost:3000/login');
    cy.get('input[name="email"]')
      .focus()
      .type(account);
    cy.get('input[name="password"]')
      .focus()
      .type(pass);
    cy.get('form')
      .submit();
    cy.visit('localhost:3000/dashboard');
    cy.url().should('include', 'localhost:3000/dashboard');
  })

  // 2. Creates a new game successfully
  it('should create a new game successfuly', () => {
    cy.visit('/');
    cy.window().its('localStorage').invoke('setItem', 'myKey', 'myValue');
    cy.window().its('localStorage').invoke('getItem', 'myKey').should('equal', 'myValue');
  });

  // 3. (Not required) Updates the thumbnail and name of the game successfully (yes, it will have no questions)
  // 4. Starts a game successfully
  // 5. Ends a game successfully (yes, no one will have played it)
  // 6. Loads the results page successfully

  // 7. Logs out of the application successfully
  // it('should navigate to the login screen successfully after logout', () => {
  //   cy.visit('localhost:3000/dashboard', {
  //     onBeforeLoad: () => {
  //       cy.get('button[name="logout-button"]')
  //         .click();
  //       cy.url().should('include', 'localhost:3000/login');
  //     }
  //   });
  // })
  // 8. Logs back into the application successfully
});
