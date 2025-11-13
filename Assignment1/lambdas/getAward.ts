import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { AwardQueryParams } from "../shared/types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json";

const ajv = new Ajv();
const isValidQueryParams = ajv.compile(
  schema.definitions["AwardQueryParams"] || {}
);
 
const ddbDocClient = createDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {

    console.log("[EVENT]", JSON.stringify(event));

    const queryParams = event.queryStringParameters;

    if (!queryParams) {
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ message: "Missing query parameters" }),
        };
    }

    if (!isValidQueryParams(queryParams)) {
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                message: `Incorrect type. Must match Query parameters schema`,
                schema: schema.definitions["AwardQueryParams"],
            }),
        };
    }

    let commandInput: QueryCommandInput = {
      TableName: process.env.TABLE_NAME,
    };

    let items: any[] = [];

    if ("movieId" in queryParams && queryParams.movieId && "actorId" in queryParams && queryParams.actorId) {
        const moviePartitionKey = `w${parseInt(queryParams.movieId)}`;
        const actorPartitionKey = `w${parseInt(queryParams.actorId)}`;

        let movieCommandInput: QueryCommandInput = {
            TableName: process.env.TABLE_NAME,
        };
        let actorCommandInput: QueryCommandInput = {
            TableName: process.env.TABLE_NAME,
        };

        if ("awardBody" in queryParams) {
            movieCommandInput = {
                ...movieCommandInput,
                KeyConditionExpression: "#p = :pk and #s = :sk",
                ExpressionAttributeNames: {
                    "#p": "partition",
                    "#s": "sort"
                },
                ExpressionAttributeValues: {
                    ":pk": moviePartitionKey,
                    ":sk": queryParams.awardBody
                }
            };
        }else{
            movieCommandInput = {
                ...movieCommandInput,
                KeyConditionExpression: "#p = :pk",
                ExpressionAttributeNames: {
                    "#p": "partition"
                },
                ExpressionAttributeValues: {
                    ":pk": moviePartitionKey
                }
            };
        }

        if ("awardBody" in queryParams) {
            actorCommandInput = {
                ...actorCommandInput,
                KeyConditionExpression: "#p = :pk and #s = :sk",
                ExpressionAttributeNames: {
                    "#p": "partition",
                    "#s": "sort"
                },
                ExpressionAttributeValues: {
                    ":pk": actorPartitionKey,
                    ":sk": queryParams.awardBody
                }
            };
        }else{
            actorCommandInput = {
                ...actorCommandInput,
                KeyConditionExpression: "#p = :pk",
                ExpressionAttributeNames: {
                    "#p": "partition"
                },
                ExpressionAttributeValues: {
                    ":pk": actorPartitionKey
                }
            };
        }

        const movieCommandOutput = await ddbDocClient.send(
            new QueryCommand(movieCommandInput)
        );
        const actorCommandOutput = await ddbDocClient.send(
            new QueryCommand(actorCommandInput)
        );

        items = [
            ...(movieCommandOutput.Items ?? []),
            ...(actorCommandOutput.Items ?? [])
        ];

    }else if ("movieId" in queryParams && queryParams.movieId) {
        const partitionKey = `w${parseInt(queryParams.movieId)}`;
        if ("awardBody" in queryParams) {
            commandInput = {
                ...commandInput,
                KeyConditionExpression: "#p = :pk and #s = :sk",
                ExpressionAttributeNames: {
                    "#p": "partition",
                    "#s": "sort"
                },
                ExpressionAttributeValues: {
                    ":pk": partitionKey,
                    ":sk": queryParams.awardBody
                }
            };
        }else{
            commandInput = {
                ...commandInput,
                KeyConditionExpression: "#p = :pk",
                ExpressionAttributeNames: {
                    "#p": "partition"
                },
                ExpressionAttributeValues: {
                    ":pk": partitionKey
                }
            };
        }

        const commandOutput = await ddbDocClient.send(
            new QueryCommand(commandInput)
        );
        items = commandOutput.Items ?? [];

    } else if ("actorId" in queryParams && queryParams.actorId) {
        const partitionKey = `w${parseInt(queryParams.actorId)}`;
        if ("awardBody" in queryParams) {
            commandInput = {
                ...commandInput,
                KeyConditionExpression: "#p = :pk and #s = :sk",
                ExpressionAttributeNames: {
                    "#p": "partition",
                    "#s": "sort"
                },
                ExpressionAttributeValues: {
                    ":pk": partitionKey,
                    ":sk": queryParams.awardBody
                }
            };
        }else{
            commandInput = {
                ...commandInput,
                KeyConditionExpression: "#p = :pk",
                ExpressionAttributeNames: {
                    "#p": "partition"
                },
                ExpressionAttributeValues: {
                    ":pk": partitionKey
                }
            };
        }

        const commandOutput = await ddbDocClient.send(
            new QueryCommand(commandInput)
        );
        items = commandOutput.Items ?? [];
    } 
    //else {
    //    commandInput = {
    //        ...commandInput,
    //        KeyConditionExpression: "movieId = :m",
    //        ExpressionAttributeValues: {
    //        },
    //    };
    //}
    
      
      return {
        statusCode: 200,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
          data: items,
        }),
    };
 } catch (error: any) {
      console.log(JSON.stringify(error));
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
 },
        body: JSON.stringify({ error }),
 };
 }
 };
  
  function createDocumentClient() {
    const ddbClient = new DynamoDBClient({ region: process.env.REGION });
    const marshallOptions = {
      convertEmptyValues: true,
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
 };
    const unmarshallOptions = {
    wrapNumbers: false,
 };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
