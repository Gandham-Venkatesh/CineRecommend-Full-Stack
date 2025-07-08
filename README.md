# CineRecommend - A Movie Recommendation System

> **Created & Developed by:** [Venkatesh Gandham](https://www.linkedin.com/in/venkateshgandham/)

CineRecommend is a modern, feature-rich web application designed to help users discover movies and get personalized recommendations. It features a sleek interface, user authentication, and a hybrid recommendation engine that combines content-based and collaborative filtering techniques.

## ✨ Features

* **User Authentication**: Secure signup and login functionality using JWT for session management.
* **Dynamic Movie Discovery**: Browse movies across various categories like Popular, Top Rated, and Trending.
* **Powerful Search**: Instantly find movies by title.
* **Comprehensive Movie Details**: Get complete information about any movie, including its overview, cast, genres, runtime, ratings, and trailers.
* **"Where to Watch"**: Integrated TMDB provider information to see where a movie is available for streaming, renting, or buying.
* **Personalized Recommendations**: A hybrid engine that suggests movies based on a user's viewing history and similarity to other users' tastes.
* **User Profile Management**:
    * **Favorites**: Keep a list of your favorite movies.
    * **Watch History**: Automatically tracks every movie a user views.

---

## 🛠️ Tech Stack

### Frontend

* **Framework**: React (with Vite)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Routing**: React Router
* **API Communication**: Axios

### Backend

* **Framework**: Flask (Python)
* **Database**: SQLite
* **Authentication**: JWT (JSON Web Tokens)
* **APIs**: The Movie Database (TMDB) API for movie data.
* **Recommendation Engine**: `scikit-learn` for TF-IDF and Cosine Similarity.

---

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or later recommended)
* [Python](https://www.python.org/downloads/) (v3.9 or later recommended)
* `pip` and `venv` for Python package management

### ⚙️ Backend Setup

1.  **Clone the Repository**
    ```bash
    git clone <your-repository-url>
    cd <your-project-folder>
    ```

2.  **Navigate to the Backend Directory**
    ```bash
    cd backend
    ```

3.  **Create a Python Virtual Environment**
    ```bash
    python -m venv venv
    ```

4.  **Activate the Virtual Environment**
    * On Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    * On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```

5.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

6.  **Set Up Environment Variables**
    * Create a new file named `.env` in the `backend` directory.
    * Get a free API key from [The Movie Database (TMDB)](https://www.themoviedb.org/signup).
    * Add your TMDB API key to the `.env` file:
        ```env
        TMDB_API_KEY=your_actual_tmdb_api_key_here
        ```

7.  **Database Initialization**
    * The backend is configured to use SQLite. The first time you run the application, it will look for a `schema.sql` file to create the `database.db` file and all necessary tables (`users`, `watch_history`, `favorites`).
    * Ensure the `schema.sql` file is present in the `backend` directory.

8.  **Run the Backend Server**
    ```bash
    python app.py
    ```
    The Flask server will start running on `http://localhost:5000`.

---

### 🌐 Frontend Setup

1.  **Navigate to the Frontend Directory**
    * Open a new terminal and go to the `frontend` directory from the root project folder.
    ```bash
    cd ../frontend
    ```
    *(If you are already in the `backend` folder)*

2.  **Install NPM Dependencies**
    ```bash
    npm install
    ```

3.  **Run the Frontend Development Server**
    ```bash
    npm run dev
    ```
    The React application will start, and you can view it in your browser at `http://localhost:5173`.

---

## 📝 API Endpoints

The backend provides several API endpoints under the `/api/` prefix. Here are some of the key ones:

* **Authentication**
    * `POST /api/auth/signup`: Create a new user.
    * `POST /api/auth/login`: Log in a user and get a JWT.
* **Movies (TMDB Proxy)**
    * `GET /api/movies/popular`: Get popular movies.
    * `GET /api/movies/top_rated`: Get top-rated movies.
    * `GET /api/movies/<movie_id>`: Get details for a specific movie.
* **User Actions**
    * `GET /api/user/favorites`: Get the user's favorite movies.
    * `POST /api/user/favorites/toggle`: Add/remove a movie from favorites.
    * `GET /api/user/history`: Get the user's watch history.
    * `POST /api/user/history/add`: Add a movie to the watch history.

---

## 🙏 Acknowledgements

* This project uses movie data from [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api).