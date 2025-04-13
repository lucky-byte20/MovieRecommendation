using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace MovieAPI.Services
{
    public class TMDb_service
    {
        private readonly HttpClient _http;
        private readonly string _apiKey = "7b91ec4ac96604f0e358d308f56fe9f1";  

        public TMDb_service(HttpClient httpClient)
        {
            _http = httpClient;
        }

        public async Task<string> GetPosterUrlAsync(string movieTitle)
        {
            var url = $"https://api.themoviedb.org/3/search/movie?api_key={_apiKey}&query={Uri.EscapeDataString(movieTitle)}";
            var response = await _http.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            var results = doc.RootElement.GetProperty("results");

            if (results.GetArrayLength() == 0) return null;

            var posterPath = results[0].GetProperty("poster_path").GetString();
            return posterPath != null ? $"https://image.tmdb.org/t/p/w500{posterPath}" : null;
        }
    }
}
