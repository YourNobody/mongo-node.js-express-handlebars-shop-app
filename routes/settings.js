const {Router} = require('express')
const auth = require('../middlewares/auth')

const router = new Router()

router.get('/', auth, (req, res) => {
  res.render('settings', {
    isSettings: true,
    user: req.user.toObject()
  })
})

module.exports = router