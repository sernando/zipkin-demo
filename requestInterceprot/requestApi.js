/* eslint-disable import/newline-after-import */
// initialize tracer
const express = require('express');
const request = require('request');
const wrapRequest = require('./wrapRequest.js');
const CLSContext = require('zipkin-context-cls');
const {Tracer} = require('zipkin');
const {recorder} = require('./../recorder');

const ctxImpl = new CLSContext('zipkin');
const tracer = new Tracer({ctxImpl, recorder});

const app = express();
const zipkinRequest = wrapRequest(request, {tracer, serviceName: 'request-backend'});

// instrument the server
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
app.use(zipkinMiddleware({
  tracer,
  serviceName: 'request-backend' // name of this application
}));

// instrument the client
// const {restInterceptor} = require('zipkin-instrumentation-cujojs-rest');
// const zipkinRest = rest.wrap(restInterceptor, {tracer, serviceName: 'frontend'});

// Allow cross-origin, traced requests. See http://enable-cors.org/server_expressjs.html
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', [
    'Origin', 'Accept', 'X-Requested-With', 'X-B3-TraceId',
    'X-B3-ParentSpanId', 'X-B3-SpanId', 'X-B3-Sampled'
  ].join(', '));
  next();
});

app.get('/api', (req, res) => {
  // console.log(tracer);
      // tracer.scoped(() => {
  zipkinRequest({url: 'http://localhost:9000/api1'}, tracer)
        .then((respon) => {
          console.log(respon);
        }).catch(err => console.error('Error', err.stack));
  zipkinRequest({url: 'http://localhost:8082/doservice/123'}, tracer)
    .then(() => {
      console.log(123);
      // tracer.scoped(() => {
      zipkinRequest({url: 'http://localhost:9000/api'}, tracer)
        .then((respon) => {
          console.log(respon);
          res.send(respon);
        });
    })
    .catch(err => console.error('Error', err.stack));
});

app.listen(9001, () => {
  console.log('requestBackend listening on port 9001!');
});
