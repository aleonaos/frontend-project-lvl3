import * as yup from 'yup';

export default (address, validUrls) => {
  const schema = yup.object().shape({
    url: yup.string().url('invalid').notOneOf(validUrls, 'double'),
  });

  return schema.validate({ url: address });
};
