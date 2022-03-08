const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to:', url)

mongoose.connect(url)
  .then(response => {
    console.log('connection established with MongoDB')
  })
  .catch(error => {
    console.log('connection error: ', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: (number) => {
        return /\d{2,3}-\d{4,}/.test(number)
      },
      message: props => `${props.value} is not a valid phone number`
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)