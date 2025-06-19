import Joi from "joi";

export const createWorkspacePermissionSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
});

export const updateWorkspacePermissionSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
});

export const workspacePermissionIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});
