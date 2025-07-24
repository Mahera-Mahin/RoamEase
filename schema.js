const Joi = require('joi');

// Listing Schema Validation
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().messages({
      'string.empty': 'Title is required',
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Description is required',
    }),
    image: Joi.object({
      url: Joi.string().allow('', null),
      filename: Joi.string().allow('', null)
    }).optional(),
    price: Joi.number().min(0).required().messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price must be at least 0'
    }),
    location: Joi.string().required().messages({
      'string.empty': 'Location is required'
    }),
    country: Joi.string().required().messages({
      'string.empty': 'Country is required'
    })
  }).required()
});

// Review Schema Validation
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating must be at most 5'
    }),
    comment: Joi.string().required().messages({
      'string.empty': 'Comment is required'
    })
  }).required()
});
