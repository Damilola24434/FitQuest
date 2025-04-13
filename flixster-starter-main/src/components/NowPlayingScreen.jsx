/* eslint-disable react/prop-types */
import {useEffect, useState} from "react";
import MovieList from "./MovieList";
import SideBar from "./SideBar";
const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;


function NowPlayingScreen({criteriaFromHeader, setFave, isFave, setWatched, isWatched}){ 
    const [movies, setMovies]=useState([]);
    const [pageNumber, setPageNumber]=useState(1);
    const[url, setUrl]=useState(`https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${pageNumber}`)

    function addToFave(movieId){
      if(isFave.includes(movieId)){
        setFave(prevIds => prevIds.filter(prevId => prevId !== movieId))

      } else{
        setFave(prevId => [...prevId, movieId])
      }
    }

    function addToWatched(movieId){
      if(isWatched.includes(movieId)){
        setWatched(prevIds => prevIds.filter(prevId => prevId !== movieId))

      } else {
        setWatched(prevId => [...prevId, movieId])
      }
    }
  
    useEffect(()=>{
      const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`
          }
        };
        
        fetch(url, options)
          .then(response => response.json())
          .then(response => {
            handleSortMovies(criteriaFromHeader, movies.concat(response.results))
           
          })
          .catch(err => console.error(err));
      }, [url, pageNumber]);

      function loadMore(){
        setPageNumber(prevPageNumber => prevPageNumber+1)
        setUrl(`https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${pageNumber + 1}`);
      }

      function handleSortMovies(criteria, parmaMovies = movies){

        const sortedMovies = [...parmaMovies].sort((a, b) => {

          if (criteria === 'title') {
            return a.title.localeCompare(b.title);
          } else if (criteria === 'date') {
            return new Date(a.release_date) - new Date(b.release_date);
          } else if (criteria === 'rating') {
            return b.vote_average - a.vote_average;
          }
          return 0;
        });
        setMovies(sortedMovies);
      }

      useEffect(function() {
        handleSortMovies(criteriaFromHeader)
      }, [criteriaFromHeader])

      return(
        <div className="sidebarFlex">
          <SideBar fave={isFave} watched={isWatched} movies={movies}/>
            <MovieList watchedMovies={addToWatched} favMovies={addToFave} data={movies} />
            <button onClick={loadMore}>Load more</button>
        </div>

      )
}

export default NowPlayingScreen;