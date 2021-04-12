const {Schema, model} = require('mongoose')

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    requied: true
  },
  cart: {
    items: [
      {
        count: {
          type: Number,
          required: true,
          default: 1
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
          required: true
        }
      }
    ]
  },
  resetToken: String,
  resetTokenExp: Date,
  password: {
    type: String,
    required: true
  },
  myCourses: [
    {
      courseId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Course'
      }
    }
  ]
})

userSchema.virtual('author').get(function() {
  return `${this.name} <${this.email}>`
})

userSchema.methods.addToCart = function(course) {
  const items = [...this.cart.items]
  const idx = items.findIndex((c) => {
    return c.courseId.toString() === course._id.toString()
  })

  if (idx >= 0) {
    items[idx].count += 1
  }
  else {
    items.push({
      courseId: course._id,
      count: 1
    })
  }

  this.cart.items = items
  return this.save()
}

userSchema.methods.deleteFromCart = function(id) {
  let items = this.cart.items.concat()
  const idx = items.findIndex((c) => {
    return c.courseId.toString() === id.toString()  
  })
  const candidate = items[idx]
  
  if (candidate.count === 1) {
    items = items.filter((c, index) => index !== idx)
  } else {
    candidate.count--
  }
  
  this.cart.items = items
  return this.save()
}

userSchema.methods.cleanCart = function() {
  this.cart.items = []
  return this.save() 
}

userSchema.methods.addToMyCourses = function(array) {
  let courses = [...this.myCourses]
  let uniqArray = array.reduce((acc, id) => {
    let fl = false
    courses.forEach((crs) => {
      if (crs.courseId === id) {
        fl = true
      }
    })

    if (!fl) acc.push({
      courseId: id
    })
    return acc
  }, [])

  courses = courses.concat(uniqArray)
  this.myCourses = courses
  return this.save()
}

module.exports = model('User', userSchema)