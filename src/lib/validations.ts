import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  terms: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must accept the terms and conditions',
    'any.required': 'You must accept the terms and conditions',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

export const workshopSchema = Joi.object({
  name: Joi.string().max(50).required().messages({
    'string.empty': 'Workshop name is required',
    'string.max': 'Workshop name cannot exceed 50 characters',
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  isPrivate: Joi.boolean().optional(),
  tags: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      color: Joi.string().required(),
      _id: Joi.any().optional(),
    })
  ).optional(),
});

export const taskSchema = Joi.object({
  title: Joi.string().required().messages({
    'string.empty': 'Task title is required',
  }),
  description: Joi.string().allow('').optional(),
  userStory: Joi.string().required().messages({
    'string.empty': 'User Story is required',
  }),
  status: Joi.string().valid('NEW', 'IN_PROGRESS', 'READY_FOR_TEST', 'CLOSED').optional(),
  assignees: Joi.array().items(Joi.string()).optional(),
});

export const inviteSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email',
  }),
  role: Joi.string().valid('admin', 'member').default('member'),
});
