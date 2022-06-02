import http from 'http';
import Koa from 'koa';
import Router from 'koa-router';
import koaBody from 'koa-body';

import getFromCub from './node/getFromCub.mjs';
import cubDataAsync from './node/cubDataAsync.mjs';
import mainCalculations from './node/mainCalculations.mjs';
import getFromSportlevel from './node/getFromSportlevel.mjs';
import writeToFile from './node/writeToFile.mjs';
import getFromTechProblem from './node/getFromTechProblem.mjs'
import simpleWrite from './node/simpleWrite.mjs'

const router = new Router();

const app = new Koa();
app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
    json: true,
    text: true,
    formLimit: '10mb',
    jsonLimit: '10mb',
    textLimit: '10mb',
    enableTypes: ['json', 'form', 'text'],
  }),
);

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    const n = await next();
    return n;
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set(
        'Access-Control-Allow-Headers',
        ctx.request.get('Access-Control-Request-Headers'),
      );
    }

    ctx.response.status = 204;
  }

  return true;
});

app.use(async (ctx, next) => {
  ctx.response.set({
    'Access-Control-Allow-Origin': '*',
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
      message: err.message
    };
  }
})

router.get('/getResult', async (ctx, next) => {
  const exportResult = await getFromSportlevel();
  const result = await getFromCub();
  exportResult.cub = result;
  const calc = await mainCalculations(exportResult);
  writeToFile(calc);
  ctx.body = calc;
  await next();
});

router.post('/getResult', async (ctx, next) => {
  const data = ctx.request.body;
  // console.log(data)
  // const result = await cubDataAsync(data)

  // const result = await getFromCub();
  ctx.body = data;
  await next();
});

router.post('/techProblem', async (ctx, next) => {
  // console.log(ctx.request.body)
  const exportResult = await getFromTechProblem(ctx.request.body);
  // const result = await getFromCub();
  // exportResult.cub = result;
  // const calc = await mainCalculations(exportResult);
  simpleWrite(exportResult);
  ctx.body = exportResult;
  await next();
});

app.use(router.routes()).use(router.allowedMethods());

const server = http.createServer(app.callback());
const port = process.env.PORT_Beck || 7072;
server.listen(port);

// ----------------------------------
// router.get('/api/books/:id', async (ctx, next) => {
//   books.forEach((element) => {
//     if (element.key === ctx.params.id) {
//       const file = element.fileBook;
//       const regex = /^data:.+\/(.+);base64,(.*)$/;

//       const matches = file.match(regex);
//       const data = matches[2];
//       const buffer = Buffer.from(data, 'base64');

//       ctx.body = buffer;

//       ctx.set(
//         'Content-disposition',
//         `attachment; filename=${element.fileName}`,
//       );
//     }
//   });
//   await next();
// });

// router.post('/api/user/login', async (ctx, next) => {
//   const message = JSON.parse(ctx.request.body);
//   const users = [
//     { id: 1, mail: 'bropet@mail.ru', pass: '123' },
//     { id: 2, mail: 'test@test.com', pass: 'test' },
//   ];
//   let response = users.filter(
//     (elem) => !!(elem.mail === message.mail && elem.pass === message.pass),
//   );
//   response =
//     response.length !== 0
//       ? { id: response[0].id, mail: response[0].mail }
//       : { message: 'Неправильая почта или пароль' };
//   ctx.body = JSON.stringify(response);
//   await next();
// });

// router.post('/api/books', async (ctx, next) => {
//   books.push(ctx.request.body);
//   ctx.body = JSON.stringify(ctx.request.body);
//   await next();
// });

// router.get('/api/favotites/books', async (ctx, next) => {
//   ctx.body = JSON.stringify(
//     books.filter((element) => element.favorite === 'true'),
//   );
//   await next();
// });

// router.post('/api/favorites/books/:id', async (ctx, next) => {
//   books.forEach((element) => {
//     if (element.key === ctx.params.id) {
//       const elem = element;
//       elem.favorite = 'true';
//     }
//   });
//   ctx.body = 'ok';
//   await next();
// });

// router.del('/api/favorites/books/:id', async (ctx, next) => {
//   books.forEach((element) => {
//     if (element.key === ctx.params.id) {
//       const elem = element;
//       elem.favorite = '';
//     }
//   });
//   ctx.body = 'ok';
//   await next();
// });
