import * as cdk from 'aws-cdk-lib';
import * as lambdanode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/util";
import { movies, movieCasts, actors, awards} from "../seed/movies";

import { Construct } from 'constructs';

export class Assignment1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //const moviesTable = new dynamodb.Table(this, "MoviesTable", {
    //  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    //  partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
    //  removalPolicy: cdk.RemovalPolicy.DESTROY,
    //  tableName: "Movies",
    //});

    const movieDatabaseTable = new dynamodb.Table(this, "MovieDatabaseTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "partition", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sort", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "MovieDatabase",
    });

    //movieCastsTable.addLocalSecondaryIndex({
    //  indexName: "roleIx",
    //  sortKey: { name: "roleName", type: dynamodb.AttributeType.STRING },
    //});

    const allWrites = [
      generateBatch(movies),      
      generateBatch(movieCasts),
      generateBatch(actors),
      generateBatch(awards),
    ].flat();

    new custom.AwsCustomResource(this, "moviesddbInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [movieDatabaseTable.tableName]: allWrites
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("moviesddbInitData"), //.of(Date.now().toString()),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [movieDatabaseTable.tableArn],  
      }),
    });

    const getMovieByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getMovieById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: movieDatabaseTable.tableName,
          REGION: cdk.Aws.REGION,
        },
      }
    );
      
    const getAllMoviesFn = new lambdanode.NodejsFunction(
      this,
      "GetAllMoviesFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: `${__dirname}/../lambdas/getAllMovies.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: movieDatabaseTable.tableName,
          REGION: cdk.Aws.REGION,
        },
      }
    );

    movieDatabaseTable.grantReadData(getMovieByIdFn)
    movieDatabaseTable.grantReadData(getAllMoviesFn)

    const getMovieByIdURL = getMovieByIdFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const getAllMoviesURL = getAllMoviesFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });
    
    new cdk.CfnOutput(this, "Get Movie Function Url", { value: getMovieByIdURL.url });
  new cdk.CfnOutput(this, "Get All Movies Function Url", { value: getAllMoviesURL.url });
    /*
    const getAllMoviesURL = getAllMoviesFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    const getMovieCastMembersFn = new lambdanode.NodejsFunction(
      this,
      "GetCastMemberFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_16_X,
        entry: `${__dirname}/../lambdas/getMovieCastMembers.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          CAST_TABLE_NAME: movieCastsTable.tableName,
          REGION: "eu-west-1",
        },
      }
    );

    const getMovieCastMembersURL = getMovieCastMembersFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });   

    movieDatabaseTable.grantReadData(getMovieByIdFn)
    //moviesTable.grantReadData(getAllMoviesFn)
    //movieCastsTable.grantReadData(getMovieCastMembersFn);

    const getMovieByIdURL = getMovieByIdFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
      },
    });

    new cdk.CfnOutput(this, "Get All Movies Function Url", { value: getAllMoviesURL.url });
    new cdk.CfnOutput(this, "Get Movie Cast Url", { value: getMovieCastMembersURL.url });

    new cdk.CfnOutput(this, "Get Movie Function Url", { value: getMovieByIdURL.url });
    */

  }
}
