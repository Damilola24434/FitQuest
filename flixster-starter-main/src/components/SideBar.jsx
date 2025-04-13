/* eslint-disable react/prop-types */
import "./sideBar.css";
import FavMovies from "./FavMovies";
import { useEffect, useState } from "react";

function SideBar(props) {
    const [favMovieElements, setFavMovieElements] = useState([]);
    const [watchedMovieElements, setWatchedMovieElements] = useState([]);

    async function getMovie(movieId) {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYWU5YTZiOThlMTBjZDkyZTcxN2Y4OWIzZDYxYjdjNSIsInN1YiI6IjY2NjY1MTQ1Y2M3MDc0ZDliNjFjMWM2ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.IDf1-04fWbMoc-zzed3BAcZLflL14UG-mdjcZobVjxA'
            }
        };

        let response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}`, options)
        response = response.json();
        return response;
    }

    async function MovieCard(movieId) {


        const movieIndex = props.movies.findIndex((item) => item.id === movieId)
        let movie;
        if (movieIndex == -1) {
            movie = await getMovie(movieId);
        } else {
            movie = props.movies[movieIndex]
        }

        return movie;
    }


    useEffect(() => {
        Promise.all(props.fave.map((id) => (MovieCard(id)))).then((values) => {
            setFavMovieElements(values)
        });
        Promise.all(props.watched.map((id) => (MovieCard(id)))).then((values) => {
            setWatchedMovieElements(values)
        });


    }, [props.watched, props.fave])

    return (
        <div className="sidebar">
            <h2>Favorites</h2>
            {favMovieElements.map((movie, index) => {
                return (<FavMovies key={index} title={movie.original_title} image={movie.poster_path} />)
            })}
            <h2>Watched</h2>
            {watchedMovieElements.map((movie, index) => {
                return (<FavMovies key={index} title={movie.original_title} image={movie.poster_path} />)
            })}

        </div>
    );
};

export default SideBar;