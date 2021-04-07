const express = require('express')
const ExpHandlebars = require('express-handlebars')
const Handlebars = require('handlebars')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
const C = require('./constants/constants')
const homeRoute = require('./routes/home')
const addRoute = require('./routes/add')
const coursesRoute = require('./routes/courses')
const basketRoute = require('./routes/basket')
const ordersRoute = require('./routes/orders')
const myCoursesRoute = require('./routes/myCourses')
const authRoute = require('./routes/auth')
const varMiddleware = require('./middlewares/variables')
const wrapUser = require('./middlewares/wrapUser')

const password = '4BJiJRk1cchgWBh2'
const url = `mongodb+srv://pavel:${password}@cluster0.whey9.mongodb.net/shop-myself`

const store = new MongoDBStore({
  uri: url,
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

app.use(express.static('public'))
app.use(
    express.urlencoded({
        extended: true
    })
)


app.use(session({
  secret: `i've been banned from haven`,
  resave: false,
  saveUninitialized: false,
  store
}))

app.use(varMiddleware)
app.use(wrapUser)

app.use('/', homeRoute)
app.use('/auth', authRoute)
app.use('/add', addRoute)
app.use('/courses', coursesRoute)
app.use('/basket', basketRoute)
app.use('/orders', ordersRoute)
app.use('/my-courses', myCoursesRoute)

void async function() {
  try {
    await mongoose.connect(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false
    })

    process.env.NODE_ENV !== 'test' && app.listen(C.PORT, () => {
      console.log('Server is running on port ' + C.PORT)
    })
  } catch (error) {
    console.error(error)
  }
}()

module.exports = app
