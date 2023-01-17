import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import useragent from 'express-useragent';
import type { ErrorRequestHandler } from 'express';

import api from './api.js';

const app = express();

app.use(compression());
app.use(cors());
app.use(useragent.express());

app.use('/*', (req, res, next) => {
  if (req.useragent?.browser === 'IE') {
    res.send('Please use a real browser').status(400);
  } else {
    next();
  }
});

app.use(express.static(new URL('./client/', import.meta.url).pathname));

app.get('/api/*', api);

app.get('/*', function (req, res, next) {
  res.sendFile(new URL('./client/index.html', import.meta.url).pathname);
});

app.use(((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: 'Something went wrong in express server', error: err.message });
}) as ErrorRequestHandler);

app.use((req, res, next) => {
  res.status(404).send({ message: `Route ${req.originalUrl} (${req.method}) not found` });
});

const port = process.env.APP_SERVER_PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});