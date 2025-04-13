import { useState, useEffect } from 'react'
import './App.css'
import Header from "./components/Header";
import.meta.env.VITE_API_KEY;
import NowPlayingScreen from './components/NowPlayingScreen';
import SearchScreen from './components/SearchScreen.jsx';
import Footer from './components/Footer.jsx';

const App = () => {
  const [isSearching, setSearching] = useState(false);
  const [criteria, setCriteria] = useState("");

  const [isFave, setFave] = useState([]);
  const [isWatched, setWatched] = useState([]);

  function loadFromLocalStorage() {
    let savedLists = localStorage.getItem("userLists");
    if (savedLists == undefined || savedLists == null ||savedLists == "") {
      return;
    }
    let ListsObject = JSON.parse(savedLists);
    setFave(ListsObject.favList);
    setWatched(ListsObject.watchedList);
  }

  /**
   * If the watchlist are now empty, check for stored (usually after a page load)
   * else: put the current state into localstorage
   */
  useEffect(() => {
    if (isWatched.length == 0 && isFave.length == 0) {
      loadFromLocalStorage()
    } else {
      localStorage.setItem("userLists", JSON.stringify(
        {
          favList: isFave,
          watchedList: isWatched
        }
      ))
    }
  }, [isFave, isWatched])

  const handleNewCriteria = (criteriaFromHeader) => {
    setCriteria(criteriaFromHeader)
  }

  const handleSetFav = (newVal) => {
    setFave(newVal);
  }

  const handleSetWatched = (newVal) => {
    setWatched(newVal);
  }

  return (
    <div className="App">
      <Header sortMovies={handleNewCriteria} setSearching={setSearching} />
      {!isSearching ?
        <NowPlayingScreen criteriaFromHeader={criteria} isFave={isFave} setFave={handleSetFav} isWatched={isWatched} setWatched={handleSetWatched}/>
        :
        <SearchScreen isFave={isFave} setFave={handleSetFav} isWatched={isWatched} setWatched={handleSetWatched}/>
      }
      <Footer />
    </div>
  );
}

export default App;
