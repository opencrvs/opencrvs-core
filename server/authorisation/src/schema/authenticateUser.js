
const Joi = require('joi');

const authenticateUserSchema = Joi.alternatives().try(
    Joi.object({
        username: Joi.string().alphanum().min(2).max(30).required(),
        password: Joi.string().min(8).required()
    }),
    Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required()
    })
);

module.exports = authenticateUserSchema;

