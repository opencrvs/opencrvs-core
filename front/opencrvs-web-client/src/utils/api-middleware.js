

import { logoutUser } from 'actions/user-actions';

export const apiMiddleware = function(config, url, dispatch) {

  return fetch(url, config)
    .then(response =>
      response.json().then(payload => ({ payload, response }))
    )
    .then(({ payload, response }) => {
      if (!response.ok) {
        return Promise.reject(payload);
      } else {
        return payload;
      }
    })
    .catch(err => {
      if (err.message == 'Invalid token') {
        dispatch(logoutUser());
      } else {
        console.log(err);
      }
    });
};