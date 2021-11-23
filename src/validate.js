import * as yup from 'yup';

export default (address, validUrls, i18n) => {
  yup.setLocale({
    mixed: {
      notOneOf: i18n.t('feedback.error.double'),
    },
    string: {
      url: i18n.t('feedback.error.invalid'),
    },
  });

  const schema = yup.object().shape({
    url: yup
      .string()
      .url()
      .notOneOf(validUrls),
  });

  return schema.validate({ url: address });
};
