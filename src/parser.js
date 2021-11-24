export default (content) => {
  const parser = new DOMParser();
  const rssData = parser.parseFromString(content, 'text/xml');
  console.log(rssData)

  if (rssData.querySelector('parsererror')) {
    throw new Error('parserError');
  }

  const feedTitle = rssData.querySelector('title').textContent;
  const feedDescription = rssData.querySelector('description').textContent;

  const posts = [];
  const rssItems = Array.from(rssData.querySelectorAll('item'));
  rssItems.forEach((item) => {
    const postId = item.querySelector('guid').textContent;
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;

    posts.push({
      postId,
      postTitle,
      postDescription,
      postLink,
    });
  });

  return {
    feed: { feedTitle, feedDescription },
    posts,
  };
};
