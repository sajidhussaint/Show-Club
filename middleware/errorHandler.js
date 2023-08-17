const errorHandler = (err, req, res, next) => {
    const errStatus = err.statusCode || 500;
  
  
    res.status(errStatus).render("error500");
  };
  
  module.exports = errorHandler;