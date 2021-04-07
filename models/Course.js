const {Schema, model} = require('mongoose')

const courseSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  img: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: [
    {
      rate: Number,
      userId: Schema.Types.ObjectId
    }
  ]
})

module.exports = model('Course', courseSchema)