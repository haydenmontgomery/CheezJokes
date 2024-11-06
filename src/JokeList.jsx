import React, {useEffect, useState, useRef}from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/** List of jokes. */

const JokeList = ({ numJokesToGet }) => {

  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // need useRef to make sure the api is only called once each time. Network tab was indicating that we were making two calls to the api the first load.
  const isSet = useRef(false);


  const generateNewJokes = () => {
    isSet.current = false;
    setIsLoading(true);
    setJokes([]);
  }
  


  useEffect(() => {
    if (!isSet.current) {
      async function getJokes() {
        try {
          // load jokes one at a time, adding not-yet-seen jokes
          let newJokes = [];
          let seenJokes = new Set();
        
          while (newJokes.length < numJokesToGet) {
            let res = await axios.get("https://icanhazdadjoke.com", {
              headers: { Accept: "application/json" }
            });
            let { ...joke } = res.data;
          
            if (!seenJokes.has(joke.id)) {
              seenJokes.add(joke.id);
              newJokes.push({ ...joke, votes: 0 });
            } else {
              console.log("duplicate found!");
            }
          }
          setJokes(newJokes)
          setIsLoading(false);
        } catch (err) {
          console.log(err);
        }
    }
    getJokes();
    isSet.current = true;
  }
}, [numJokesToGet, isLoading])

  /* change vote for this id by delta (+1 or -1) */

  const vote = (id, delta) => {
    setJokes(jokes =>
      jokes.map(j =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      )
    );
  };

  /* render: either loading spinner or list of sorted jokes. */

  let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    )
  }

  return (
    <div className="JokeList">
      <button
        className="JokeList-getmore"
        onClick={generateNewJokes}
      >
        Get New Jokes
      </button>

      {sortedJokes.map(j => (
        <Joke
          text={j.joke}
          key={j.id}
          id={j.id}
          votes={j.votes}
          vote={vote}
        />
      ))}
    </div>
  );
}

JokeList.defaultProps = {
  numJokesToGet: 5
};

export default JokeList;
