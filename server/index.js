const express = require("express");
const createError = require("http-errors");
const path = require("path");
const bodyParser = require("body-parser");
const configs = require("./config");
const Speakers = require("./services/Speakers");
const Feedback = require("./services/Feedback");
const routes = require("./routes");

const app = express();

const config = configs[app.get("env")];

const speakers = new Speakers(config);
const feedback = new Feedback(config.data.feedback);

app.set("view engine", "pug");
const log = config.log();

if (app.get("env") === "development") {
  app.locals.pretty = true;

  // app.use((req, res, next) => {
  //   log.debug(`${req.method}:${req.url}`);
  //   return next();
  // });
}
app.set("views", path.join(__dirname, "./views"));
app.locals.title = config.sitename;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/favicon.ico", (req, res) => res.sendStatus(204));

app.use(express.static(path.join(__dirname, "../public")));

app.get("/images/:type/:file", async (req, res) => {
  const imageStream = await speakers.getImage(`${req.params.type}/${req.params.file}`);
  return imageStream.pipe(res);
});

app.use(async (req, res, next) => {
  try {
    const names = await speakers.getNames();
    res.locals.speakerNames = names;
    return next();
  } catch (err) {
    return next(err);
  }
});

app.use(
  "/",
  routes({
    speakers,
    feedback,
  })
);

app.use((req, res, next) => next(createError(404, "File not found")));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  const status = err.status || 500;
  res.locals.status = status;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(status);
  return res.render("error");
});

app.listen(3000, () => log.info("port 3000 listening"));

module.export = app;
