const Koa = require("koa");
const Router = require("@koa/router");
const views = require("koa-views");
const path = require("path");
const static = require("koa-static");

const { fetchEventsFromAmplitude } = require("./amplitudeService");

const app = new Koa();
const router = new Router();

app.use(static(path.join(__dirname, "/static")));
app.use(views(path.join(__dirname, "/views"), { extension: "ejs" }));
app.use(static(path.join(__dirname, "public")));

router.get("/", async (ctx) => {
  await ctx.render("home");
});

router.get("/events", async (ctx) => {
  const { start, end } = ctx.request.query;
  try {
    const allEvents = await fetchEventsFromAmplitude(start, end);

    if (allEvents.length === 0) {
      ctx.body = { message: "No events found" };
    } else {
      await ctx.render("events", { allEvents });
    }
  } catch (error) {
    console.error(error);
    ctx.status = 500;
    ctx.body = { error: "Internal server error" };
  }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
