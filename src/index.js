const fastify = require("fastify");
const fastifyCors = require("fastify-cors");
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.PGSTRING
});

const server = fastify();
server.register(fastifyCors);

server.post("/", async (request, reply) => {
  const sql = "INSERT INTO todoapp (text) VALUES ($1)";
  const values = [request.body.text];
  await client.query(sql, values);
  reply.send("great!");
});

server.get("/", async (request, reply) => {
  const sql = "SELECT * FROM todoapp";
  const result = await client.query(sql);
  reply.send(result.rows);
});

server.delete("/:id", async (request, reply) => {
  const sql = "DELETE FROM todoapp WHERE id = $1";
  const values = [request.params.id];
  const result = await client.query(sql, values);
  reply.send(result);
});

const boot = async () => {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS todoapp (
      id serial PRIMARY KEY,
      text TEXT UNIQUE NOT NULL
    );
   `);

  await server.listen(8080);
};
const onBootComplete = () => console.info("App started correctly");
const onBootFailed = err => console.error(`Boot Error: ${err.message}`);

boot()
  .then(onBootComplete)
  .catch(onBootFailed);
