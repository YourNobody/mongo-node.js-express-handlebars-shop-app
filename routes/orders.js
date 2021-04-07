const {Router} = require('express')
const Order = require('../models/Order')
const auth = require('../middlewares/auth')
const router = new Router()

router.get('/', auth, async (req, res) => {
  const orders = await Order.find()
    .populate('user.userId', 'name email')

  const flatOrders = orders.map((order) => {
    return {
      id: order._id,
      date: order.date,
      user: {
        ...order.user.userId._doc,
        fully: `${order.user.name} <${order.user.userId._doc.email}>`
      },
      courses: order.courses.map((course) => {
        return {
          count: course.count,
          ...course.course
        }
      }),
      price: order.courses.reduce((total, course) => {
        return total += course.course.price * course.count
      }, 0)
    }
  })

  res.render('orders', {
    isOrders: true,
    orders: flatOrders
  })
})



router.post('/', auth, async (req, res) => {
  const user = await req.user
    .populate('cart.items.courseId')
    .execPopulate()

  const courses = user.cart.items.map((c) => {
    return {
      count: c.count,
      course: {...c.courseId._doc}
    }
  }) 

  const order = new Order({
    user: {
      name: req.user.name,
      userId: req.user._id
    },
    courses
  })

  const courseIds = courses.map((crs) => {
    return crs.course._id
  })

  req.user.addToMyCourses(courseIds)
  await order.save()
  await req.user.cleanCart()

  res.redirect('/orders')
})


module.exports = router