const {Router} = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const router = new Router()

router.get('/login', (req, res) => {
  res.render('auth/login', {
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
    registerSuccess: req.flash('registerSuccess')
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
      req.flash('loginError', 'Неверный пароль')
      res.redirect('/auth/login#register')
    }

  } else {
    req.flash('loginError', 'Пользователя с таким Email не существует')
    res.redirect('/auth/login#login')
  }

})

router.post('/register', async (req, res) => {
  const {email, password, name, confirm} = req.body
  const candidate = await User.findOne({ email })

  if (candidate) {
    req.flash('registerError', 'Пользователь с таким Email уже существует')
    res.redirect('/auth/login#register')
  } else {
    const hashPassword = bcrypt.hashSync(password)

    if (confirm !== password) {
      req.flash('registerError', 'Пароль не подтвержден')
      return res.redirect('/auth/login#register')
    }

    const user = new User({
      email, name,
      password: hashPassword, 
      cart: { items: [] }
    })
    await user.save()

    req.flash('registerSuccess', 'Регистрация прошла успешно')
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