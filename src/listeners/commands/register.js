const registerCallback = async ({ ack, respond, logger }) => {
  try {
    await ack();
    await respond('Register INDEV');
  } catch (error) {
    logger.error(error);
  }
};

export { registerCallback };
