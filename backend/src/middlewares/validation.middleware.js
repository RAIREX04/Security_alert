const { fail } = require('../utils/api-response');

function validate(schemas = {}) {
  return (req, res, next) => {
    const validated = {};
    const sources = ['body', 'params', 'query'];

    for (const source of sources) {
      if (!schemas[source]) continue;
      const result = schemas[source].safeParse(req[source]);
      if (!result.success) {
        return fail(
          res,
          'Validasi gagal',
          400,
          result.error.flatten(),
        );
      }
      validated[source] = result.data;
    }

    req.validated = validated;
    return next();
  };
}

module.exports = { validate };
