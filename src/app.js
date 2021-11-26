import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index';
import initView from './view';
import validate from './validate';
import parse from './parser';

const getUrl = (form) => {
  const formData = new FormData(form);
  return formData.get('url').trim();
};

const routes = {
  getRssPath: (url) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`,
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
        },
        validUrls: [],
        outputData: {
          updateStatus: 'loading',
          feeds: [],
          posts: [],
          readPosts: [],
        },
        modal: {
          modalView: 'hidden',
          postView: {},
        },
      };

      const elements = {
        form: document.querySelector('.rss-form'),
        input: document.querySelector('#url-input'),
        submit: document.querySelector('[aria-label="add"]'),
        feedback: document.querySelector('.feedback'),
        posts: document.querySelector('.posts'),
        feeds: document.querySelector('.feeds'),
        modal: document.querySelector('.modal'),
      };

      const watchedState = initView(state, elements, i18nextInstance);

      const updatePosts = () => {
        watchedState.outputData.updateStatus = 'loading';
        setTimeout(() => {
          const request = (path) => axios.get(routes.getRssPath(path))
            .then((response) => parse(response.data.contents))
            .then(({ posts }) => posts);
          Promise.all(watchedState.validUrls.map((link) => request(link)))
            .then((data) => {
              const updatedPosts = data.flat();
              const { posts } = watchedState.outputData;
              const newPosts = _.differenceWith(updatedPosts, posts, _.isEqual);
              watchedState.outputData.posts.unshift(...newPosts);
              watchedState.outputData.updateStatus = 'loaded';
              updatePosts();
            })
            .catch((e) => {
              console.log(e);
              watchedState.outputData.updateStatus = 'loading';
              updatePosts();
            });
        }, 5000);
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.form.error = '';
        watchedState.form.status = 'filling';

        const url = getUrl(e.target);

        validate(url, watchedState.validUrls, i18nextInstance)
          .then(() => {
            watchedState.form.status = 'processed';
            axios.get(routes.getRssPath(url))
              .then((response) => {
                const parseData = parse(response.data.contents);

                if (!parseData) {
                  throw new Error('parserError');
                }

                const { feed: newFeeds, posts: newPosts } = parseData;

                const feedId = _.uniqueId();
                watchedState.outputData.feeds.push({ id: feedId, ...newFeeds });
                watchedState.outputData.posts.push(...newPosts);
                watchedState.form.status = 'finished';
              })
              .catch(({ message }) => {
                watchedState.form.error = message === 'parserError'
                  ? i18nextInstance.t('feedback.error.parserError')
                  : watchedState.form.error = i18nextInstance.t('feedback.error.networkErr');
                watchedState.form.status = 'failed';
              })
              .then(() => updatePosts());
          })
          .catch(({ message }) => {
            watchedState.form.error = message;
            watchedState.form.status = 'failed';
          })
          .then(() => {
            watchedState.validUrls.push(url);
            watchedState.form.status = 'filling';
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        const { type } = e.target;

        if (!watchedState.outputData.readPosts.includes(id)) {
          watchedState.outputData.readPosts.push(id);
        }

        if (type === 'button') {
          const postView = watchedState.outputData.posts.find(({ postId }) => postId === id);
          watchedState.modal.postView = { ...postView };
          watchedState.modal.modalView = 'show';
          watchedState.modal.modalView = 'hidden';
        }
      });
    });
};

export default app;
