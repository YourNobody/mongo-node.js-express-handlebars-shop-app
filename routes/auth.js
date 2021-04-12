const {Router} = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../models/User')
const sendRegistrationMail = require('../emails/sendRegMail')
const sendResetMail = require('../emails/sendResetMail')
const nodemailer = require('nodemailer')

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
  try {
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
  } catch (error) {
    console.error(error)
  }
})

router.post('/register', async (req, res) => {
  const {email, password, name, confirm} = req.body
  const candidate = await User.findOne({ email })

  if (candidate) {
    req.flash('registerError', 'Пользователь с таким Email уже существует')
    res.redirect('/auth/login#register')
  } else {
    const hashPassword = bcrypt.hashSync(password, 10)

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
  
    sendRegistrationMail(email)
      .catch((err) => console.error(err))
  }
})

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err
    res.redirect('/auth/login#login')
  })
})

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Восстановление пароля',
    error: req.flash('error')
  })
})

router.post('/reset', async (req, res) => {
  try {
    const {email} = req.body
    const user = await User.findOne({ email })
    if (user) {
      crypto.randomBytes(32, async (err, buff) => {
        if (err) {
          req.flash('error', 'Что-то пошло не так, повторите попытку позже')
          return res.redirect('/auth/reset')
        }

        const token = buff.toString('hex')
        
        user.resetToken = token
        user.resetTokenExp = Date.now() + 60 * 60 * 1000

        await user.save()

        req.flash('registerSuccess', `На почту ${email} отправлено сообщение с инструкцией восстановления пароля`)
        res.redirect('/auth/login#login')

        try {
          await sendResetMail(email, token)
        } catch (error) {
          req.flash('error', 'Произошла ошибка при отправке письма')
          res.redirect('/auth/reset')
          throw error
        }
      })
    } else {
      req.flash('error', 'Пользователя с таким email не существует')
      res.redirect('/auth/reset')
    }
  } catch (error) {
    console.error(error) 
  }
})

router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login#login')
  }

  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExp: {$gt: Date.now()}
  })

  if (user){
    res.render('auth/password', {
      title: 'Восстановление пароля',
      passwordError: req.flash('passwordError'),
      userId: user._id.toString(),
      token: req.params.token
    })
  } else {
    res.redirect('/auth/login#login')
  }
})

router.post('/password', async (req, res) => {
  const {password, confirm, userId, token} = req.body

  if (password.match(/\s/g)) {
    req.flash('passwordError', 'Пароль не должен содержать пробелов!')
    return res.redirect(`/auth/password/${token}`)
  }

  if (password !== confirm) {
    req.flash('passwordError', 'Пароль не подтвержден!')
    return res.redirect(`/auth/password/${token}`)
  }

  const user = await User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExp: {$gt: Date.now()}
  })

  if (user) {
    user.password = bcrypt.hashSync(password, 10)
    user.resetToken = undefined
    user.resetTokenExp = undefined
    await user.save()

    req.flash('registerSuccess', 'Ваш пароль был успешно изменен')
    res.redirect('/auth/login#login')

  } else {
    req.flash('loginError', 'Время жизни токена истекло')
    return res.redirect('/auth/login#login')
  }
})

module.exports = router