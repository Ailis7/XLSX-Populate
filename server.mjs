import http from "http";
import Koa from "koa";
import Router from "koa-router";
import koaBody from "koa-body";

import getFromCub from "./node/getFromCub.mjs";
import cubDataAsync from "./node/cubDataAsync.mjs";
import mainCalculations from "./node/mainCalculations.mjs";
import getFromSportlevel from "./node/getFromSportlevel.mjs";
import writeToFile from "./node/writeToFile.mjs";
import getFromTechProblem from "./node/getFromTechProblem.mjs";
import getFromTechProblem2 from "./node/getFromTechProblem2.mjs";
import getFromGetID from "./node/id/getFromGetID.mjs";
import simpleWrite from "./node/simpleWrite.mjs";
import { addCommandToDB } from "./dataBase/index.mjs";

const router = new Router();

const app = new Koa();
app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
    json: true,
    text: true,
    formLimit: "20mb",
    jsonLimit: "20mb",
    textLimit: "20mb",
    enableTypes: ["json", "form", "text"],
  })
);

app.use(async (ctx, next) => {
  const origin = ctx.request.get("Origin");
  if (!origin) {
    const n = await next();
    return n;
  }

  const headers = { "Access-Control-Allow-Origin": "*" };

  if (ctx.request.method !== "OPTIONS") {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get("Access-Control-Request-Method")) {
    ctx.response.set({
      ...headers,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
    });

    if (ctx.request.get("Access-Control-Request-Headers")) {
      ctx.response.set(
        "Access-Control-Allow-Headers",
        ctx.request.get("Access-Control-Request-Headers")
      );
    }

    ctx.response.status = 204;
  }

  return true;
});

app.use(async (ctx, next) => {
  ctx.response.set({
    "Access-Control-Allow-Origin": "*",
  });

  await next();
});
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // will only respond with JSON
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message,
    };
  }
});

router.get("/getResult", async (ctx, next) => {
  const exportResult = await getFromSportlevel();
  const result = await getFromCub();
  exportResult.cub = result;
  const calc = await mainCalculations(exportResult);
  ctx.body = calc;
  await next();
});

router.post("/writeToFile", async (ctx, next) => {
  const data = ctx.request.body;
  writeToFile(data);
  ctx.body = "success";
  await next();
});

router.post("/addCommandToDB", async (ctx, next) => {
  const data = ctx.request.body;
  const result = await addCommandToDB(data.slvlCommand, data.cubCommand)

  // пароль от постгреса, просто буква "p" английская 
  console.log(result, 'newresult');
  ctx.body = result;
  await next();
});

router.post("/techProblem", async (ctx, next) => {
  // console.log(ctx.request.body)
  const exportResult = await getFromTechProblem(ctx.request.body);
  // const result = await getFromCub();
  // exportResult.cub = result;
  // const calc = await mainCalculations(exportResult);
  simpleWrite(exportResult);
  ctx.body = exportResult;
  await next();
});

router.get("/techProblem2", async (ctx, next) => {
  const exportResult = await getFromTechProblem2();
  // simpleWrite(exportResult);
  ctx.body = exportResult;
  await next();
});

router.post("/getID", async (ctx, next) => {
  const exportResult = await getFromGetID(ctx.request.body);

  // writeToFile(calc);
  ctx.body = exportResult;
  await next();
});

app.use(router.routes()).use(router.allowedMethods());

const server = http.createServer(app.callback());
const port = process.env.PORT_Beck || 7072;
server.listen(port);
