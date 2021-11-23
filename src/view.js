import onChange from 'on-change';

const renderSuccess = (elements, i18n) => {
  const { form, input, feedback } = elements;

  form.reset();
  input.focus();
  input.classList.remove('is-invalid');
  feedback.classList.remove('text-danger');
  feedback.classList.add('text-success');
  feedback.innerHTML = i18n.t('feedback.success');
};

const renderError = (error, elements) => {
  const { input, feedback } = elements;

  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.innerHTML = error;
};

const renderForm = ({ status, error }, elements, i18n) => {
  const { submit } = elements;

  switch (status) {
    case 'filling':
      submit.setAttribute('disabled', true);
      break;
    case 'finished':
      submit.removeAttribute('disabled');
      renderSuccess(elements, i18n);
      break;
    case 'failed':
      submit.removeAttribute('disabled');
      renderError(error, elements);
      break;
    default:
      throw new Error(`Unknown status^ ${status}`);
  }
};

const initView = (state, elements, i18n) => {
  elements.input.focus();
  const mapping = {
    'form.status': () => renderForm(state.form, elements, i18n),
    'form.error': () => renderError(state.form.error, elements),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;
