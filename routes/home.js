const { Router } = require('express')

const router = new Router()

router.get('/', (req, res) => {
    try {
        res.render('home', {
            title: 'Home page',
            isHome: true
        })
    } catch (err) {
        console.log(err)
    }
})

module.exports = router

