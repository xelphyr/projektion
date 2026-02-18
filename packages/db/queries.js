import pool from '@projektion/db'

export async function checkProjectExists(channelId) {
    const project_exists = await pool.query(
        `SELECT
            name
        FROM
            projects
        WHERE
            channel_id = $1`,
        [channelId]
    );
    console.log(project_exists.rows)
    return (project_exists.rowCount > 0) ? project_exists.rows[0].name : null
}

export async function addProject(channelId, projectName, description) {
    return await pool.query(
        `INSERT INTO  
            projects (channel_id, name, description)
        VALUES (
            $1,
            $2,
            $3
        )`,
        [channelId, projectName, description]
    );
}

export async function addProjectTags(channelId, tags) {
    return await pool.query(
        `INSERT INTO  
            project_tags (project_id, tag_id)
        SELECT 
            p.id,
            t.id
        FROM projects p
        JOIN tags t ON t.name = ANY($2::text[])
        WHERE p.channel_id = $1
        ON CONFLICT DO NOTHING;`,
        [channelId, tags]
    );
}

export async function getTagsList(){
    return (await pool.query(
        `SELECT 
            name
        FROM tags`,
    )).rows.map(e => e.name);
}
