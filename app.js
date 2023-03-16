const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbpath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializedbandserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializedbandserver();

const convert = (dbobject) => {
  return {
    movieName: dbobject.movie_name,
  };
};

const convertdirector = (dbobject) => {
  return {
    directorid: dbobject.director_id,
    directorname: dbobject.director_name,
  };
};

const convertmovie = (dbobject) => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const moviequery = `SELECT movie_name FROM movie;`;
  const allmovie = await db.all(moviequery);
  response.send(allmovie.map((each) => convert(each)));
});

app.post("/movies/", async (request, response) => {
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const addmovie = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES (${directorId},${movieName},${leadActor});`;
  const wait = await db.run(addmovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getmovie = `SELECT * FROM movie WHERE movie_id = ${movieid};`;
  const movie = await db.get(getmovie);
  response.send(movie.map((each) => convertmovie(each)));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updatemovie = request.body;
  const { directorId, movieName, leadActor } = updatemovie;
  const updatequest = `UPDATE movie SET director_id = ${directorId},movie_name = ${movieName},lead_actor = ${leadActor} 
  WHERE movie_id = ${movieId};`;
  await db.run(updatequest);
  response.send("Movie Details Updated");
});

app.get("/directors/", async (request, response) => {
  const getdirectors = `SELECT * FROM director`;
  const director = await db.all(getdirectors);
  response.send(director.map((each) => convertdirector(each)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getquery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  const moviedetails = await db.all(getquery);
  response.send(moviedetails.map((each) => convert(each)));
});

module.exports = app;
