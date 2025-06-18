import Joi from "joi";

export const createSystemAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
});

export const updateSystemAdminSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const adminIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
