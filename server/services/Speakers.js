const { default: axios } = require("axios");
class SpeakersService {
  constructor({ data }) {
    const { seviceRegistryUrl, serviceVersion } = data;
    this.seviceRegistryUrl = seviceRegistryUrl;
    this.serviceVersion = serviceVersion;
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
    const { data } = await axios(requestOptions);
    return data;
  }

  async getService(servicename) {
    const { data } = await axios.get(
      `${this.seviceRegistryUrl}/find/${servicename}/${this.serviceVersion}`
    );
    return data;
  }
}

module.exports = SpeakersService;
