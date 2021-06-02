const axios = require("axios");
class CircuitBreaker {
  constructor(log) {
    this.log = log();

    this.states = {};

    //unit in s
    this.requestTimeout = 5;
    this.cooldownPeriod = 15;

    this.failureThreshold = 3;

    // labels
    this.close = "CLOSED";
    this.open = "OPENED";
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

    if (state.circuit === this.close) {
      return true;
    }

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
      this.log.error(error.message);
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
      this.log.warn(`ALERT! Cricuit for ${endpoint} in 'OPEN' state`);
    } else {
      state.failures++;

      if (state.failures > this.failureThreshold) {
        state.circuit = this.open;
        state.nextTry = Date.now() / 1000 + this.cooldownPeriod;
        this.log.warn(`ALERT! Cricuit for ${endpoint} in 'OPEN' state`);
      }
    }
  }
}

module.exports = CircuitBreaker;

/**
 * Tracking for a pacrticular endpoint
 *   if (endpoint === "get:http://[::ffff:127.0.0.1]:35337/list")
        console.log({ state: "%%%%%%", endpoint });
 */
