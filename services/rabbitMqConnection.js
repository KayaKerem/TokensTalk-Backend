const amqp = require("amqplib");

const url = "amqp://localhost";

module.exports = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL, {
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
  });
  if (connection) {
    console.log("Publisher connection is established");
  }
  return connection;
};
