using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MovieAPI.Models
{
    public class WishlistItem
    {
        [Key]
        public int WishlistItemId { get; set; }

        [Required]
        public string UserId { get; set; } 

        [Required]
        [ForeignKey("Movie")]
        public string MovieId { get; set; }

        public DateTime AddedDate { get; set; } = DateTime.UtcNow;

        public Movie Movie { get; set; }
    }
}