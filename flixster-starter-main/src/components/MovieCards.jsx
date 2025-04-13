import "./movieCards.css"
import { useState } from "react";
import ModalContainer from "./ModalContainer";
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>

function MovieCard (props) {
    const[isModalOpen, setModal]=useState(false)
    const[isFav, setIsFave] = useState(false);
    const[watched, setWatched]= useState(false)
    
    function openModal(){
        setModal(true)
    }
    function closeModal()
    {
        setModal(false)
    }

    return(
        <>
            <div className= "movieCard" onClick={openModal}>
                <img src={props.img} className="moviePoster" />
                <h2 className="movieTitle">{props.title}</h2>
                <p className="movieRating">Rating: {props.rating} </p>
                <div className="favoriteWatchedIcon">
                    <div className="favoriteIcon">
                        <button onClick={(e)=>{
                            e.stopPropagation();
                            setIsFave(!isFav);
                            props.favoriteMovies();
                        }}>{isFav ? '❤️':'🖤'}</button>
                    </div>
                    <div className='watched'>
                        <button  onClick={(e) =>{
                            e.stopPropagation();
                            setWatched(!watched);
                            props.watchedMovies();
                        }}>
                        Watched: {watched ? '☑️' : '🔘'}
                        </button>
                    </div>
            </div>
        </div>
            {isModalOpen ?  <ModalContainer data={props} close={closeModal}/>: null}
        </>
    );
}

export default MovieCard;