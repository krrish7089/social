'use strict';

import axios from 'axios';
import LinkHeader from 'http-link-header';
import ready from './ready';
import store from './store'

export const getLinks = response => {
  const value = response.headers.link;

  if (!value) {
    return { refs: [] };
  }

  return LinkHeader.parse(value);
};

const csrfHeader = {};

function setCSRFHeader() {
  const csrfToken = document.querySelector('meta[name=csrf-token]');
  if (csrfToken) {
    csrfHeader['X-CSRF-Token'] = csrfToken.content;
  }
}

ready(setCSRFHeader);

export default (getState = store.getState) => {
  const authToken = getState().getIn(['meta', 'access_token'], '')

  return axios.create({
    headers: Object.assign(csrfHeader, authToken ? {
      'Authorization': `Bearer ${authToken}`,
    } : {}),

    transformResponse: [function (data) {
      try {
        return JSON.parse(data);
      } catch (Exception) {
        return data;
      }
    }],
  });
};
