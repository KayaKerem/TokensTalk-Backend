const amqp = require("amqplib");
const rabbitMqConnection = require("./rabbitMqConnection");

const queueName = process.env.QUEUE_NAME;

module.exports = async (data) => {
  try {
    const connection = rabbitMqConnection();
    const channel = (await connection).createChannel();
    (await channel).assertQueue(queueName, { durable: true });
    const result = (await channel).sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(data))
    );
    console.log("Sent to queue");
    return result;
    // if (result) {
    //   console.log("Added to queue!");
    //   return result;
    // }
  } catch (err) {
    console.log(err);
  }
};
