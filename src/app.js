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
          updateStatus: 'loading',
          feeds: [],
          posts: [],
          readPosts: [],
        },
        modal: {
          show: false,
          postViewId: '',
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

      const updatePosts = () => {
        watchedState.outputData.updateStatus = 'loading';

        const { validUrls: links } = watchedState;
        links.forEach((link) => {
          axios.get(routes.getRssPath(link))
            .then((response) => {
              const { posts: updatedPosts } = parse(response.data.contents);
              const { posts } = watchedState.outputData;
              const newPosts = _.differenceWith(posts, updatedPosts, _.isEqual);

              watchedState.outputData.posts = [...newPosts, ...posts];
              watchedState.outputData.updateStatus = 'loaded';
            });
        });
        setTimeout(() => updatePosts(), 5000);
      };

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

                const feedId = _.uniqueId();
                watchedState.outputData.feeds.push({ id: feedId, ...newFeeds });
                watchedState.outputData.posts.push(...newPosts);
                watchedState.validUrls.push(url);
                watchedState.form.status = 'finished';
              })
              .catch(({ message }) => {
                watchedState.form.error = i18nextInstance.t(`feedback.error.${message}`);
                watchedState.form.status = 'failed';
              })
              .then(() => updatePosts(watchedState));
          })
          .catch(({ message }) => {
            watchedState.form.error = message;
            watchedState.form.status = 'failed';
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        const { type } = e.target;

        if (!watchedState.outputData.readPosts.includes(id)) {
          watchedState.outputData.readPosts.push(id);
        }

        if (type === 'button') {
          watchedState.modal.postViewId = id;
          watchedState.modal.show = true;
          watchedState.modal.show = false;
        }
      });
    });
};

export default app;

