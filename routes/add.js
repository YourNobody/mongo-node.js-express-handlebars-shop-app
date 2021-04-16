const { Router } = require('express')
const {validationResult} = require('express-validator/check')
const {courseValidators} = require('../utils/validators')
const Course = require('../models/Course')
const auth = require('../middlewares/auth')
const router = new Router()

router.get('/', auth, (req, res) => {
  res.render('add', {
    title: 'Добавление курса',
    isAdd: true,
    error: req.flash('error')
  })
  process.env.NODE_ENV === 'test' && res.send()
})

router.post('/', auth, courseValidators, async (req, res) => {
  const { title, img, price } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg)
    return res.status(422).render('add', {
      title: 'Добавление курса',
      isAdd: true,
      error: req.flash('error'),
      data: {
        title, price, img
      }
    })
  }

  const course = new Course({
    title, img, price, userId: req.user._id
  })

  try {
    await course.save()
    res.redirect('/courses')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router