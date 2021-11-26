import onChange from 'on-change';

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

const renderFeeds = (feeds, i18n) => {
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

  return feedsContainer;
};

const renderPosts = (posts, readPosts, i18n) => {
  const postsList = buildUlElement();

  posts.forEach((post) => {
    const liElement = document.createElement('li');
    liElement.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const link = document.createElement('a');
    const classNames = readPosts.includes(post.postId) ? 'fw-normal, link-secondary' : 'fw-bold';
    link.setAttribute('href', post.postLink);
    link.setAttribute('data-id', post.postId);
    link.setAttribute('rel', 'noopener noreferrer');
    link.setAttribute('target', '_blank');
    link.setAttribute('class', classNames);
    link.innerHTML = post.postTitle;

    const viewButton = document.createElement('button');
    viewButton.setAttribute('type', 'button');
    viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    viewButton.setAttribute('data-id', post.postId);
    viewButton.setAttribute('data-bs-toggle', 'modal');
    viewButton.setAttribute('data-bs-target', '#modal');
    viewButton.innerHTML = i18n.t('postsBlock.button');

    liElement.append(link, viewButton);
    postsList.append(liElement);
  });

  const postsContaiter = buildContainer(i18n.t('postsBlock.title'), postsList);

  return postsContaiter;
};

const renderContent = (data, outputElements, i18n) => {
  const { feeds, posts, readPosts } = data;
  const { feeds: feedsElement, posts: postsElement } = outputElements;

  const feedsContainer = renderFeeds(feeds, i18n);
  const postsContainer = renderPosts(posts, readPosts, i18n);

  feedsElement.replaceChildren(feedsContainer);
  postsElement.replaceChildren(postsContainer);
};

const renderForm = (state, elements, i18n) => {
  const { input, feedback, submit } = elements;

  switch (state.form.status) {
    case 'filling':
      submit.removeAttribute('disabled');
      input.removeAttribute('readonly');
      break;
    case 'processed':
      feedback.textContent = '';
      input.setAttribute('readonly', true);
      submit.setAttribute('disabled', true);
      break;
    case 'finished':
      submit.removeAttribute('disabled');
      input.removeAttribute('readonly');
      renderSuccess(elements, i18n);
      renderContent(state.outputData, elements, i18n);
      break;
    case 'failed':
      submit.removeAttribute('disabled');
      input.removeAttribute('readonly');
      renderError(state.form.error, elements);
      break;
    default:
      throw new Error(`Unknown status^ ${state.form.status}`);
  }
};

const renderReadPosts = (readPosts) => {
  readPosts.forEach((id) => {
    const readPost = document.querySelector(`[data-id="${id}"]`);
    readPost.classList.remove('fw-bold');
    readPost.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModal = (modal, { modal: modalElement }) => {
  const modalTitle = modalElement.querySelector('.modal-title');
  const modalBody = modalElement.querySelector('.modal-body');
  const modalLink = modalElement.querySelector('.full-article');

  const { postTitle, postDescription, postLink } = modal.postView;

  modalTitle.innerHTML = postTitle;
  modalBody.textContent = postDescription;
  modalLink.setAttribute('href', postLink);
};

const initView = (state, elements, i18n) => {
  elements.input.focus();

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.status':
        renderForm(state, elements, i18n);
        break;
      case 'outputData.updateStatus':
        if (value === 'loaded') {
          renderContent(state.outputData, elements, i18n);
        }
        break;
      case 'outputData.readPosts':
        renderReadPosts(state.outputData.readPosts);
        break;
      case 'modal.modalView':
        if (value === 'show') {
          renderModal(state.modal, elements);
        }
        break;
      default:
        break;
    }
  });

  return watchedState;
};

export default initView;
