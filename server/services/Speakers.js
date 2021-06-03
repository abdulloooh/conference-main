const url = require("url");
const crypto = require("crypto");
const { default: axios } = require("axios");

const fs = require("fs");
const { promisify } = require("util");
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

const CircuitBreaker = require("../lib/CircuitBreaker");
class SpeakersService {
  constructor({ seviceRegistryUrl, serviceVersion, log, data }) {
    this.seviceRegistryUrl = seviceRegistryUrl;
    this.serviceVersion = serviceVersion;
    this.circuitBreaker = new CircuitBreaker(log);
    this.cache = {};
    this.log = log();
    this.imagecache = data.imagecache;
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
    const cacheKey = crypto
      .createHash("md5")
      .update(requestOptions.method + servicePath)
      .digest("hex");

    if (!(await exists(this.imagecache))) await mkdir(this.imagecache);

    let cacheFile = null;
    if (requestOptions.responseType && requestOptions.responseType === "stream")
      cacheFile = `${this.imagecache}/${cacheKey}`;

    let result = await this.circuitBreaker.callService(requestOptions);

    //update cache
    if (result) {
      if (cacheFile) {
        const ws = fs.createWriteStream(cacheFile);
        result.pipe(ws);
      } else this.cache[cacheKey] = result;
    } else {
      this.log.info("Loading from Cache");
      if (cacheFile) return fs.createReadStream(cacheFile);
      else result = this.cache[cacheKey]; // fetch from cache if no result
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
