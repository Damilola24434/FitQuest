// ExerciseDB API - Get exercises by body part
async function fetchExerciseData() {
    const exerciseDataElement = document.getElementById('exerciseData');
    exerciseDataElement.textContent = "Loading...";
    
    try {
        const response = await fetch('https://exercisedb.p.rapidapi.com/exercises/bodyPart/back?limit=5', {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '480c0881a1msh07bf2299ae269f6p1d18d7jsneb51a62ea6d', // Replace with your key
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        
        const data = await response.json();
        exerciseDataElement.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        exerciseDataElement.textContent = `Error: ${error.message}`;
    }
}

// YouTube Search API - Get workout videos
async function fetchYouTubeVideos() {
    const youtubeDataElement = document.getElementById('youtubeData');
    youtubeDataElement.textContent = "Loading...";
    
    try {
        const response = await fetch('https://youtube-search-and-download.p.rapidapi.com/search?query=workout', {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'YOUR_YOUTUBE_API_KEY', // Replace with your key
                'X-RapidAPI-Host': 'youtube-search-and-download.p.rapidapi.com'
            }
        });
        
        const data = await response.json();
        youtubeDataElement.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        youtubeDataElement.textContent = `Error: ${error.message}`;
    }
}