const Challenge = require('../models/challenge')

class ChallengeController {
  static create(req, res, next) {
    const { title, description, testCase, difficulty } = req.body
    Challenge
      .create({
        title,
        description,
        testCase,
        difficulty
      })
      .then(result => {
        res.status(201).json(result)
      })
      .catch(next)
  }
  static getAll(req, res, next) {
    Challenge
      .find()
      .then(result => {
        res.status(200).json(result)
      })
      .catch(next)
  }
  static getId(req, res, next) {
    Challenge
      .findById(req.params.id)
      .then(result => {
        res.status(200).json(result)
      })
      .catch(next)
  }
  static updateId(req, res, next) {
    const { title, description, testCase, difficulty } = req.body
    Challenge
      .findByIdAndUpdate(req.params.id, {
        title,
        description,
        testCase,
        difficulty
      }, {
        new: true,
        runValidators: true
      })
      .then(result => {
        res.status(200).json(result)
      })
      .catch(next)
  }
  static deleteId(req, res, next) {
    Challenge
      .findByIdAndDelete(req.params.id)
      .then(result => res.status(200).json(result))
      .catch(next)
  }
}

module.exports = ChallengeController
