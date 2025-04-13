const API_BASE_URL = 'https://localhost:7105/api/movies';

// DOM elements
const movieCard = document.getElementById('movie-card');
const posterEl = document.getElementById('poster');
const titleEl = document.getElementById('title');
const yearEl = document.getElementById('year');
const genreEl = document.getElementById('genre');
const ratingEl = document.getElementById('rating');
const likeBtn = document.getElementById('like-btn');
const skipBtn = document.getElementById('skip-btn');
const loadingSpinner = document.getElementById('loading-spinner');

// Current movie
let currentMovie = null;

// Touch handling variables
let startX = 0;
let currentX = 0;
let isSwiping = false;

// DOM elements (as before)

// Current movie (as before)

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchRandomMovie('en', 6); // Call fetchRandomMovie with default filters
    setupEventListeners();
});

// Set up event listeners (as before)

// Fetch a random movie with optional language and rating filters
async function fetchRandomMovie(language = 'en', minRating = 6) {
    try {
        showLoading(true);

        let url = `${API_BASE_URL}/random`;
        const queryParams = [];

        if (language) {
            queryParams.push(`language=${language}`);
        }
        if (minRating !== null && !isNaN(minRating)) {
            queryParams.push(`minRating=${minRating}`);
        }

        if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch random movie: ${response.status}`);
        }

        currentMovie = await response.json();
        displayMovie(currentMovie);
    } catch (error) {
        console.error('Error fetching random movie:', error);
        titleEl.textContent = 'Error loading movie. Try again.';
    } finally {
        showLoading(false);
    }
}

// Set up event listeners
function setupEventListeners() {
    likeBtn.addEventListener('click', () => {
        swipeRight();
    });

    skipBtn.addEventListener('click', () => {
        swipeLeft();
    });

    movieCard.addEventListener('touchstart', handleTouchStart);
    movieCard.addEventListener('touchmove', handleTouchMove);
    movieCard.addEventListener('touchend', handleTouchEnd);

    movieCard.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}


// Display movie data on the card
function displayMovie(movie) {
    posterEl.src = movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster';
    titleEl.textContent = movie.title;
    yearEl.textContent = movie.year ? `Year: ${movie.year}` : '';
    genreEl.textContent = movie.genres ? `Genres: ${movie.genres}` : '';
    ratingEl.textContent = movie.rating ? `Rating: ${movie.rating}` : '';

    movieCard.style.opacity = '1';
}

// Like the current movie and save to watchlist
async function likeMovie() {
    if (!currentMovie) return;

    try {
        const response = await fetch(`${API_BASE_URL}/like/${currentMovie.id}`, { // Using 'id' as confirmed
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to like movie');
        }

        const data = await response.json();
        console.log(data.message); // Optional: Log success message
        // Backend handles adding to watchlist, no need for local storage here
    } catch (error) {
        console.error('Error liking movie:', error);
    }
}

// Swipe right animation (like)
function swipeRight() {
    movieCard.classList.add('swiping-right');
    likeMovie();

    setTimeout(() => {
        movieCard.classList.remove('swiping-right');
        fetchRandomMovie();
    }, 300);
}

// Swipe left animation (skip)
function swipeLeft() {
    movieCard.classList.add('swiping-left');

    setTimeout(() => {
        movieCard.classList.remove('swiping-left');
        fetchRandomMovie();
    }, 300);
}

// Touch event handlers
function handleTouchStart(e) {
    startX = e.touches[0].clientX;
    isSwiping = true;
}

function handleTouchMove(e) {
    if (!isSwiping) return;

    currentX = e.touches[0].clientX;
    const diffX = currentX - startX;

    const rotation = Math.min(Math.max(diffX / 10, -45), 45);

    movieCard.style.transform = `translateX(${diffX}px) rotate(${rotation / 10}deg)`;

    if (diffX > 0) {
        likeBtn.style.opacity = Math.min(diffX / 100, 1);
        skipBtn.style.opacity = 0.5;
    } else {
        skipBtn.style.opacity = Math.min(Math.abs(diffX) / 100, 1);
        likeBtn.style.opacity = 0.5;
    }
}

function handleTouchEnd() {
    if (!isSwiping) return;

    const diffX = currentX - startX;

    likeBtn.style.opacity = 1;
    skipBtn.style.opacity = 1;

    if (diffX > 100) {
        swipeRight();
    } else if (diffX < -100) {
        swipeLeft();
    } else {
        movieCard.style.transform = '';
    }

    isSwiping = false;
}

// Mouse event handlers
function handleMouseDown(e) {
    startX = e.clientX;
    isSwiping = true;
}

function handleMouseMove(e) {
    if (!isSwiping) return;

    currentX = e.clientX;
    const diffX = currentX - startX;

    const rotation = Math.min(Math.max(diffX / 10, -45), 45);

    movieCard.style.transform = `translateX(${diffX}px) rotate(${rotation / 10}deg)`;

    if (diffX > 0) {
        likeBtn.style.opacity = Math.min(diffX / 100, 1);
        skipBtn.style.opacity = 0.5;
    } else {
        skipBtn.style.opacity = Math.min(Math.abs(diffX) / 100, 1);
        likeBtn.style.opacity = 0.5;
    }
}

function handleMouseUp() {
    if (!isSwiping) return;

    const diffX = currentX - startX;

    likeBtn.style.opacity = 1;
    skipBtn.style.opacity = 1;

    if (diffX > 100) {
        swipeRight();
    } else if (diffX < -100) {
        swipeLeft();
    } else {
        movieCard.style.transform = '';
    }

    isSwiping = false;
}

function getDefaultLanguagePreference() {
    // Example: return 'en'; // Default to English
    return ''; // Default to no language filter
}

function getDefaultRatingPreference() {
    // Example: return 7; // Default to minimum rating of 7
    return null; // Default to no minimum rating filter
}

// You will also need to call fetchRandomMovie() again whenever the user changes the filters
const languageFilter = document.getElementById('language-filter');
if (languageFilter) {
    languageFilter.addEventListener('change', () => {
        const selectedLanguage = languageFilter.value;
        const currentRating = getDefaultRatingPreference(); // Or get current rating filter value
        fetchRandomMovie(selectedLanguage, currentRating);
    });
}

const ratingFilter = document.getElementById('rating-filter');
if (ratingFilter) {
    ratingFilter.addEventListener('change', () => {
        const currentLanguage = getDefaultLanguagePreference(); // Or get current language filter value
        const selectedRating = parseFloat(ratingFilter.value);
        fetchRandomMovie(currentLanguage, selectedRating);
    });
}

// Show/hide loading spinner
function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? 'block' : 'none';
    posterEl.style.opacity = isLoading ? '0.3' : '1';
}
