/* eslint-disable react/prop-types */
import { useState} from "react";
import MovieList from "./MovieList";
import SideBar from "./SideBar";

function SearchScreen({setFave, isFave, setWatched, isWatched}){
    const[query, setSearchQuery]= useState('')
    const[movies, setMovies]= useState([]);
    const[pageNumber, setPageNumber]= useState(1)
    

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

    

    const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN;

    function handleSearch(searchQuery){
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`
        }
      };
      
      fetch(`https://api.themoviedb.org/3/search/movie?query=${searchQuery}&include_adult=false&language=en-US&page=${pageNumber}`, options)
        .then(response => response.json())
        .then(response => setMovies(response.results))
        .catch(err => console.error(err));
    }

    function loadMore(){
      setPageNumber(prevPageNumber => prevPageNumber+1)    
    }

    return(
      <div className="searchBar">
        <SideBar fave={isFave} watched={isWatched} movies={movies}/>
        <input
          type="text"
          placeholder="Search for movies..."
          value={query}
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        />
        <button onClick={() => handleSearch(query)}>Search</button>
        
        <MovieList watchedMovies={addToWatched} favMovies={addToFave} data={movies} />
        <button onClick={loadMore}>Load more</button>
    </div>
    )
}

export default SearchScreen;