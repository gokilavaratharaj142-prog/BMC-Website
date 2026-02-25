const sanitize = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string' && obj[key].startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  }
  return obj;
};

const sanitizer = (req, res, next) => {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

module.exports = sanitizer;
