import pool from '#db/index.js'
import Decimal from "break_eternity.js";

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

export async function addUserResources(user_id, resource_ids, resource_amts) {

    if (resource_ids.length !== resource_amts.length) {
        throw new Error("resource_ids and resource_amts must have same length");
    }

    await pool.query(
        `INSERT INTO resource_inventory (user_id, resource_id, count)
        SELECT
            $1 AS user_id,
            rid,
            cnt
        FROM UNNEST($2::int[], $3::int[]) AS t(rid,cnt)
        ON CONFLICT (user_id, resource_id)
        DO UPDATE SET count = resource_inventory.count + EXCLUDED.count;`,
        [user_id, resource_ids, resource_amts]
    )
}

export async function tryInitUser(user_id, username) {
    await pool.query(
        `INSERT INTO users (id, username) 
        VALUES ($1, $2)
        ON CONFLICT (id)
        DO UPDATE SET username = EXCLUDED.username;`,
        [user_id, username]
    )
}

export async function destroyResources(user_id, params) {
    const client = pool.connect();
    try {
        await client.query("BEGIN");

        const {rows} = await client.query(
            `WITH req as (SELECT *
                          FROM jsonb_to_recordset($3::jsonb)
                                   AS r(resource_id text, type text, value numeric)),

                  cur AS (SELECT ri.user_id, ri.resource_id, ri.count AS old_count, r.type, r.value
                          FROM resource_inventory ri
                                   JOIN req r
                                        ON r.resource_id = ri.resource_id
                          WHERE ri.user_id = $1
                 FOR UPDATE ),
        
        calc AS (
            SELECT 
                user_id,
                resource_id,
                old_count,
                CASE 
                    WHEN type = 'percent' THEN floor(old_count * (value/100.0))::bigint
                    WHEN type = 'absolute' THEN value::bigint
                    ELSE 0::bigint
                END AS requested_sell
            FROM cur
        ), 
        
        upd as (
            UPDATE resource_inventory ri
            SET count = ri.count - LEAST(c.requested_sell, ri.count)
            FROM calc c 
            WHERE r1.user_id = c.user_id
                AND ri.resource_id = c.resource_id
            RETURNING ri.user_id, ri.resource_id, ri.count AS new_count
        )

            SELECT c.resource_id,
                   c.old_count,
                   c.requested_sell,
                   LEAST(c.requested_sell, c.old_count) AS actual_sold,
                   u.new_count
            FROM calc c
                     JOIN upd u
                          ON u.user_id = c.user_id
                              AND u.resource_id = c.resource_id;`,
            [user_id, null, JSON.stringify(params)]
        )

        await client.query("COMMIT");
        return rows;
    } catch (e) {
        throw e;
    } finally {
        client.release();
    }
}

export async function getUserPoints(user_id) {
    let {rows} = await pool.query(
        `SELECT points_mantissa, points_exponent
        FROM users
        WHERE id = $1`,
        [user_id]
    )

    if (rows.length === 0) return null;

    const { points_mantissa: m, points_exponent: e } = rows[0];

    const mStr = String(m);
    const eStr = String(e);
    return new Decimal(`${mStr}e${eStr}`);
}

export async function bulkResourceValueRequest(data) {
    return await pool.query(
        `SELECT 
            r.resource_id,
            res.resource_value
        FROM jsonb_to_recordset($1::jsonb)
        AS r(resource_id integer)
        JOIN resources res
        ON res.id 
        `,
        [data]
    )
}

export async function addUserPoints(user_id, delta){
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const {rows} = await client.query(
            `SELECT points_mantissa, points_exponent
            FROM users
            WHERE id = $1
            FOR UPDATE`,
            [user_id]
        );

        if (rows.length === 0) throw new Error("User not found")

        const current = new Decimal(
            `${rows[0].points_mantissa}e${rows[0].points_exponent}`
        );

        const updated = current.add(delta);

        await client.query(
            `UPDATE users
            SET points_mantissa = $2,
                points_exponent = $3
            WHERE id = $1`,
            [user_id, updated.mantissa, updated.exponent]
        );

        await client.query("COMMIT");

    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        await client.release();
    }
}