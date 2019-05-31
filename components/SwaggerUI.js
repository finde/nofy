const swaggerUIDist = require('swagger-ui-dist');
const Express = require('express');
const fs = require('fs');

module.exports = function SwaggerUI(nofy, { express, config }, cb) {
  if (!config.swagger) {
    return cb('SKIP')
  }

  const pathToSwaggerUi = swaggerUIDist.absolutePath();
  const indexContent = fs.readFileSync(`${pathToSwaggerUi}/index.html`)
    .toString()
    .replace('https://petstore.swagger.io/v2/swagger.json', `http://localhost:${config.swagger.port}/swagger-spec.json`);

  const swaggerExpress = Express();

  swaggerExpress.get('/swagger-spec.json', (req, res) => {
    res.json(nofy.swaggerDefinition);
  });
  swaggerExpress.get('/', (req, res) => res.send(indexContent));
  swaggerExpress.get('/index.html', (req, res) => res.send(indexContent)); // you need to do this since the line below serves `index.html` at both routes
  swaggerExpress.use(Express.static(pathToSwaggerUi));

  swaggerExpress.listen(config.swagger.port, () => {
    console.log(`\nSwagger started, listening on port http://localhost:${config.swagger.port}`);
  });

  cb('OK');
};
