const {
  getGraphQLParameters,
  renderGraphiQL,
  shouldRenderGraphiQL,
} = require('graphql-helix');

const { GraphQLClient } = require('graphql-request');

const { conf } = require('./conf');

module.exports = async function graphqlHandler(req, res) {
  const request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };

  request.headers.referer = 'https://www.blacked.com/graphql'

  console.log(request.headers);

  if (shouldRenderGraphiQL(request)) {
    res.send(renderGraphiQL());
    return;
  }

  const {
    query,
    variables,
    operationName,
  } = getGraphQLParameters(request);

  const client = new GraphQLClient(conf.remote, {
    headers: request.headers,
  });

  const data = await client.request(query, variables);

  console.log(query, variables, operationName);

  res.json(data);
};
