import Joi from "joi";

export const createPlanSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
});

export const updatePlanSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
});

export const planIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
