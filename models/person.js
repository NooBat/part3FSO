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
  name: String,
  number: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)