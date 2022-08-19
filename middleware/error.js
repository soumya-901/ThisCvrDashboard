const errors = (err, req, res, next) => {
  console.log(err);
  res.status(500).json({ success: false, msg: err.message });
};

module.exports = errors;