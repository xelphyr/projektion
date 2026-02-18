import { projectRegisterViewCallback } from './project-register-view.js';

export const register = (app) => {
  app.view('project_register_view', projectRegisterViewCallback)
};
