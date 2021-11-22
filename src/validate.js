import * as yup from 'yup';

export default (address) => {
  const schema = yup.object().shape({
    url: yup.string().url(),
  });

  return schema.validate({ url: address });
};