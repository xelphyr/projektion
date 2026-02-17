import { addProject } from "@projektion/db/queries";

const registerCallback = async ({ ack, respond, body, payload, logger }) => {
  try {
    await ack();
    logger.info(payload)
    logger.info(body)
    //await addProject()
    await respond('Register INDEV');
  } catch (error) {
    logger.error(error);
  }
};

export { registerCallback };
