const {Router} = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const router = new Router()

router.get('/login', (req, res) => {
  res.render('auth/login', {
    isLogin: true
  })
})

router.post('/login', async (req, res) => {
  const {email, password} = req.body
  const candidate = await User.findOne({ email })

  if (candidate) {
    const isSame = bcrypt.compareSync(password, candidate.password)

    if (isSame) {
      req.session.user = candidate
      req.session.isAuthenticated = true
      req.session.save((err) => {
        if (err) throw err
        res.redirect('/')
      })

    } else {
      res.redirect('/auth/login#register')
    }

  } else {
    res.redirect('/auth/login#login')
  }

})

router.post('/register', async (req, res) => {
  const {email, password, name, confirm} = req.body
  const candidate = await User.findOne({ email })

  if (candidate) {
    res.redirect('/auth/login#register')
  } else {
    const hashPassword = bcrypt.hashSync(password)
    const user = new User({
      email, name,
      password: hashPassword, 
      cart: { items: [] }
    })
    await user.save()
    res.redirect('/auth/login#login')
  }
})

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err
    res.redirect('/auth/login#login')
  })
})

module.exports = router