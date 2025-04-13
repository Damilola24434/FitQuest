function FavMovies(props){
    return(
        <div>
            <img src= {"https://image.tmdb.org/t/p/w500"+props.image} width="100" height="100"></img>
            <p>{props.title}</p>
        </div>       
    )
}

export default FavMovies