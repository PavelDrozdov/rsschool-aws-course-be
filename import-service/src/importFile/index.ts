import {S3Handler, S3Event} from 'aws-lambda';
import * as AWS from 'aws-sdk';
const s3 = new AWS.S3();

export const handler: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const { bucket, object } = record.s3;
    const params = {
      Bucket: bucket.name,
      Key: object.key,
    };

    try {
      const data = await s3.getObject(params).promise();
      if(data.Body) {
        const csvData = data.Body.toString('utf-8');
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');

        lines.slice(1).forEach((line) => {
          const values = line.split(',');
          const record = headers.reduce((acc: any, header, index) => {
            acc[header] = values[index];
            return acc;
          }, {});
          console.log('Record:', record);
        });
      }
    } catch (error) {
      console.error('Error processing S3 event:', error);
    }
  }
};
