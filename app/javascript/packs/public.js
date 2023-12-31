'use strict';

import escapeTextContentForBrowser from 'escape-html';
import loadPolyfills from '../gabsocial/load_polyfills';
import ready from '../gabsocial/ready';
import { start } from '../gabsocial/common';

start();

window.addEventListener('message', e => {
  const data = e.data || {};

  if (!window.parent || data.type !== 'setHeight') {
    return;
  }

  ready(( ) => {
    window.parent.postMessage({
      type: 'setHeight',
      id: data.id,
      height: document.getElementsByTagName('html')[0].scrollHeight,
    }, '*');
  });
});

function main ( ) {
  const IntlMessageFormat = require('intl-messageformat').default;
  const { timeAgoString } = require('../gabsocial/components/relative_timestamp');
  const { delegate } = require('rails-ujs');
  // const emojify = require('../gabsocial/components/emoji/emoji').default;
  const { getLocale } = require('../gabsocial/locales');
  const { messages } = getLocale();
  //(Rjc) 2019-05-24 defined but never used
  const React = require('react');
  const ReactDOM = require('react-dom');
  const createHistory = require('history').createBrowserHistory;

  const scrollToDetailedStatus = () => {
    const history = createHistory();
    const detailedStatuses = document.querySelectorAll('.public-layout .detailed-status');
    const location = history.location;

    if (detailedStatuses.length === 1 && (!location.state || !location.state.scrolledToDetailedStatus)) {
      detailedStatuses[0].scrollIntoView();
      history.replace(location.pathname, { ...location.state, scrolledToDetailedStatus: true });
    }
  };

  ready(() => {
    const locale = document.documentElement.lang;

    const dateTimeFormat = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

    // [].forEach.call(document.querySelectorAll('.emojify'), (content) => {
    //   content.innerHTML = emojify(content.innerHTML);
    // });

    [].forEach.call(document.querySelectorAll('time.formatted'), (content) => {
      const datetime = new Date(content.getAttribute('datetime'));
      const formattedDate = dateTimeFormat.format(datetime);

      content.title = formattedDate;
      content.textContent = formattedDate;
    });

    [].forEach.call(document.querySelectorAll('time.time-ago'), (content) => {
      const datetime = new Date(content.getAttribute('datetime'));
      const now      = new Date();

      content.title = dateTimeFormat.format(datetime);
      content.textContent = timeAgoString({
        formatMessage: ({ id, defaultMessage }, values) => (new IntlMessageFormat(messages[id] || defaultMessage, locale)).format(values),
        formatDate: (date, options) => (new Intl.DateTimeFormat(locale, options)).format(date),
      }, datetime, now, now.getFullYear());
    });

    const reactComponents = document.querySelectorAll('[data-component]');

    if (reactComponents.length > 0) {
      import(/* webpackChunkName: "containers/media_container" */ '../gabsocial/containers/media_container')
        .then(({ default: MediaContainer }) => {
          [].forEach.call(reactComponents, (component) => {
            [].forEach.call(component.children, (child) => {
              component.removeChild(child);
            });
          });
          const content = document.createElement('div');

          ReactDOM.render(<MediaContainer locale={locale} components={reactComponents} />, content);
          document.body.appendChild(content);
          scrollToDetailedStatus();
        })
        .catch(error => {
          console.error(error);
          scrollToDetailedStatus();
        });
    } else {
      scrollToDetailedStatus();
    }

    if (document.body.classList.contains('with-modals')) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const scrollbarWidthStyle = document.createElement('style');
      scrollbarWidthStyle.id = 'scrollbar-width';
      document.head.appendChild(scrollbarWidthStyle);
      scrollbarWidthStyle.sheet.insertRule(`body.with-modals--active { margin-right: ${scrollbarWidth}px; }`, 0);
    }
  });

  delegate(document, '.webapp-btn', 'click', ({ target, button }) => {
    if (button !== 0) {
      return true;
    }
    window.location.href = target.href;
    return false;
  });

  delegate(document, '.status__content__spoiler-link', 'click', ({ target }) => {
    const contentEl = target.parentNode.parentNode.querySelector('.e-content');

    if (contentEl.style.display === 'block') {
      contentEl.style.display = 'none';
      target.parentNode.style.marginBottom = 0;
    } else {
      contentEl.style.display = 'block';
      target.parentNode.style.marginBottom = null;
    }

    return false;
  });

  delegate(document, '.modal-button', 'click', e => {
    e.preventDefault();

    let href;

    if (e.target.nodeName !== 'A') {
      href = e.target.parentNode.href;
    } else {
      href = e.target.href;
    }

    window.open(href, 'gabsocial-intent', 'width=445,height=600,resizable=no,menubar=no,status=no,scrollbars=yes');
  });

  delegate(document, '#account_display_name', 'input', ({ target }) => {
    const name = document.querySelector('.card .display-name strong');
    if (name) {
      if (target.value) {
        // name.innerHTML = emojify(escapeTextContentForBrowser(target.value));
      } else {
        name.textContent = document.querySelector('#default_account_display_name').textContent;
      }
    }
  });

  delegate(document, '#account_avatar', 'change', ({ target }) => {
    const avatar = document.querySelector('.card .avatar img');
    const [file] = target.files || [];
    const url = file ? URL.createObjectURL(file) : avatar.dataset.originalSrc;

    avatar.src = url;
  });

  const getProfileAvatarAnimationHandler = (swapTo) => {
    //animate avatar gifs on the profile page when moused over
    return ({ target }) => {
      const swapSrc = target.getAttribute(swapTo);
      //only change the img source if autoplay is off and the image src is actually different
      if(target.getAttribute('data-autoplay') === 'false' && target.src !== swapSrc) {
        target.src = swapSrc;
      }
    };
  };

  delegate(document, 'img#profile_page_avatar', 'mouseover', getProfileAvatarAnimationHandler('data-original'));

  delegate(document, 'img#profile_page_avatar', 'mouseout', getProfileAvatarAnimationHandler('data-static'));

  delegate(document, '#account_header', 'change', ({ target }) => {
    const header = document.querySelector('.card .card__img img');
    const [file] = target.files || [];
    const url = file ? URL.createObjectURL(file) : header.dataset.originalSrc;

    header.src = url;
  });

  delegate(document, '#account_locked', 'change', ({ target }) => {
    const lock = document.querySelector('.card .display-name i');

    if (target.checked) {
      lock.style.display = 'inline';
    } else {
      lock.style.display = 'none';
    }
  });

  delegate(document, '.input-copy input', 'click', ({ target }) => {
    target.focus();
    target.select();
    target.setSelectionRange(0, target.value.length);
  });

  delegate(document, '.input-copy button', 'click', ({ target }) => {
    const input = target.parentNode.querySelector('.input-copy__wrapper input');

    const oldReadOnly = input.readonly;

    input.readonly = false;
    input.focus();
    input.select();
    input.setSelectionRange(0, input.value.length);

    try {
      if (document.execCommand('copy')) {
        input.blur();
        target.parentNode.classList.add('copied');

        setTimeout(() => {
          target.parentNode.classList.remove('copied');
        }, 700);
      }
    } catch (err) {
      console.error(err);
    }

    input.readonly = oldReadOnly;
  });

  const handleRemoveSpecialCharactersForUsername = (e) => {
    var input = e.target;
    var text = input.value.replace(/[^\w\d_]/gmi, "");
    if (/\s/.test(text)) {
        text = text.replace(/\s/g, "");
    }
    input.value = text;
  };

  delegate(document, '#user_account_attributes_username.registration_username', 'keydown', handleRemoveSpecialCharactersForUsername);
  delegate(document, '#user_account_attributes_username.registration_username', 'keyup', handleRemoveSpecialCharactersForUsername);
  delegate(document, '#user_account_attributes_username.registration_username', 'change', handleRemoveSpecialCharactersForUsername);

  delegate(document, '#admin_account_action_type', 'change', (e) => {
    var adminAccountActionBtn = document.getElementById('admin-account-actions-action-btn');
    if (e.target.value === 'suspend') {
      adminAccountActionBtn.setAttribute('data-confirm', 'Are you sure?');
    } else {
      adminAccountActionBtn.removeAttribute('data-confirm');
    }
  });
  
}

loadPolyfills().then(main).catch(error => {
  console.error(error);
});

const { pathname } = window.location

if (pathname === '/auth' || pathname === '/auth/edit') {
  import('../gabsocial/account-section/auth-edit.js')
    .then(({ default: startAuthEdit }) => startAuthEdit())
    .catch(function(err) {
      const { message, stack } = err
      console.error('error couldn\'t load auth-edit', message, stack)
    })
}

if (pathname === '/settings/two_factor_authentication/confirmation/new') {
  import('../gabsocial/account-section/two-factor.js')
    .then(({ default: startTwoFactor }) => startTwoFactor())
    .catch(function(err) {
      const { message, stack } = err
      console.error('error couldn\'t load two-factor', message, stack)
    })
}
