import Joi from "joi";

export const createTenantSchema = Joi.object({
  email: Joi.string().email().required(),
  // Add other fields as needed
});

export const updateTenantSchema = Joi.object({
  email: Joi.string().email().optional(),
  // Add other fields as needed
});

export const tenantIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
