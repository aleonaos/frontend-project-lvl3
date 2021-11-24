import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index';
import initView from './view';
import validate from './validate';
import parse from './parser';

const getUrl = (form) => {
  const formData = new FormData(form);
  return formData.get('url').trim();
};

const routes = {
  getRssPath: (url) => `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`,
};

const app = () => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then(() => {
      const state = {
        form: {
          status: 'filling',
          error: '',
          enteredUrl: '',
        },
        validUrls: [],
        outputData: {
          feeds: [],
          posts: [],
        },
      };

      const elements = {
        form: document.querySelector('.rss-form'),
        input: document.querySelector('#url-input'),
        submit: document.querySelector('button'),
        feedback: document.querySelector('.feedback'),
        posts: document.querySelector('.posts'),
        feeds: document.querySelector('.feeds'),
      };

      const watchedState = initView(state, elements, i18nextInstance);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.form.error = '';
        watchedState.form.status = 'filling';

        const url = getUrl(e.target);

        validate(url, watchedState.validUrls, i18nextInstance)
          .then(() => {
            watchedState.form.enteredUrl = url;
            axios.get(routes.getRssPath(url))
              .then((response) => {
                const parseData = parse(response.data.contents);
                const { feed: newFeeds, posts: newPosts } = parseData;
                watchedState.outputData.feeds.push(newFeeds);
                watchedState.outputData.posts.push(...newPosts);
                watchedState.validUrls.push(url);
                watchedState.form.status = 'finished';
              })
              .catch(({ message }) => {
                watchedState.form.error = i18nextInstance.t(`feedback.error.${message}`);
                watchedState.form.status = 'failed';
              });
          })
          .catch(({ message }) => {
            watchedState.form.error = message;
            watchedState.form.status = 'failed';
          });
      });
    });
};

export default app;
