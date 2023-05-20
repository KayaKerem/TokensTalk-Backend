const redis = require("redis");

const redisOptions = {
  host: "http://127.0.0.1",
  port: 32769,
  password: "redispw",
};

module.exports = {
  init: async() => {
    try {
      const redisClient = redis.createClient(redisOptions);
        console.log("Redis Connected", redisClient);
        // await client.connect();
      return redisClient;
    } catch (err) {
      console.log("Redis Connection Refused", err);
    }
  },
};
