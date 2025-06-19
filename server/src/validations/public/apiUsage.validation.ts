import Joi from "joi";

export const createApiUsageSchema = Joi.object({
  organisationId: Joi.string().uuid().required(),
  featureId: Joi.string().uuid().required(),
  periodStart: Joi.date().required(),
  usageCount: Joi.number().integer().min(0).required()
});

export const updateApiUsageSchema = Joi.object({
  usageCount: Joi.number().integer().min(0).optional()
});

export const apiUsageParamSchema = Joi.object({
  organisationId: Joi.string().uuid().required(),
  featureId: Joi.string().uuid().required(),
  periodStart: Joi.date().required()
});