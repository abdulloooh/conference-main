/* eslint-disable class-methods-use-this */
const url = require("url");
const axios = require("axios");
const crypto = require("crypto");
const amqplib = require("amqplib");

const CircuitBreaker = require("../lib/CircuitBreaker");

class FeedbackService {
  constructor({ serviceRegistryUrl, serviceVersion, log }) {
    this.serviceVersion = serviceVersion;
    this.serviceRegistryUrl = serviceRegistryUrl;
    this.cache = {};
    this.circuitBreaker = new CircuitBreaker(log);
  }

  async getList() {
    const { ip, port } = await this.getService("feedback-service");
    return this.callService({
      method: "get",
      url: `http://${ip}:${port}/list`,
    });
  }

  async addEntry(name, title, message) {
    const q = "feedback"; //feedback queue
    const conn = await amqplib.connect("amqp://localhost"); //create connection
    const ch = await conn.createChannel();
    await ch.assertQueue(q);
    const qM = JSON.stringify({ name, title, message }); // queue message, to strong so it can go2 buffer
    return ch.sendToQueue(q, Buffer.from(qM, "utf-8"));
  }

  async callService(requestOptions) {
    const parsedUrl = url.parse(requestOptions.url);
    const cacheKey = crypto
      .createHash("md5")
      .update(requestOptions.method + parsedUrl.path)
      .digest("hex");

    const result = await this.circuitBreaker.callService(requestOptions);

    if (!result) {
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }
      return null;
    }

    this.cache[cacheKey] = result;
    return result;
  }

  async getService(servicename) {
    const response = await axios.get(
      `${this.serviceRegistryUrl}/find/${servicename}/${this.serviceVersion}`
    );
    return response.data;
  }
}

module.exports = FeedbackService;
