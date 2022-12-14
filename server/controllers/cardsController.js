const mongoose = require('mongoose');
const Card = require('../models/cardModel');
const User = require('../models/userModel');

const cardsController = {};

// @desc     Load cards when user signs in
// @route:   GET /api/cards
cardsController.loadCards = async (req, res, next) => {
  try {
    const cards = await Card.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.locals.cards = cards;
    return next();
  } catch (error) {
    return res.status(404).json({ message: { err: error.message } });
  }
};


// @desc     Create new card
// @route:   POST /api/cards
cardsController.createCard = async (req, res, next) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return next({
        message: { err: 'Missing required input fields. ERROR in cardsController.createCard' }
      });
    }

    const newCard = await Card.create({ user: req.user._id, question, answer });
    res.locals.newCard = newCard;
    return next();
  } catch (error) {
    return res.status(404).json({ message: { err: error.message } });
  }
};

// @desc     Update card
// @route:   PATCH /api/cards/:id
cardsController.updateCard = async (req, res, next) => {
  try {
    const id = req.params.id;

    // check if /:id is a valid ObjectId in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next({
        message: { err: 'Invalid ID. No such card exists. ERROR in cardsController.updateCard' }
      });
    }

    const card = await Card.findById(id);

    if (!card) {
      return next({
        message: { err: 'No such card exists. ERROR in cardsController.updateCard' }
      });
    }

    if (!req.body.question || !req.body.answer) {
      return next({
        message: { err: 'Missing required input field. ERROR in cardsController.updateCard' }
      });
    }

    const updateData = {
      question: req.body.question,
      answer: req.body.answer,
      status: req.body.status,
      favorite: req.body.favorite
    };

    const user = await User.findById(req.user._id);

    if (!user) {
      return next({
        message: { err: 'User not found. ERROR in cardsController.updateCard' }
      });
    }

    // User can only update his/her own flashcards
    if (card.user.toString() !== user._id.toString()) {
      return next({
        message: { err: 'User not authorized to update. ERROR in cardsController.updateCard' }
      });
    }
 
    const updatedCard = await Card.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true }
    );

    res.locals.updatedCard = updatedCard;
    return next();
  } catch (error) {
    return res.status(404).json({ message: { err: error.message } });
  }
};


// @desc     Delete card
// @route:   DELETE /api/cards/:id
cardsController.deleteCard = async (req, res, next) => {
  try {
    const id = req.params.id;

    // check if /:id is a valid ObjectId in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next({
        message: { err: 'Invalid ID. No such card exists. ERROR in cardsController.deleteCard' }
      });
    }

    const card = await Card.findById(id);

    if (!card) {
      return next({
        message: { err: 'No such card exists. ERROR in cardsController.deleteCard' }
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return next({
        message: { err: 'User not found. ERROR in cardsController.deleteCard' }
      });
    }

    // User can only delete his/her own flashcards
    if (card.user.toString() !== user._id.toString()) {
      return next({
        message: { err: 'User not authorized to delete. ERROR in cardsController.deleteCard' }
      });
    }

    const deletedCard = await Card.findOneAndDelete({ _id: id });

    res.locals.deletedCard = deletedCard;
    return next();
  } catch (error) {
    return res.status(404).json({ message: { err: error.message } });
  }
};

module.exports = cardsController;