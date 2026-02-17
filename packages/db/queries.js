import pool from '@projektion/db'

export async function addProject(channelId, projectName) {
    return await pool.query(
        `INSERT INTO  
            project (id, name)
        VALUES (
            $1,
            $2
        )`,
        [channelId, projectName]
    );
}

export async function getResourcesOfTier(tier){
    return await pool.query(
        `SELECT 
            *
        FROM resources
        WHERE tier = $1
        ORDER BY rarity DESC`,
        [tier]
    );
}
