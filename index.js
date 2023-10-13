const Koa = require("koa");
const Router = require("@koa/router");
const views = require("koa-views");
const path = require("path");
const static = require("koa-static");
const websockify = require("koa-websocket");

const { fetchEventsFromAmplitude } = require("./amplitudeService");

const PORT = 3001;

const app = websockify(new Koa());
const router = new Router();

app.use(static(path.join(__dirname, "/static")));
app.use(views(path.join(__dirname, "/views"), { extension: "ejs" }));
app.use(static(path.join(__dirname, "public")));

app.ws.use((ctx) => {
  console.log("WebSocket connection established");

  const pingInterval = setInterval(() => {
    try {
      ctx.websocket.ping();
    } catch (err) {
      clearInterval(pingInterval); // Clear the interval if sending ping fails (e.g., the connection is lost)
    }
  }, 10000);

  ctx.websocket.on("message", async (event) => {
    let parsedEvent;
    try {
      parsedEvent = JSON.parse(event);
    } catch (err) {
      console.error("Error parsing incoming WebSocket message:", err);
      return;
    }

    if (parsedEvent.type === "fetchData") {
      console.log("received fetchData event");
      const { start, end } = parsedEvent.content;
      await fetchEventsFromAmplitude(ctx.websocket, start, end);
    }
  });

  ctx.websocket.on("close", () => {
    clearInterval(pingInterval);
  });

  ctx.websocket.send(
    JSON.stringify({ message: "Connected to server", type: "Server" })
  );
});

router.get("/", async (ctx) => {
  await ctx.render("home");
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(process.env.PORT || PORT, () => {
  console.log(
    `Server is running on http://localhost:${process.env.PORT || PORT}`
  );
});
