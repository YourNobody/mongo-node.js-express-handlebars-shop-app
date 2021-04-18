const express = require('express')
const ExpHandlebars = require('express-handlebars')
const Handlebars = require('handlebars')
const mongoose = require('mongoose')
const path = require('path')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const helmet = require('helmet')
const compression = require('compression')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const homeRoute = require('./routes/home')
const addRoute = require('./routes/add')
const coursesRoute = require('./routes/courses')
const basketRoute = require('./routes/basket')
const ordersRoute = require('./routes/orders')
const myCoursesRoute = require('./routes/myCourses')
const profileRoute = require('./routes/profile')
const settingsRoute = require('./routes/settings')
const authRoute = require('./routes/auth')
const varMiddleware = require('./middlewares/variables')
const page404Handler = require('./middlewares/page404')
const wrapUser = require('./middlewares/wrapUser')
const keys = require('./keys/index')


const store = new MongoDBStore({
  uri: keys.MONGODB_URI,
  collection: 'sessions'
})

const app = express()

app.engine('hbs', ExpHandlebars({
  handlebars: allowInsecurePrototypeAccess(Handlebars),
  defaultLayout: 'main',
  extname: 'hbs'
}))
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(session({
  secret: keys.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store
}))

app.use( helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "https:"],
      "script-src-elem": ["'self'", "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js", "'unsafe-inline'" ] 
    },
  },
  })
)

app.use(compression())
app.use(csrf())
app.use(flash())

app.use(varMiddleware)
app.use(wrapUser)

app.use('/', homeRoute)
app.use('/auth', authRoute)
app.use('/add', addRoute)
app.use('/courses', coursesRoute)
app.use('/profile', profileRoute)
app.use('/profile/basket', basketRoute)
app.use('/profile/orders', ordersRoute)
app.use('/profile/my-courses', myCoursesRoute)
app.use('/profile/settings', settingsRoute)

app.use(page404Handler)

void async function() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    })
    app.listen(keys.PORT, () => {
      console.log('Server is running on port ' + keys.PORT)
    })
  } catch (error) {
    console.error(error)
  }
}()

module.exports = app
