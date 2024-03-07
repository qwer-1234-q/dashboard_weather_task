// import { errorMessage, apiCall, setToken } from './main.js';
// import { fileToDataUrl } from './helpers.js';

import { toastError } from './helpers';

// const current_user = document.createElement('div');
// let timer;

/***************************************************************
                        Check user input
***************************************************************/
export function checkName (name) {
  if (name.length < 3 || name.length > 50) {
    // errorMessage('The name should the length of name should be between 3 and 50 char.');
    return false;
  }
  return true;
}

export function checkPasswordConfirm (pwd, pwdCf) {
  const passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
  const msg = 'The password should ' +
    '\n1. contain at least one Uppercase letter(A to Z)' +
    '\n2. contain at lesat one lowercase letter(a to z)' +
    '\n3. contain at least one number' +
    '\n4. the length should be between 8 to 20 characters' +
    '\n5. the name cannot contain space';
  if (!pwd.match(passw)) {
    // errorMessage(msg);
    console.log(msg);
    toastError(msg)
    return false;
  }
  const passwordLength = pwd.length;
  if (passwordLength !== pwdCf.length) {
    // errorMessage('The passwords are not the same!');
    return false;
  }
  for (let i = 0; i < passwordLength; i++) {
    if (pwd[i] !== pwdCf[i]) {
      // errorMessage('The passwords are not the same!');
      return false;
    }
  }
  console.log('password correct');
  return true;
}

export function checkUser (loginEmail, loginPwd) {
  if (loginEmail === '' || loginPwd === '' || loginPwd.length > 20) {
    // errorMessage('The email or password is incorrect!');
    return false;
  }
  if (!checkEmailType(loginEmail)) {
    // errorMessage('This is not an email!');
    return false;
  }
  return true;
}

export function checkEmailType (email) {
  let at = 0;
  for (let i = 0; i < email.length; i++) {
    if (at < 1 && email[i] === '@') {
      at = 1;
      console.log('have @');
    }
    if (at === 1 && email[i] === '.') {
      console.log('correct type');
      return true;
    }
  }
  console.log('incorrect email');
  return false;
}

// function checkNumberOnly (input) {
//     let passw= /^[0-9]+$/;
//     if (input.match(passw)) {
//         return true;
//     }
//     return false;
// }
