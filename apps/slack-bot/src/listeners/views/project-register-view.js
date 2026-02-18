import { addProject, addProjectTags } from "@projektion/db/queries";

const projectRegisterViewCallback = async ({ ack, view, body, client, logger }) => {
  try {
    await ack();

    const formValues = view.state.values;
    const name = formValues["project-name-block"]["project-name"].value;
    const tags = formValues["project-tags-block"]["project-tags"].selected_options.map(e => (e.value));
    logger.info(tags);
    const desc = formValues["project-description-block"]["project-description"].value;

    await addProject(view.private_metadata, name, desc);
    await addProjectTags(view.private_metadata, tags)

    await client.chat.postMessage({
      channel: view.private_metadata,
      text: `<@${body.user.id}> submitted the following : \n\n Name: ${name} \n Desc: ${desc} \n Tags: ${tags}`,
    });
  } catch (error) {
    logger.error(error);
  }
};

export { projectRegisterViewCallback };
