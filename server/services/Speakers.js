const url = require("url");
const crypto = require("crypto");
const { default: axios } = require("axios");
const CircuitBreaker = require("../lib/CircuitBreaker");
class SpeakersService {
  constructor({ seviceRegistryUrl, serviceVersion, log }) {
    this.seviceRegistryUrl = seviceRegistryUrl;
    this.serviceVersion = serviceVersion;
    this.circuitBreaker = new CircuitBreaker(log);
    this.cache = {};
    this.log = log();
  }

  async getImage(path) {
    const { ip, port } = await this.getService("speakers-service");
    return this.callService({
      method: "get",
      responseType: "stream",
      url: `http://${ip}:${port}/images/${path}`,
    });
  }

  async getNames() {
    const { ip, port } = await this.getService("speakers-service");
    return this.callService({
      method: "get",
      url: `http://${ip}:${port}/names`,
    });
  }

  async getListShort() {
    const { ip, port } = await this.getService("speakers-service");
    return this.callService({
      method: "get",
      url: `http://${ip}:${port}/list-short`,
    });
  }

  async getList() {
    const { ip, port } = await this.getService("speakers-service");
    return this.callService({
      method: "get",
      url: `http://${ip}:${port}/list`,
    });
  }

  async getAllArtwork() {
    const { ip, port } = await this.getService("speakers-service");
    return this.callService({
      method: "get",
      url: `http://${ip}:${port}/artwork`,
    });
  }

  async getSpeaker(shortname) {
    const { ip, port } = await this.getService("speakers-service");
    return this.callService({
      method: "get",
      url: `http://${ip}:${port}/speaker/${shortname}`,
    });
  }

  async getArtworkForSpeaker(shortname) {
    const { ip, port } = await this.getService("speakers-service");
    return this.callService({
      method: "get",
      url: `http://${ip}:${port}/artwork/${shortname}`,
    });
  }

  async callService(requestOptions) {
    const servicePath = url.parse(requestOptions.url).path;
    let cacheKey = requestOptions.method + servicePath;
    cacheKey = crypto.createHash("md5").update(cacheKey).digest("hex");

    let result = await this.circuitBreaker.callService(requestOptions);

    //update cache
    if (result) {
      this.log.info("Caching...");
      this.cache[cacheKey] = result;
    } else {
      this.log.info("Loading from Cache");
      result = this.cache[cacheKey]; // fetch from cache if no result
    }

    return result; // could be from server/cache or even empty
  }

  async getService(servicename) {
    const { data } = await axios.get(
      `${this.seviceRegistryUrl}/find/${servicename}/${this.serviceVersion}`
    );
    return data;
  }
}

module.exports = SpeakersService;
