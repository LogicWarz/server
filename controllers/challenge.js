const Challenge = require('../models/challenge')

class ChallengeController {
  static create(req, res, next) {
    const { title, description, skeletonCode, testCase, difficulty } = req.body
    Challenge
      .create({
        title,
        description,
        skeletonCode,
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
  static getRandom(req, res, next) {
    Challenge
      .find({
        difficulty: new RegExp(`${req.query.difficulty}`, 'gi')
      })
      .then(result => {
        let index = Math.floor(Math.random() * result.length)
        res.status(200).json(result[index])
      })
      .catch(next)
  }
  static updateId(req, res, next) {
    const { title, description, skeletonCode, testCase, difficulty } = req.body
    Challenge
      .findByIdAndUpdate(req.params.id, {
        title,
        description,
        skeletonCode,
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
