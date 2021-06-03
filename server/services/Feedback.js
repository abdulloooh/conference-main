const { default: axios } = require("axios");

class FeedbackService {
  constructor({ serviceRegistryUrl, serviceVersion, log }) {
    this.serviceRegistryUrl = serviceRegistryUrl;
    this.serviceVersion = serviceVersion;
    this.log = log();
    this.defaultServiceName = "feedback-service";
  }

  async addEntry(name, title, message) {
    const { ip, port } = await this.getService();
    return await this.callService({
      method: "GET",
      url: `${ip}:${port}/list`,
      data: { name, title, message },
    });
  }

  async getList() {
    const { ip, port } = await this.getService();
    return await this.callService({
      method: "GET",
      url: `http://${ip}:${port}/list`,
    });
  }

  async callService(requestOptions) {
    const { data } = await axios(requestOptions);
    return data;
  }

  async getService(_servicename) {
    try {
      const servicename = _servicename || this.defaultServiceName;
      const { data } = await axios.get(
        `${this.serviceRegistryUrl}/find/${servicename}/${this.serviceVersion}`
      );
      return data;
    } catch (err) {
      this.log.error(err);
      return false;
    }
  }
}

module.exports = FeedbackService;
