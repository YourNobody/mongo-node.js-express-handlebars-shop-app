module.exports = function(req, res, next) {
  res.status(404).render('page404')
}