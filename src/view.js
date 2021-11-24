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

const buildContainer = (title, list) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const containerHeader = document.createElement('h2');
  containerHeader.classList.add('card-title', 'h4');
  containerHeader.innerHTML = title;
  cardBody.append(containerHeader);

  container.append(cardBody, list);

  return container;
};

const buildUlElement = () => {
  const ulElement = document.createElement('ul');
  ulElement.classList.add('list-group', 'border-0', 'rounded-0');

  return ulElement;
};

const renderFeeds = (feeds, feedsElement, i18n) => {
  feedsElement.innerHTML = '';

  const feedsList = buildUlElement();

  feeds.forEach((feed) => {
    const liElement = document.createElement('li');
    liElement.classList.add('list-group-item', 'border-0', 'border-end-0');

    const header = document.createElement('h3');
    header.classList.add('h6', 'm-0');
    header.innerHTML = feed.feedTitle;

    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.innerHTML = feed.feedDescription;

    liElement.append(header, description);
    feedsList.append(liElement);
  });

  const feedsContainer = buildContainer(i18n.t('feedsBlock'), feedsList);
  feedsElement.append(feedsContainer);
};

const renderPosts = (posts, postsElement, i18n) => {
  postsElement.innerHTML = '';

  const postsList = buildUlElement();

  posts.forEach((post) => {
    const liElement = document.createElement('li');
    liElement.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0'
    );

    const link = document.createElement('a');
    link.setAttribute('href', post.postLink);
    link.setAttribute('data-id', post.feedId);
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('target', '_blank');
    link.classList.add('fw-bold');
    link.innerHTML = post.postTitle;

    const viewButton = document.createElement('button');
    viewButton.setAttribute('type', 'button');
    viewButton.setAttribute('data-id', post.feedId);
    viewButton.setAttribute('data-bs-toggle', 'modal');
    viewButton.setAttribute('data-bs-target', '#modal');
    viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    viewButton.innerHTML = 'Просмотр';

    liElement.append(link, viewButton);
    postsList.append(liElement);
  });

  const postsContaiter = buildContainer(i18n.t('postsBlock'), postsList);
  postsElement.append(postsContaiter);
};

const renderContent = (data, elements, i18n) => {
  const { feeds: feedsElement, posts: postsElement } = elements;
  const { feeds, posts } = data;

  renderFeeds(feeds, feedsElement, i18n);
  renderPosts(posts, postsElement, i18n);
};

const renderForm = (state, elements, i18n) => {
  const { submit } = elements;

  switch (state.form.status) {
    case 'filling':
      submit.setAttribute('disabled', true);
      break;
    case 'finished':
      submit.removeAttribute('disabled');
      renderSuccess(elements, i18n);
      renderContent(state.outputData, elements, i18n);
      break;
    case 'failed':
      submit.removeAttribute('disabled');
      renderError(state.form.error, elements);
      break;
    default:
      throw new Error(`Unknown status^ ${state.form.status}`);
  }
};

const initView = (state, elements, i18n) => {
  elements.input.focus();
  const mapping = {
    'form.status': () => renderForm(state, elements, i18n),
  };

  const watchedState = onChange(state, (path) => {
    if (mapping[path]) {
      mapping[path]();
    }
  });

  return watchedState;
};

export default initView;
