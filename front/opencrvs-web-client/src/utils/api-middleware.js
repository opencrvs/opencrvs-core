import { logoutUser } from 'actions/user-actions';

export const apiMiddleware = function(config, url, dispatch = null) {

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
      console.log('BAD IMPLEMENTATION: ' + err);
      if (dispatch != null) {
        dispatch(logoutUser());
      }
    });
};