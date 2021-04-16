const { Router } = require('express')
const Course = require('../models/Course')
const router = new Router()

function isOwner(course, currUser) {
  return course.userId.toString() === currUser._id.toString()
}

router.get('/', async (req, res) => {
    const courses = await Course.find()
      .populate('userId', 'email name _id')
      .then((crses) => {
        if (req.session.isAuthenticated) {
          return crses.map((crs) => {
            const {email, name, _id} = crs.userId._doc
            const {_id: id} = crs._doc
            delete crs._doc._id
            delete crs._doc.userId
            return {
              isAuthor: req.user._id.toString() === _id.toString(),
              ...crs._doc,
              id,
              author: name + ' ' + `<${email}>`
            }
          })
        } else {
          return crses.map((crs) => {
            const {email, name} = crs.userId._doc
            delete crs._doc.userId
            return {
              ...crs._doc,
              author: name + ' ' + `<${email}>`
            }
          })
        }
      })

    courses.forEach((course) => {
      course.rate = course.rating.reduce((acc, curr, index, array) => {
        if (index !== array.length - 1) return acc += curr.rate
        else {
          acc += curr.rate
          acc = acc / array.length
          return Math.trunc(acc)
        }
      }, 0)
      course.votes = course.rating.length
    })

    process.env.NODE_ENV !== 'test' && res.render('courses', {
        title: 'Все курсы', 
        courses,
        isCourses: true
    })
    process.env.NODE_ENV === 'test' && res.send(courses)
})

router.get('/:id', async (req, res) => {
    const course = await Course.findById(req.params.id)
    res.render('course', {
        layout: 'open',
        ...course
    })
})

router.post('/remove', async (req, res) => {
    await Course.deleteOne({
        _id: req.body.id,
        userId: req.user._id 
    })
    res.redirect('/courses')
})

router.post('/rating/:id/', async (req, res) => {
  const rating = req.query.rating
  const { id } = req.params
  const course = await Course.findOne({
      '_id': id
  })

  let idx

  //если оценка текущего пользователя существует то возвращаем true
  const existing = course.rating.reduce((acc, obj, index) => {
    if (!!acc) return acc
    if (obj.userId.toString() === req.user._id.toString()) {
      acc = true
      idx = index
    }
    return acc
  }, false)
  
  if (!existing) {
    course.rating.push({
      rate: rating,
      userId: req.user._id
    })
  } else {
    course.rating[idx].rate = rating
  }

  await Course.findByIdAndUpdate(id, course)

  res.status(201)
})

router.get('/:id/edit', async (req, res) => {
    if (!req.query.allow) {
      res.redirect('/')
    }
    let course = await Course.findById(req.params.id)

    if (!isOwner(course, req.user)) {
      return res.redirect('/courses')
    }

    const rating = JSON.stringify(course.rating)
    res.render('edit', {
      title: 'Редактирование информации о курсе',
      course,
      rating
    })
})

router.post('/edit', async (req, res) => {
    const { id } = req.body
    const course = await User.findOne({_id: id})

    if (!isOwner(course, req.user)) {
      return res.redirect('/courses')
    }

    req.body.rating = JSON.parse(req.body.rating)
    delete req.body.id
    await Course.findByIdAndUpdate(id, req.body)
    res.redirect('/courses')
})

module.exports = router