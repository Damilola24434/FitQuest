import "./ModalContainer.css";
import {useEffect, useState} from "react";

function ModalContainer(props){
    const[trailerUrl, setTrailerUrl]= useState("")
    const apiKey = import.meta.env.VITE_API_KEY;

    useEffect(()=> {
        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYWU5YTZiOThlMTBjZDkyZTcxN2Y4OWIzZDYxYjdjNSIsInN1YiI6IjY2NjY1MTQ1Y2M3MDc0ZDliNjFjMWM2ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.IDf1-04fWbMoc-zzed3BAcZLflL14UG-mdjcZobVjxA'
            }
          };
          
          fetch(`https://api.themoviedb.org/3/movie/${props.data.id}/videos?api_key=${apiKey}`, options)
            .then(response => response.json())
            .then(response => response.results.find(
                          (video) => video.site === "YouTube" && video.type === "Trailer"
                        ))
                        .then((trailer) => setTrailerUrl(`https://www.youtube.com/embed/${trailer.key}`))
            .catch(err => console.error(err));
    }, [props.data.id, apiKey])
    

    return(
        <div className="modalOverlay">
            <div className="modalContent">
                <button className="closeButton" onClick={props.close} >
                    &times;
                </button>
                <div className="modalBody">
                    <div>Title:{props.data.title}</div>
                    <img src= {props.data.img} width="300" height="300"/>
                    <div>Original Title: {props.data.title} </div>
                    <div> Overview: {props.data.overview}</div>
                    <div>Release Date: {props.data.releaseDate}</div>
                </div>
            
                <iframe
                src={trailerUrl} 
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Movie Trailer"
                className="modal-movie-trailer" 
                ></iframe>
            </div>
      </div>
    );
}

export default ModalContainer;