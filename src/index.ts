import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, Context, APIGatewayRequestAuthorizerEventV2 } from 'aws-lambda';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { promisify } from 'util';
import { SSM } from 'aws-sdk';

const ssm = new SSM();

interface CustomJwtPayload extends JwtPayload {
  'cognito:groups'?: string[];
}

const jwksUri = process.env.AWS_COGNITO_URL;
if (!jwksUri) {
  throw new Error('JWKS_URI environment variable is not defined');
}

const client = jwksClient({
  jwksUri: jwksUri
});

const getSigningKey = promisify(client.getSigningKey);

export const handler = async (event: APIGatewayRequestAuthorizerEventV2, context: Context): Promise<APIGatewayAuthorizerResult> => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  if (!event.headers || !event.headers.authorization) {
    console.error('authorizationToken is missing from the event');
    throw new Error('Unauthorized');
  }
  const token = event.headers.authorization.split(' ')[1];

  try {
    const decodedHeader: any = jwt.decode(token, { complete: true });
    const kid = decodedHeader.header.kid;
    const key = await getSigningKey(kid);
    if(key == undefined) throw new Error("Key not defined")
    const signingKey = key.getPublicKey();

    const decoded = jwt.verify(token, signingKey) as CustomJwtPayload;
    console.log(decoded);
    // Check if the user belongs to the AdminUsers group
    if (decoded['cognito:groups'] && decoded['cognito:groups'].includes('AdminUsers')) {
      return generatePolicy('user', 'Allow', event.routeArn);
    } else {
      return generatePolicy('user', 'Deny', event.routeArn);
    }
  } catch (err) {
    console.error('Token verification failed:', err);
    return generatePolicy('user', 'Deny', event.routeArn);
  }
};

// Define the type for StatementEffect
type StatementEffect = 'Allow' | 'Deny';

// Function to generate the authorization policy
const generatePolicy = (principalId: string, effect: StatementEffect, resource: string): APIGatewayAuthorizerResult => {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    }
  };

  return authResponse;
};