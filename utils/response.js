const successResponse = (res, data, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

const errorResponse = (res, error, code = 'ERROR', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error,
    code
  });
};

const paginatedResponse = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  const pages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      pages
    },
    message
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
