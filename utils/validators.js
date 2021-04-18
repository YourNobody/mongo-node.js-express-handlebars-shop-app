const {body} = require('express-validator')
const User = require('../models/User')

const regMsgs = {
  email: 'Введите валидный email',
  emailReject: 'Пользователь с данным email уже существует',
  password: 'Пароль должен состоять минимум из 4 символов',
  passwordDecimal: 'Пароль должен содержать цифры',
  passwordLatin: 'Пароль должен содержать только латинские буквы и цифры',
  confirm: 'Пароли должны совпадать',
  name: 'Имя должно состоять минимум из 2 символов'
}

const courseMsgs= {
  title: 'Название курса должна быть не меньше 6 символов',
  price: 'Введите корректную цену',
  priceLength: 'Цена не может содержать 0 символов',
  img: 'Введите корректный URL картинки'
}

exports.registrationValidators = [
  body('email')
    .isEmail()
    .withMessage(regMsgs.email)
    .custom(async (value, {req}) => {
      try {
        const user = await User.findOne({ email: value })
        if (user) {
          return Promise.reject(regMsgs.emailReject)
        }
        return true
      } catch (error) {
        console.error(error)
      }
    })
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({min: 4})
    .withMessage(regMsgs.password)
    .isAlphanumeric()
    .custom((value, {req}) => {
      if (!value.match(/\d/)) {
        throw new Error(regMsgs.passwordDecimal)
      } else if (value.match(/[^A-Za-z\d]/g)) {
        throw new Error(regMsgs.passwordLatin)
      }
      return true
    }),
  body('confirm')
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error(regMsgs.confirm)
      }
      return true
    }),
  body('name')
    .isLength({min: 2})
    .withMessage(regMsgs.name)
    .trim()
]

exports.courseValidators = [
  body('title')
    .isLength({min: 6})
    .withMessage(courseMsgs.title)
    .trim(),
  body('price')
    .isNumeric()
    .withMessage(courseMsgs.price)
    .trim(),
  body('price')
    .isLength({min: 1})
    .withMessage(courseMsgs.priceLength),
  body('img')
    .isURL()
    .withMessage(courseMsgs.img)
    .trim()
]