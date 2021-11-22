import onChange from "on-change";

const textFeedback = {
  valid: 'RSS успешно загружен',
  invalid: 'Ссылка должна быть валидным URL',
  double: 'RSS уже существует',
};

const renderForm = (status, { form, input, feedback }) => {
  if (status === 'valid') {
    form.reset();
    input.focus();
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
  } else {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
  }
  feedback.innerHTML = textFeedback[status];
};

const initView = (state, elements) => {
  elements.input.focus();
  const mapping = {
    'form.status': () => renderForm(state.form.status, elements),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;
