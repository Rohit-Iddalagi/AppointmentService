const responseFormatter = {
  success: (data, message = 'Success', statusCode = 200) => ({
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  }),

  error: (message = 'An error occurred', statusCode = 500, errors = null) => {
    const payload = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      payload.errors = errors;
    }

    return payload;
  },

  paginated: (data, pagination, message = 'Success', statusCode = 200) => ({
    success: true,
    statusCode,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: Math.ceil(pagination.total / pagination.limit)
    },
    timestamp: new Date().toISOString()
  }),

  created: (data, message = 'Created successfully', statusCode = 201) => ({
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString()
  })
};

module.exports = responseFormatter;
