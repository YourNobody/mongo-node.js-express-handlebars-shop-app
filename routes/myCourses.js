const {Router} = require('express')
const auth = require('../middlewares/auth')
const router = new Router()

router.get('/', auth, async (req, res) => {
  const courses = await req.user
    .populate({
      path: 'myCourses.courseId',
      select: '_id title userId'
    })
    .execPopulate()
    .then((user) => {
      return user.myCourses
        .map((course) => {
          const temp = {  
            ...course.courseId._doc,
            id: course.courseId._doc._id
          }
          delete temp._id
          return temp
        })
    })

  res.render('myCourses', {
    title: 'Мои курсы',
    isMyCourses: true,
    courses,
  })
})

router.post('/:id', auth, () => {

})

module.exports = router
