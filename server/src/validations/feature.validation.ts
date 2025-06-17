import Joi from "joi";

export const createFeatureSchema = Joi.object({
  name: Joi.string().required(),
  endpointPath: Joi.string().required(),
  description: Joi.string().optional(),
});

export const updateFeatureSchema = Joi.object({
  name: Joi.string().optional(),
  endpointPath: Joi.string().optional(),
  description: Joi.string().optional(),
});

export const featureIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
