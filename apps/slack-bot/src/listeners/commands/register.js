import { addProject } from "@projektion/db/queries";
import { getTagsList } from "@projektion/db/queries";

const registerCallback = async ({ ack, payload, client, logger }) => {
  try {
    await ack();
    let tags_list = await getTagsList()

    await client.views.open({
      "view" : {
        "type": "modal",
        "callback_id": "project_register_view",
        "private_metadata": payload.channel_id,
        "title": {
          "type": "plain_text",
          "text": "Register your project",
          "emoji": true
        },
        "submit": {
          "type": "plain_text",
          "text": "Submit",
          "emoji": true
        },
        "close": {
          "type": "plain_text",
          "text": "Cancel",
          "emoji": true
        },
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "Hey there! I'm *Jekt*, and I like seeing what you humans do with your time. Cool project you got there."
            }
          },
          {
            "type": "input",
            "block_id": "project-name-block",
            "element": {
              "type": "plain_text_input",
              "action_id": "project-name"
            },
            "label": {
              "type": "plain_text",
              "text": "What's its name?",
              "emoji": true
            },
            "optional": false
          },
          {
            "type": "input",
            "block_id": "project-description-block",
            "element": {
              "type": "plain_text_input",
              "multiline": true,
              "action_id": "project-description"
            },
            "label": {
              "type": "plain_text",
              "text": "Perhaps a short description?",
              "emoji": true
            },
            "optional": false
          },
          {
            "type": "input",
            "block_id": "project-tags-block",
            "element": {
              "type": "multi_static_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Select options",
                "emoji": true
              },
              "options": 
                tags_list.map(e => ({
                  "text": {
                    "type": "plain_text",
                    "text": e,
                    "emoji": true
                  },
                  "value": e
                })),
              "action_id": "project-tags"
            },
            "label": {
              "type": "plain_text",
              "text": "Maybe a few tags your project would fall into?",
              "emoji": true
            },
            "optional": false
          }
        ]
      },
      "trigger_id": payload.trigger_id
    });
    
  } catch (error) {
    logger.error(error);
  }
};

export { registerCallback };
