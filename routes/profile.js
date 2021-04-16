const {Router} = require('express')
const auth = require('../middlewares/auth')
const User = require('../models/User')
const multer = require('multer')
const fs = require('fs')
const {promisify} = require('util')
const {pipeline} = require('stream')
const pl = promisify(pipeline)

const router = new Router()

const allowedMimeTypes = [
  'image/png', 'image/jpg', 'image/jpeg'
]
const upload = multer({
  dest: 'images',
  fileFilter: function(req, file, cb) {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  }
})

router.post('/', auth, upload.single('avatar'), async (req, res) => {
  if (!req.query._csrf) {
    res.redirect('/profile')
  }

  const {file, body: {name}, user: currUser} = req

  try {
    const user = await User.findById(currUser._id)
    const toChange = {name}
    if (file) {
      toChange.avatarURL = file.path
    }

    Object.assign(user, toChange)
    await user.save()
    res.redirect('/profile')
  } catch (error) {
    console.error(error)
  }
})

router.get('/', auth, (req, res) => {
  res.render('profile', {
    title: 'Профиль',
    isProfile: true,
    user: req.user.toObject()
  })
})

module.exports = router