import MovieCards from "./MovieCards"
import "./movieCards.css"

function MovieList(props){
    function createCards(card, index){
        return(
            <MovieCards 
                key={index}
                title={card.title}
                img={"https://image.tmdb.org/t/p/w500"+card.poster_path}
                rating={card.vote_average}
                overview= {card.overview}
                originalTitle= {card.original_title}
                releaseDate ={card.release_date}
                id={card.id}
                favoriteMovies={() => props.favMovies(card.id)}
                watchedMovies={() =>props.watchedMovies(card.id)}
            />
        )
    }

    return(
        <div className="movieList">
         {props.data.map(createCards)}     
        </div>
    )
}

export default MovieList;
