const amqp = require("amqplib");
const nftScanner = require("./nftScanner");
// const Game = require("../models/game");
const User = require("../models/user");
const queueName = process.env.QUEUE_NAME;

async function createChannelAndConsume() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL, {
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: true,
    });

    console.log(" [*] Datas are listening from : " + queueName);

    channel.consume(
      queueName,
      async (msg) => {
        console.log(" [x] Alındı: %s", msg.content.toString());

        let data = JSON.parse(msg.content.toString());
        try {
          console.log(data);
          const result = await nftScanner.processCollections(
            data.wallet_address
          );
          console.log("DATA LİSTENED : ", result);
          //   const nft = JSON.stringify(result);
          const user = await User.findOne({
            wallet_address: data.wallet_address,
          });
          result.forEach((item) => {
            user.nfts.push({
              collection: item.label,
              name: item.r.meta.name,
              description: item.r.meta.description,
              image_url: item.r.rawImageUrl,
              contract_address: item.contract_address,
            });
            user.chatrooms.push({
              contract_address: item.contract_address,
            });
          });
          await user.save();
          //   const game = await Game.findById(data.game_id);
          //   if (game) {
          //     //tarih kontrolü
          //     if (new Date() > game.close_date) {
          //       throw new Error(
          //         "We are unable to save this score because the event has expired."
          //       );
          //     }
          //     const user = await game.findUserById(data.user_id);
          //     if (user) {
          //       let current_points = user.points;
          //       user.points = current_points + data.points;
          //     } else {
          //       logger.error(data.user_id.toString() + " User couldn't found");
          //     }
          //   } else {
          //     logger.error(data.game_id.toString() + " Game couldn't found");
          //   }
          //   await game.getSortedUsersByScore();
          //   await game.save();
          //   logger.info("DATABASE HAS BEEN SAVED SUCCESSFULLY!");
        } catch (err) {
          console.log(err);
        }
      },
      {
        noAck: true,
      }
    );
  } catch (error) {
    console.log("RabbitMQ bağlantısı veya kanalı oluşturulurken hata:", error);
  }
}

createChannelAndConsume();
