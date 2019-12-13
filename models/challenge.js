const { Schema, model } = require('mongoose')

const challengeSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  testCase: [{
    type: Object,
    required: [true, 'Answer Key is required']
  }],
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required']
  }
}, {
  versionKey: false,
  timestamps: true
})

const Challenge = model('Challenge', challengeSchema)

module.exports = Challenge
