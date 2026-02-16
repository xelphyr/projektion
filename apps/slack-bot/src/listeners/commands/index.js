import { sampleCommandCallback } from './sample-command.js';
import { registerCallback } from './register.js';

export const register = (app) => {
  app.command('/pjk-register', registerCallback);
};
