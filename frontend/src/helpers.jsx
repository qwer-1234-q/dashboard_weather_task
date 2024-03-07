import { toast } from 'react-toastify';
/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function getToken () {
  return localStorage.getItem('token')
}

export function removeToken () {
  localStorage.removeItem('token')
}

export function toastError (msg) {
  toast.error(msg, {
    position: 'top-center',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
  });
}

export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getVideoId (url) {
  const regExp = '^.*((youtu.be\\/)|(v\\/)|(/u\\/\\w\\/)|(embed\\/)|(watch\\?))\\??v?=([^#\\&\\?]*).*';
  const match = url.match(regExp);
  const videoId = (match && match[7]) ? match[7] : null;
  return videoId
}

export function fileToDataUrl (file) {
  const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const valid = validFileTypes.find(type => type === file.type);
  // Bad data, let's walk away.
  if (!valid) {
    throw Error('provided file is not a png, jpg or jpeg image.');
  }

  const reader = new FileReader();
  const dataUrlPromise = new Promise((resolve, reject) => {
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
  });
  reader.readAsDataURL(file);
  return dataUrlPromise;
}

export const apiFetch = (methodInput, path, body) => {
  const token = getToken()

  const requestOptions = {
    method: methodInput,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };

  if (token) {
    requestOptions.headers.Authorization = `Bearer ${token}`;
  }
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:5005/${path}`, requestOptions)
      .then((response) => {
        console.log(path, ': ', response.status);
        if (response.status === 400 || response.status === 403) {
          response.json().then((errorMsg) => {
            reject(errorMsg.error);
          });
        } else if (response.status === 200) {
          response.json().then((data) => {
            console.log('api data: ', data);
            resolve(data);
          });
        }
      })
  })
    .catch((err) => {
      // these errors are handled peacefully and should not displayed to the users
      // as it is only way to tell a game has ended
      if (err !== 'Session ID is not an active session') {
        toastError(err)
      }
    });
};
