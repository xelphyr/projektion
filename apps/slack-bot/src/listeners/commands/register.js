import { addProject } from "@projektion/db/queries";

const registerCallback = async ({ ack, respond, body, payload, logger }) => {
  try {
    await ack();
    //logger.info(payload)
    //logger.info(body)
    if (payload.text == '') {
      await respond("Didn't enter a channel name! `/pjk-register <project-name>`");
    }
    else {
      await addProject(payload.channel_id, payload.text)
      await respond(`Registered channel! ${payload.text}`);
    }
  } catch (error) {
    logger.error(error);
  }
};

export { registerCallback };
