const { Router } = require('express')
const Course = require('../models/Course')
const auth = require('../middlewares/auth')
const router = new Router()

router.get('/', auth, (req, res) => {
    res.render('add', {
        isAdd: true
    })
    process.env.NODE_ENV === 'test' && res.send()
})

router.post('/', auth, async (req, res) => {
    const { title, img, price } = req.body
    const course = new Course({
        title, price, img,
        userId: req.user._id
    })

    const b = await course.save()

    process.env.NODE_ENV !== 'test' && res.redirect('/courses')
    process.env.NODE_ENV === 'test' && res.send(b)
})

module.exports = router