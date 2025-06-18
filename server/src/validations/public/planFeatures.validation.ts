import Joi from "joi";

export const createPlanFeatureSchema = Joi.object({
  planId: Joi.string().uuid().required(),
  featureId: Joi.string().uuid().required(),
  rateLimit: Joi.number().positive().optional(),
  period: Joi.string().valid('HOURLY', 'DAILY', 'MONTHLY', 'YEARLY').optional()
});

export const updatePlanFeatureSchema = Joi.object({
  rateLimit: Joi.number().positive().optional(),
  period: Joi.string().valid('HOURLY', 'DAILY', 'MONTHLY', 'YEARLY').optional()
});

export const planFeatureParamSchema = Joi.object({
  planId: Joi.string().uuid().required(),
  featureId: Joi.string().uuid().required()
});