import Joi from "joi";

export const createOrganisationPlanSchema = Joi.object({
  organisationId: Joi.string().uuid().required(),
  planId: Joi.string().uuid().required(),
  startedAt: Joi.date().default(new Date()),
  expiresAt: Joi.date().required().greater(Joi.ref('startedAt')),
  isActive: Joi.boolean().default(true)
});

export const updateOrganisationPlanSchema = Joi.object({
  planId: Joi.string().uuid().optional(),
  expiresAt: Joi.date().optional(),
  isActive: Joi.boolean().optional()
});

export const organisationPlanIdParamSchema = Joi.object({
  id: Joi.string().uuid().required()
});