import Joi from "joi";

export const createOrganisationalPermissionSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
});

export const updateOrganisationalPermissionSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
});

export const organisationalPermissionIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
