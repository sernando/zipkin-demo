const {Annotation, Request} = require('zipkin');
// const request = require('request');

function wrapRequest(request, {tracer, serviceName = 'unknown', remoteServiceName}) {
  return function zipkinRequest(opts = {}) {
    return new Promise((resolve, reject) => {
      tracer.scoped(() => {
        tracer.setId(tracer.createChildId());
        const traceId = tracer.id;

        const method = opts.method || 'GET';
        tracer.recordServiceName(serviceName);
        tracer.recordRpc(method.toUpperCase());
        tracer.recordBinary('http.url', opts.url);
        tracer.recordAnnotation(new Annotation.ClientSend());
        if (remoteServiceName) {
          // TODO: can we get the host and port of the http connection?
          tracer.recordAnnotation(new Annotation.ServerAddr({
            serviceName: remoteServiceName
          }));
        }

        const zipkinOpts = Request.addZipkinHeaders(opts, traceId);
        request(zipkinOpts, (err, httpResponse, response) => {
          tracer.scoped(() => {
            tracer.setId(traceId);
            tracer.recordBinary('http.status_code', httpResponse.statusCode.toString());
            tracer.recordAnnotation(new Annotation.ClientRecv());
          });
          if (err) return reject(err);
          resolve(response);
        });
      });
    });
  };
}

module.exports = wrapRequest;
