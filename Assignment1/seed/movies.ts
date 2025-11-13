import {Movie, MovieCast, Actor, Award} from '../shared/types'

export const movies : Movie[] = [
  {
    movieId: 1,
    title: 'Rebel Moon - Part One: A Child of Fire',
    overview: 'When a peaceful colony on the edge of the galaxy finds itself threatened by the armies of the tyrannical Regent Balisarius, they dispatch Kora, a young woman with a mysterious past, to seek out warriors from neighboring planets to help them take a stand.',
    releaseDate: '2023-12-15'
  },
  {
    movieId: 2,
    title: 'Cinderella',
    overview: 'A princess losses her father and has to live with her cruel stepmother and stepsisters who force her to do chores. Can she find herself a prince charming to rescue her from this life of misery?',
    releaseDate: '2020-10-06'
  }
]

export const actors: Actor[] = [
  {
    actorId: 101,
    name: "Amber White",
    bio: "Grew up in Germany with her grandmother",
    dateOfBirth: "1985-03-18"
  },
  {
    actorId: 102,
    name: "Jeremy Michaels",
    bio: "American voice actor best known for his parts in spongebob",
    dateOfBirth: "1970-02-09"
  },
  {
    actorId: 103,
    name: "Calix Enchanter",
    bio: "Once a famous model, now an actor",
    dateOfBirth: "2000-10-19"
  }
]

export const movieCasts: MovieCast[] = [
 {
    movieId: 1,
    actorId: 101,
    roleName: "Kora",
    roleDescription: "Protagonist who must fight to save the world from evil",
 },
 {
    movieId: 1,
    actorId: 102,
    roleName: "Patrick",
    roleDescription: "Patrick the goofy pink starfish",
 },
 {
    movieId: 2,
    actorId: 101,
    roleName: "Cinderella",
    roleDescription: "Princess forced to do endless chores for her stepfamily",
 },
 {
    movieId: 2,
    actorId: 103,
    roleName: "Prince charming",
    roleDescription: "Destined to fall in love with Cinderella and rescue her to a life of luxury",
 },
];

export const awards: Award[] = [
  {
    awardId: 101,
    body: "Bafta",
    category:"Best Actor",
    year: 2013
  },
  {
    awardId: 101,
    body: "Academy",
    category:"Best Supporting Actor",
    year: 2017
  },
  {
    awardId: 2,
    body: "Golden Globe",
    category:"Best Childrens Movie",
    year: 2009
  },
  {
    awardId: 2,
    body: "Bafta",
    category:"Best Movie",
    year: 2021
  }
]

