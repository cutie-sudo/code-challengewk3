document.addEventListener("DOMContentLoaded", () => {
  class MovieApp {
    constructor() {
      this.buyButton = document.getElementById("buy-ticket");
      this.filmList = document.getElementById("films");
      this.init();
    }

    async init() {
      // Fetch and display the first movie details on initialization
      await this.fetchFirstMovieDetails();
      // Optionally, fetch all films for a menu or list
      await this.fetchAllFilms();
    }

    async fetchFirstMovieDetails() {
      try {
        const response = await fetch("http://localhost:3000/films");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        this.displayMovieDetails(data[0]); // Display the first movie from the array
      } catch (error) {
        console.error("Error fetching movie details:", error);
        document.getElementById("error-message").textContent = "Failed to load movie details.";
      }
    }

    displayMovieDetails(movie) {
      const availableTickets = movie.capacity - movie.tickets_sold;

      // Update DOM elements with movie data
      document.getElementById("poster").src = movie.poster;
      document.getElementById("title").textContent = movie.title;
      document.getElementById("runtime").textContent = `${movie.runtime} minutes`;
      document.getElementById("film-info").textContent = movie.description;
      document.getElementById("showtime").textContent = movie.showtime;
      document.getElementById("ticket-num").textContent = `${availableTickets} tickets available`;

      // Handle ticket purchase logic
      this.handleTicketPurchase(movie);
    }

    async handleTicketPurchase(movie) {
      this.buyButton.onclick = async () => {
        let availableTickets = movie.capacity - movie.tickets_sold;

        if (availableTickets > 0) {
          movie.tickets_sold += 1; // Increase tickets sold
          availableTickets -= 1;

          // Update DOM for available tickets
          document.getElementById("ticket-num").textContent = `${availableTickets} tickets available`;

          // Update tickets sold count on the server
          await this.updateTicketsSold(movie);
          // Optionally, post a new ticket entry
          await this.postNewTicket(movie.id);
        } else {
          this.buyButton.textContent = "Sold Out"; // Disable further purchases
        }
      };
    }

    async updateTicketsSold(movie) {
      await fetch(`http://localhost:3000/films/${movie.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets_sold: movie.tickets_sold }),
      });
    }

    async postNewTicket(filmId) {
      await fetch("http://localhost:3000/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ film_id: filmId, number_of_tickets: 1 }),
      });
    }

    async fetchAllFilms() {
      try {
        const response = await fetch("http://localhost:3000/films");
        const films = await response.json();
        films.forEach(film => this.createFilmItem(film));
      } catch (error) {
        console.error("Error fetching films:", error);
      }
    }

    createFilmItem(film) {
      const filmItem = document.createElement("li");
      filmItem.textContent = film.title;
      filmItem.classList.add("film", "item");
      filmItem.onclick = () => this.fetchMovieDetails(film.id);
      this.filmList.appendChild(filmItem);
      this.addDeleteButton(filmItem, film);
    }

    async fetchMovieDetails(filmId) {
      try {
        const response = await fetch(`http://localhost:3000/films/${filmId}`);
        const selectedFilm = await response.json();
        this.displayMovieDetails(selectedFilm);
      } catch (error) {
        console.error("Error fetching film details:", error);
      }
    }

    addDeleteButton(filmItem, film) {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      filmItem.appendChild(deleteButton);

      deleteButton.onclick = async (event) => {
        event.stopPropagation(); // Prevent triggering the film item click
        try {
          await fetch(`http://localhost:3000/films/${film.id}`, { method: "DELETE" });
          filmItem.remove();
          console.log(`Deleted film: ${film.title}`);
        } catch (error) {
          console.error("Error deleting film:", error);
        }
      };
    }
  }

  // Initialize the movie app
  new MovieApp();
});
