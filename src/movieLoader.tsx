// src/utils/movieLoader.tsx

export async function loadMovies(sectionId: string, endpoint: string) {
    const container = document.getElementById(sectionId);
    if (!container) return;

    container.innerHTML = 'Loading...';

    try {
        let res = await fetch(endpoint);
        let movies = await res.json();

        // Retry once if response is empty
        if (!movies || movies.length === 0) {
            console.warn(`Retrying fetch for ${endpoint}`);
            res = await fetch(endpoint);
            movies = await res.json();
        }

        if (movies.length > 0) {
            container.innerHTML = renderMovies(movies);
        } else {
            container.innerHTML = "No movies found.";
        }
    } catch (err) {
        console.error("Failed to load movies:", err);
        container.innerHTML = "Error loading movies.";
    }
}

// Helper function to render movie cards (simple HTML-based)
function renderMovies(movies: any[]): string {
    return movies
        .map(movie => {
            const posterUrl = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/150x225?text=No+Image';

            return `
                <div class="movie-card">
                    <img src="${posterUrl}" alt="${movie.title}" />
                    <p>${movie.title}</p>
                </div>
            `;
        })
        .join('');
}
