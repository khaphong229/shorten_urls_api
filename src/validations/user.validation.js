const Joi = require('joi');

const signUpValidator = Joi.object({
    username: Joi.string().required().min(6).max(255).messages({
        'string.empty': 'username không được để trống',
        'any.required': 'username là bắt buộc!',
        'string.min': 'username phải có ít nhất {#limit} ký tự',
        'string.max': 'username phải có ít hơn {#limit+1} ký tự',
    }),
    email: Joi.string().required().email().messages({
        'string.empty': 'email không được để trống',
        'any.required': 'email là bắt buộc!',
        'string.email': 'email không đúng định dạng',
    }),
    password: Joi.string().required().min(6).max(255).messages({
        'string.empty': 'password không được để trống',
        'any.required': 'password là bắt buộc!',
        'string.min': 'password phải có ít nhất {#limit} ký tự',
        'string.max': 'password phải có ít hơn {#limit+1} ký tự',
    }),
    confirmPassword: Joi.string()
        .required()
        .min(6)
        .max(255)
        .valid(Joi.ref('password'))
        .messages({
            'string.empty': 'confirmPassword không được để trống',
            'any.required': 'confirmPassword là bắt buộc!',
            'string.min': 'confirmPassword phải có ít nhất {#limit} ký tự',
            'string.max': 'confirmPassword phải có ít hơn {#limit+1} ký tự',
            'any-only': 'confirmPassword không khớp với password',
        }),
});
const signInValidator = Joi.object({
    email: Joi.string().required().email().messages({
        'string.empty': 'email không được để trống',
        'any.required': 'email là bắt buộc!',
        'string.email': 'email không đúng định dạng',
    }),
    password: Joi.string().required().min(6).max(255).messages({
        'string.empty': 'password không được để trống',
        'any.required': 'password là bắt buộc!',
        'string.min': 'password phải có ít nhất {#limit} ký tự',
        'string.max': 'password phải có ít hơn {#limit+1} ký tự',
    }),
});

module.exports = { signUpValidator, signInValidator };
