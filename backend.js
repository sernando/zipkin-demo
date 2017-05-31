// /* eslint-disable import/newline-after-import */
// // initialize tracer
// const express = require('express');
// const CLSContext = require('zipkin-context-cls');
// const {Tracer} = require('zipkin');
// const {recorder} = require('./recorder');

// const ctxImpl = new CLSContext('zipkin');
// const tracer = new Tracer({ctxImpl, recorder});

const request = require('request');

// const app = express();

// // instrument the server
// const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
// app.use(zipkinMiddleware({
//   tracer,
//   serviceName: 'backend' // name of this application
// }));
// const HttpHeaders = {
//   TraceId: 'X-B3-TraceId',
//   SpanId: 'X-B3-SpanId',
//   ParentSpanId: 'X-B3-ParentSpanId',
//   Sampled: 'X-B3-Sampled',
//   Flags: 'X-B3-Flags'
// };

// const appendZipkinHeaders = (headers = {}, traceId) => {
//   headers[HttpHeaders.TraceId] = traceId.traceId;
//   headers[HttpHeaders.SpanId] = traceId.spanId;

//   traceId._parentId.ifPresent((psid) => {
//     console.log(psid);
//     headers[HttpHeaders.ParentSpanId] = psid;
//   });
//   traceId.sampled.ifPresent((sampled) => {
//     headers[HttpHeaders.Sampled] = sampled ? '1' : '0';
//   });

//   return headers;
// };
// const a = () => {
//   const headers = appendZipkinHeaders({}, tracer.id);
//   console.log(tracer.id);
//   // console.log(tracer);
//   console.log('backend');
//   console.log(headers);
//   tracer.recordBinary('key', 'value');
//   // return Promise.resolve('1');
//   return new Promise((resolve) => {
//     request({
//       url: 'http://localhost:8082/doservice/123',
//       method: 'GET',
//       headers
//     }, (err, response, body) => {
//       console.log(body);
//       resolve(body);
//     });
//   });
// };

// app.get('/api', (req, res) => {
//   a().then((ress) => {
//     res.send(ress);
//   });
// });

// app.listen(9000, () => {
//   console.log('Backend listening on port 9000!');
// });
/* eslint-disable import/newline-after-import */
// initialize tracer
const express = require('express');
const CLSContext = require('zipkin-context-cls');
const {Tracer} = require('zipkin');
const {recorder} = require('./recorder');

const ctxImpl = new CLSContext('zipkin');
const tracer = new Tracer({ctxImpl, recorder});

// const request = require('request');
const rest = require('rest');

const app = express();

// instrument the server
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
app.use(zipkinMiddleware({
  tracer,
  serviceName: 'backend' // name of this application
}));

const {restInterceptor} = require('zipkin-instrumentation-cujojs-rest');
const zipkinRest = rest.wrap(restInterceptor, {tracer, serviceName: 'backend'});
console.log(zipkinRest);
app.get('/api', (req, res) => {
  console.log(12345);
  zipkinRest('http://localhost:8082/doservice/123')
    .then(response => res.send(response.entity))
    .catch(err => console.error('Error', err.stack));
});

app.get('/api1', (req, res) => {
  console.log(12345);
  res.send(12345);
});


app.listen(9000, () => {
  console.log('Backend listening on port 9000!');
});
