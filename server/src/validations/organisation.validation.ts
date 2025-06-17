import Joi from "joi";

export const createOrganisationSchema = Joi.object({
  name: Joi.string().required(),
  domain: Joi.string().required(),
  sector: Joi.string().optional(),
});

export const updateOrganisationSchema = Joi.object({
  name: Joi.string().optional(),
  domain: Joi.string().domain().optional(),
  sector: Joi.string().optional(),
});

export const orgIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
