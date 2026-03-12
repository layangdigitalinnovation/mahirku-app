require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false,
    }
);

async function main() {
    try {
        const [results] = await sequelize.query(`SELECT id, status, "aiResult", "createdAt" FROM graphology_tests ORDER BY "createdAt" DESC LIMIT 3;`);
        console.log("Recent Graphology Tests:", JSON.stringify(results, null, 2));
    } catch (e) {
        console.error("Error querying DB:", e.message);
    } finally {
        await sequelize.close();
    }
}

main();
