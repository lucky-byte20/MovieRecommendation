console.log("JavaScript file loaded successfully!");

// API endpoint
const API_BASE_URL = 'https://localhost:7105/api/movies';

document.addEventListener("DOMContentLoaded", function () {
    // Populate Year Dropdown
    const yearSelect = document.getElementById("year");
    const currentYear = new Date().getFullYear();

    let defaultOption=document.createElement("option");
    defaultOption.value="";
    defaultOption.textContent="No selection";
    defaultOption.selected = true;
    yearSelect.appendChild(defaultOption);

    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Fetch movie recommendations based on user input
    document.getElementById("genre").addEventListener("change", fetchMovies);
    document.getElementById("country").addEventListener("change", fetchMovies);
    document.getElementById("year").addEventListener("change", fetchMovies);

    function fetchMovies() {
        const genre = document.getElementById("genre").value;
        const country = document.getElementById("country").value;
        const year = document.getElementById("year").value;

        if (genre === "Select Genre ▼" || country === "Select Countries ▼" || year === "") {
            return; // Do nothing if selection is incomplete
        }

        console.log(`Fetching movies for Genre: ${genre}, Country: ${country}, Year: ${year}`);

        // Construct the API endpoint URL with parameters
        const apiUrl = `${API_BASE_URL}/recommendations?genre=${genre}&country=${country}&year=${year}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Movie recommendations received:", data);
                displayRecommendations(data);
            })
            .catch(error => {
                console.error("Error fetching movie recommendations:", error);
                const recommendationsContainer = document.getElementById("recommendations");
                if (recommendationsContainer) {
                    recommendationsContainer.textContent = "Error fetching recommendations.";
                }
            });
    }

    function displayRecommendations(movies) {
        const recommendationsContainer = document.getElementById("recommendations");
        if (recommendationsContainer) {
            recommendationsContainer.innerHTML = ''; // Clear previous results
            if (movies && movies.length > 0) {
                movies.forEach(movie => {
                    const movieDiv = document.createElement('div');
                    movieDiv.classList.add('movie-recommendation'); // Add a class for styling
                    movieDiv.innerHTML = `
                        <h3>${movie.title}</h3>
                        <img src="${movie.posterUrl || 'https://via.placeholder.com/150x225?text=No+Poster'}" alt="${movie.title} Poster" width="150">
                        <p>Genre: ${movie.genre}</p>
                        <p>Country: ${movie.country}</p>
                        <p>Year: ${movie.year}</p>
                        // Add more details as needed
                    `;
                    recommendationsContainer.appendChild(movieDiv);
                });
            } else {
                recommendationsContainer.textContent = "No movies found matching your criteria.";
            }
        } else {
            console.warn("Recommendations container element not found in HTML.");
        }
    }

    // Slider Effect (remains unchanged for now, assuming static images)
    let slider = document.querySelector(".slider");
    let items = document.querySelectorAll(".slider .item");
    let totalItems = items.length;
    let currentIndex = 0;

    function moveSlider() {
        currentIndex = (currentIndex + 1) % totalItems;
        let angle = (360 / totalItems) * currentIndex;
        slider.style.transform = `perspective(1000px) rotateY(-${angle}deg)`;
    }

    setInterval(moveSlider, 3000); // Auto-slide every 3 seconds
});