const API_BASE_URL = 'https://localhost:7105/api/movies';


const watchlistGrid = document.getElementById('watchlist-grid');
const loadingSpinner = document.getElementById('loading-spinner');


document.addEventListener('DOMContentLoaded', () => {
    loadWatchlistFromBackend();
});


async function loadWatchlistFromBackend() {
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/wishlist`);
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            watchlistGrid.innerHTML = '<p class="error-message">Failed to load watchlist.</p>';
        } else {
            const data = await response.json();
            showLoading(false);
            if (data && data.wishlist) { 
                displayBackendWatchlist(data.wishlist);
            } else {
                watchlistGrid.innerHTML = '<p class="error-message">Invalid data format received.</p>';
            }
        }
    } catch (error) {
        console.error('Error fetching watchlist from backend:', error);
        watchlistGrid.innerHTML = '<p class="error-message">Failed to load watchlist.</p>';
        showLoading(false);
    }
}

function displayBackendWatchlist(watchlist) {
    watchlistGrid.innerHTML = ''; 

    if (watchlist && watchlist.length > 0) {
        watchlist.forEach(movie => {
            const movieCard = createBackendMovieCard(movie);
            watchlistGrid.appendChild(movieCard);
        });
    } else {
        watchlistGrid.innerHTML = '<p class="empty-message">Your watchlist is empty.</p>';
    }
}

function createBackendMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'watchlist-item';
    card.dataset.id = movie.id;

    const poster = movie.posterUrl || 'https://via.placeholder.com/200x300?text=No+Poster';

    card.innerHTML = `
        <img src="${poster}" alt="${movie.title}">
        <div class="watchlist-info">
            <h3>${movie.title}</h3>
            ${movie.year ? `<p>Year: ${movie.year}</p>` : ''}
            ${movie.rating ? `<p>Rating: ${movie.rating}</p>` : ''}
        </div>
        <button class="remove-btn" onclick="removeFromBackendWatchlist('${movie.id}')">Remove</button>
    `;

    return card;
}

async function removeFromBackendWatchlist(movieId) {
    console.log("Attempting to delete movieId:", movieId);
    const apiUrl = `${API_BASE_URL}/wishlist/${movieId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE',
        });

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
        } else {
            const movieElement = document.querySelector(`.watchlist-item[data-id="${movieId}"]`);
            if (movieElement) {
                movieElement.style.transform = 'scale(0)';
                movieElement.style.opacity = '0';
                setTimeout(() => {
                    movieElement.remove();
                    const remainingItems = document.querySelectorAll('.watchlist-item');
                    if (remainingItems.length === 0) {
                        watchlistGrid.innerHTML = '<p class="empty-message">Your watchlist is empty.</p>';
                    }
                }, 300);
            }
        }
    } catch (error) {
        console.error('Error removing from backend watchlist:', error);
    }
}

function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? 'block' : 'none';
}