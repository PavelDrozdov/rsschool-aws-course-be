import { APIGatewayProxyHandler, APIGatewayProxyEvent  } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) => {
  if (event.queryStringParameters && event.queryStringParameters.name) {
    const {name} = event.queryStringParameters;
    const bucketName = process.env.BUCKET_NAME;
    const key = `uploaded/${name}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: 60,
    };

    const signedUrl = s3.getSignedUrl('putObject', params);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({url: signedUrl}),
    };
  }

  return {
    statusCode: 500,
    body: JSON.stringify({ message: "import error" })
  };
};
