const { Router } = require('express')
const Course = require('../models/Course')
const User = require('../models/User')
const auth = require('../middlewares/auth')
const router = new Router()

function mapCartItems(cart) {
  return cart.items.map((course) => {
    const temp = {
      id: course.courseId._id,
      count: course.count,
      ...course.courseId._doc
    }
    delete temp._id
    return temp
  })
}

function computeCartPrice(courses) {
  return courses.reduce((acc, course) => {
    return acc += course.price * course.count
  }, 0)
}

router.get('/', auth, async (req, res) => {
  const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate()
  
  const courses = mapCartItems(user.cart)

  res.render('basket', {
    title: 'Корзина',
    courses,
    fullPrice: computeCartPrice(courses),
    isBasket: true
  })
})

router.post('/add', auth, async (req, res) => {
  const course = await Course.findById(req.body.id)
  await req.user.addToCart(course)
  res.redirect('/courses')
})

router.delete('/remove/:id', auth, async (req, res) => {
  try {
    await req.user.deleteFromCart(req.params.id)
    const user = await req.user.populate('cart.items.courseId')
      .execPopulate()

    const courses = mapCartItems(user.cart)
    const cart = {
      courses, price: computeCartPrice(courses)
    }

    res.status(200).json(cart)
  } catch (error) {
    console.error(error)
  }
})



module.exports = router