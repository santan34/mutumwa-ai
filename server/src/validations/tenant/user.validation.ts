import Joi from "joi";

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
});

export const userIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});