const { Router } = require('express')

const router = new Router()

router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home page',
        isHome: true
    })
})

module.exports = router

