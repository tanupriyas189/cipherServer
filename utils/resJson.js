exports.sendRes = (error, status, data, message, results, res) => {
  res.status(status).json({
    error: error,
    results: results,
    status: status,
    data: data,
    message: message,
  });
};
