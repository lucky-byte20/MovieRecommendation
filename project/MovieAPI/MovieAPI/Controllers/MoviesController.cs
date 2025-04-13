using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MovieAPI.Data;
using MovieAPI.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using MovieAPI.Services;

namespace MovieAPI.Controllers
{
    [Route("api/Movies")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TMDb_service _tmdbService;
        public MoviesController(ApplicationDbContext context, TMDb_service tmdbService)
        {
            _context = context;
            _tmdbService = tmdbService;
        }

        // Check if the database is connected
        [HttpGet("test-connection")]
        public IActionResult TestDatabaseConnection()
        {
            return Ok(_context.Database.CanConnect() ? "✅ Database is connected!" : "❌ Database connection failed!");
        }

        // Get a random movie
        // Get a random movie with optional language and rating filters
        [HttpGet("random")]
        public async Task<IActionResult> GetRandomMovie([FromQuery] string language, [FromQuery] double? minRating)
        {
            Console.WriteLine($"Backend received request for random movie with language: '{language}', minRating: {minRating}");
            IQueryable<Movie> query = _context.Movies;

            if (!string.IsNullOrEmpty(language))
            {
                query = query.Where(m => m.Language == language);
            }

            if (minRating.HasValue)
            {
                query = query.Where(m => m.Rating >= minRating.Value);
            }

            var movie = await query.OrderBy(x => Guid.NewGuid()).FirstOrDefaultAsync();

            if (movie == null)
            {
                return NotFound("No movies found matching the criteria.");
            }

            try
            {
                movie.PosterUrl = await _tmdbService.GetPosterUrlAsync(movie.Title);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching poster: {ex.Message}");
                movie.PosterUrl = null;
            }

            return Ok(movie);
        }



        // Like a movie (save to wlist)
        [HttpPost("like/{id}")]
        public async Task<IActionResult> LikeMovie(string id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound("Movie not found.");

            // 1. Get the current user's ID
            var userId = GetCurrentUserId();

            // 2. Check if the movie is already in the user's wishlist
            var existingWishlistItem = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == id);

            if (existingWishlistItem != null)
            {
                return Ok(new { message = "Movie is already in your wishlist", movie });
            }

            // 3. Create a new WishlistItem
            var wishlistItem = new WishlistItem { UserId = userId, MovieId = id, AddedDate = DateTime.UtcNow };
            _context.WishlistItems.Add(wishlistItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Movie added to wishlist", movie });
        }

        // Filter out movies
        [HttpGet("discover")]
        public async Task<IActionResult> DiscoverMovies()
        {
            var movies = await _context.Movies
                .Where(m => m.Language == "en" && m.Rating >= 7)
                .ToListAsync();

            return Ok(movies);
        }

        // Retrieve wishlist
        [HttpGet("wishlist")]
        public async Task<IActionResult> GetWishlist()
        {
            // 1. Get the current user's ID 
            var userId = GetCurrentUserId();

            // 2. Retrieve watchlist items for the user
            var wishlistItems = await _context.WishlistItems
                .Where(w => w.UserId == userId)
                .Include(w => w.Movie)
                .ToListAsync();

            // 3. Extract the Movie objects from the wishlist items
            var wishlistMovies = wishlistItems.Select(item => item.Movie).ToList();

            // 4. Fetch posters for the wishlist movies
            foreach (var movie in wishlistMovies)
            {
                movie.PosterUrl = await _tmdbService.GetPosterUrlAsync(movie.Title);
            }

            return Ok(new { message = "Wishlist retrieved successfully", wishlist = wishlistMovies });
        }

        [HttpDelete("wishlist/{movieId}")]
        public async Task<IActionResult> RemoveFromWishlist(string movieId)
        {
            var userId = GetCurrentUserId();
            var watchlistItem = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieId == movieId);

            if (watchlistItem == null)
            {
                return NotFound();
            }

            _context.WishlistItems.Remove(watchlistItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private string GetCurrentUserId()
        { 
            return "dummy-user-id";
        }
    }
}