module.exports = function varMiddleware(req, res, next) {
  res.locals.isAuth = req.session.isAuthenticated
  
  next()
}