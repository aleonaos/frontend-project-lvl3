import _ from 'lodash';

export default (content) => {
  const parser = new DOMParser();
  const rssData = parser.parseFromString(content, 'text/xml');

  if (rssData.querySelector('parsererror')) {
    throw new Error('parserError');
  }

  const id = _.uniqueId();
  const feedTitle = rssData.querySelector('title').textContent;
  const feedDescription = rssData.querySelector('description').textContent;

  const posts = [];
  const rssItems = Array.from(rssData.querySelectorAll('item'));
  rssItems.forEach((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;

    posts.push({
      feedId: id,
      postTitle,
      postDescription,
      postLink,
    });
  });

  return {
    feed: { id, feedTitle, feedDescription },
    posts,
  };
};
