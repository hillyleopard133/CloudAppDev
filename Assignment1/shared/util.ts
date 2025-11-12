import { marshall } from "@aws-sdk/util-dynamodb";
import { WriteRequest } from "@aws-sdk/client-dynamodb";
import { Movie, MovieCast, Actor, Award} from "./types";

/*
type Entity = Movie | MovieCast | Actor | Award;  // NEW
export const generateItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
 },
 };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateItem(e);
 });
};

*/

type Seed = Movie | MovieCast | Actor | Award;

function toDbItem(e: Seed) {
  // Movie
  if ("movieId" in e && "title" in e && "overview" in e) {
    return {
      partition: `m${e.movieId}`, 
      sort: "xxxx",
      ...e,
    };
  }
  // MovieCast
  if ("movieId" in e && "actorId" in e && "roleName" in e) {
    return {
      partition: `c${e.movieId}`,
      sort: String(e.actorId),
      ...e,
    };
  }
  // Actor
  if ("actorId" in e && "dateOfBirth" in e) {
    return {
      partition: `a${e.actorId}`,
      sort: "xxxx",
      ...e,
    };
  }
  // Award 
  if ("awardId" in e && "body" in e) {
    return {
      partition: `w${e.awardId}`,
      sort: e.body,
      ...e,
    };
  }

  return null;
}

export function generateItem(entity: Seed): WriteRequest {
  return { PutRequest: { Item: marshall(toDbItem(entity)) } };
}

export function generateBatch(data: Seed[]): WriteRequest[] {
  return data.map(generateItem);
}