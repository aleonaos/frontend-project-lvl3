import initView from './view';
import validate from './validate';

const getUrl = (form) => {
  const formData = new FormData(form);
  return formData.get('url').trim();
};

const app = () => {
  const state = {
    form: {
      status: '',
      enteredUrl: '',
    },
    validUrls: [],
    posts: [],
    feeds: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
  };

  const watchedState = initView(state, elements);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = getUrl(e.target);

    validate(url, watchedState.validUrls)
      .then(() => {
        watchedState.form.status = 'valid';
        watchedState.form.enteredUrl = url;
        watchedState.validUrls.push(url);
      })
      .catch(({ errors }) => {
        watchedState.form.status = errors;
      });
  });
};

export default app;
