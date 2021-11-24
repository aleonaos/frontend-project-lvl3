const getContent = (doc, tag) => doc.querySelector(tag).textContent;

export default (data, i18n) => {
  const parser = new DOMParser();
  const rssData = parser.parseFromString(data, 'text/xml');

  if (xml.querySelector('parsererror')) {
    throw new Error(i18n.t('feedback.error.parserError'));
  }

  const feedTitle = getContent(rssData, 'title');
  const feedDescription = getContent(rssData, 'description');

  const posts = [];
  const rssItems = rssData.querySelector('item');
  rssItems.forEach((item) => {
    const postTitle = getContent(item, 'title');
    const postDescription = getContent(item, 'description');
    const postLink = getContent(item, 'link');

    posts.push({ postTitle, postDescription, postLink });
  });

  return {
    feed: { feedTitle, feedDescription },
    posts,
  };
};