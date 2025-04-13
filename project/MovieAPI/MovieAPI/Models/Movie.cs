using System.ComponentModel.DataAnnotations.Schema;

namespace MovieAPI.Models
{
    [Table("movies")]
    public class Movie
    {
        [Column("tconst")]
        public string Id { get; set; } = string.Empty;

        [Column("primarytitle")]
        public string Title { get; set; } = string.Empty;

        [Column("language")]
        public string Language { get; set; } = string.Empty;

        [Column("averagerating")]
        public double? Rating { get; set; }

        [NotMapped]
        public string PosterUrl { get; set; } = string.Empty;

    }
}
