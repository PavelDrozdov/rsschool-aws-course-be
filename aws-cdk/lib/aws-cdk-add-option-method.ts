import * as apigateway from "aws-cdk-lib/aws-apigateway";

export const addCorsOptions = (apiResource: apigateway.IResource) => {
  apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Access-Control-Allow-Origin'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
      },
    }],
    passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      'application/json': '{"statusCode": 200}'
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseModels: {
        'application/json': apigateway.Model.EMPTY_MODEL,
      },
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  });

  return apiResource;
}
