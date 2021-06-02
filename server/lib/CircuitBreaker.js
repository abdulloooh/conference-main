const axios = require("axios");
class CircuitBreaker {
  constructor() {
    this.states = {};
    //unit in s
    this.requestTimeout = 2;
    this.cooldownPeriod = 5;

    this.failureThreshold = 5; // 5 units

    // labels
    this.close = "CLOSED";
    this.open = "OPEND";
    this.halfOpen = "HALF-OPEN";
  }

  initState(endpoint) {
    this.states[endpoint] = {
      circuit: this.close,
      failures: 0,
      nextTry: 0,
    };
  }

  canRequest(endpoint) {
    const state = this.states[endpoint];

    if (!state) {
      this.initState(endpoint);
      return true;
    }

    if (state.circuit === this.close) return true;

    //cooldown period completed
    const now = Date.now() / 1000;
    if (now >= state.nextTry) {
      state.circuit = this.halfOpen;
      return true;
    }

    return false;
  }

  async callService(requestOptions) {
    const key = `${requestOptions.method}:${requestOptions.url}`;
    const canRequest = this.canRequest(key);

    if (!canRequest) return false;

    try {
      requestOptions.timeout = this.requestTimeout * 1000;
      const { data } = await axios(requestOptions);
      this.onSuccess(key);
      return data;
    } catch (error) {
      console.error(`Error!- ${error.message}`);
      this.onFailure(key);
      return false;
    }
  }

  onSuccess(endpoint) {
    this.initState(endpoint);
  }

  onFailure(endpoint) {
    const state = this.states[endpoint];

    if (state.circuit === this.halfOpen) {
      state.circuit = this.open;
      state.nextTry = Date.now() / 1000 + this.cooldownPeriod;
      console.error(`ALERT! Cricuit for ${endpoint} in 'OPEN' state`);
    } else {
      state.failures++;

      if (state.failures > this.failureThreshold) {
        state.circuit = this.open;
        state.nextTry = Date.now() / 1000 + this.cooldownPeriod;
        console.error(`ALERT! Cricuit for ${endpoint} in 'OPEN' state`);
      }
    }
  }
}

module.exports = CircuitBreaker;
