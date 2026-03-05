import express from "express";
import bodyParser from "body-parser";
import pg, { Client } from 'pg'

import env from 'dotenv'
env.config();

const app = express();
const port = process.env.PORT_ENV  || 3000;


const db= new Client({
    connectionString:process.env.DATABASE_URL_ENV,
    ssl: {
        rejectUnauthorized: false
    }
})

db.connect();

var quiz;
db.query('select * from flags', (err, res)=>{
    if(err){
        console.log('Error while executing query', err.stack);
    }
    else{
        quiz=res.rows
        // console.log(quiz);
    }
    db.end();
})

let totalCorrect = 0;

// let quiz = [
//   { country: "France", flag: "fr" },
//   { country: "UK", flag: "gb" },
//   { country: "USA", flag: "us" },
// ];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  console.log('d', answer, currentQuestion.name);
  // if(answer===undefined){
  //   res.redirect('/');
  // }
  let isCorrect = false;
  // if (currentQuestion.country.toLowerCase() === answer.toLowerCase()) {  for quiz defined here
  // if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) { // for quiz made by database
  // below one i have made since some countries has long name so even some 
  if(answer.length>3 && currentQuestion.name.toLowerCase().includes(answer.toLowerCase())){
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}


app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
