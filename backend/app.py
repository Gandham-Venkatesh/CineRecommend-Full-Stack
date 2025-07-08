from flask import Flask, request, jsonify, g
from utils import search_movie, get_popular_movies, get_top_rated_movies, get_trending_movies, get_new_releases, get_movies_by_genre
from flask_cors import CORS
import sqlite3
import os
import hashlib
import secrets
import jwt
import datetime
import requests
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from functools import wraps
import json
from dotenv import load_dotenv

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
print("TMDB API KEY:", TMDB_API_KEY)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this in production
app.config['TMDB_API_KEY'] = TMDB_API_KEY  # Use env value instead of hardcoding
app.config['DATABASE'] = 'database.db'
app.config['TMDB_BASE_URL'] = 'https://api.themoviedb.org/3'

# Database setup
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(app.config['DATABASE'])
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

# Create database if it doesn't exist
if not os.path.exists(app.config['DATABASE']):
    init_db()

# Authentication helpers
def hash_password(password):
    """Hash a password for storing."""
    salt = hashlib.sha256(os.urandom(60)).hexdigest()
    pwdhash = hashlib.pbkdf2_hmac('sha512', password.encode('utf-8'), 
                                  salt.encode('utf-8'), 100000)
    pwdhash = pwdhash.hex()
    return salt + pwdhash  # Return as a full hex string (safe for storage)

def verify_password(stored_password, provided_password):
    """Verify a stored password against one provided by user"""
    salt = stored_password[:64]
    stored_password = stored_password[64:]
    pwdhash = hashlib.pbkdf2_hmac('sha512', 
                                  provided_password.encode('utf-8'), 
                                  salt.encode('ascii'), 
                                  100000)
    pwdhash = pwdhash.hex()
    return pwdhash == stored_password

def generate_token(user_id):
    """Generate JWT token for authentication"""
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(
        payload,
        app.config.get('SECRET_KEY'),
        algorithm='HS256'
    )

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['sub']
            
            # Get user from database
            db = get_db()
            user = db.execute('SELECT * FROM users WHERE id = ?', (current_user_id,)).fetchone()
            
            if not user:
                return jsonify({'message': 'User not found!'}), 401
                
            # Add user to g object for use in route
            g.user = dict(user)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(*args, **kwargs)
    return decorated

# TMDB API helper
def tmdb_request(endpoint, params=None):
    """Make a request to TMDB API"""
    if params is None:
        params = {}
    
    params['api_key'] = app.config['TMDB_API_KEY']
    
    url = f"{app.config['TMDB_BASE_URL']}/{endpoint}"
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {'error': f"TMDB API error: {response.status_code}"}

# Recommendation system
class RecommendationEngine:
    def __init__(self):
        self.movies_data = {}
        self.content_vectors = None
        self.movie_ids = []
        
    def load_movies(self):
        """Load movies from TMDB popular/top-rated for initial recommendations"""
        if not self.movies_data:
            # Get popular movies
            popular = tmdb_request('movie/popular')
            top_rated = tmdb_request('movie/top_rated')
            
            movies = popular.get('results', []) + top_rated.get('results', [])
            
            # Remove duplicates
            unique_movies = {}
            for movie in movies:
                if movie['id'] not in unique_movies:
                    unique_movies[movie['id']] = movie
            
            self.movies_data = unique_movies
            self.movie_ids = list(unique_movies.keys())
            
            # Create content vectors
            self._create_content_vectors()
            
        return self.movies_data
    
    def _create_content_vectors(self):
        """Create TF-IDF vectors for content-based filtering"""
        texts = []
        self.movie_ids = []
        
        for movie_id, movie in self.movies_data.items():
            # Combine title, overview, and genres for content analysis
            genres = ' '.join([g['name'] for g in movie.get('genre_ids', [])])
            text = f"{movie['title']} {movie['overview']} {genres}"
            texts.append(text)
            self.movie_ids.append(movie_id)
        
        if texts:
            tfidf = TfidfVectorizer(stop_words='english')
            self.content_vectors = tfidf.fit_transform(texts)
    
    def get_movie_details(self, movie_id):
        """Get detailed movie information for recommendations"""
        return tmdb_request(f'movie/{movie_id}', {'append_to_response': 'credits'})
    
    def content_based_recommendations(self, movie_id):
        """Get content-based recommendations for a movie"""
        self.load_movies()
        
        # Get movie details if not in our data
        if movie_id not in self.movies_data:
            movie_details = self.get_movie_details(movie_id)
            if 'id' in movie_details:
                self.movies_data[movie_id] = movie_details
                self._create_content_vectors()
        
        # Find movie index
        if movie_id in self.movie_ids:
            idx = self.movie_ids.index(movie_id)
            
            # Calculate similarity
            movie_vector = self.content_vectors[idx:idx+1]
            sim_scores = cosine_similarity(movie_vector, self.content_vectors).flatten()
            
            # Get similar movie indices
            similar_indices = sim_scores.argsort()[:-11:-1]  # Top 10 similar movies
            
            # Remove the movie itself
            similar_indices = [i for i in similar_indices if self.movie_ids[i] != movie_id]
            
            # Get movie ids
            similar_movies = [self.movie_ids[i] for i in similar_indices]
            
            return similar_movies
        
        return []
    
    def collaborative_recommendations(self, user_id):
        """Get collaborative filtering recommendations based on user history"""
        db = get_db()
        
        # Get user's watch history and favorites
        history = db.execute('''
            SELECT movie_id FROM watch_history 
            WHERE user_id = ? 
            ORDER BY viewed_at DESC
        ''', (user_id,)).fetchall()
        
        favorites = db.execute('SELECT movie_id FROM favorites WHERE user_id = ?', 
                             (user_id,)).fetchall()
        
        # Extract movie IDs
        history_ids = [row['movie_id'] for row in history]
        favorite_ids = [row['movie_id'] for row in favorites]
        
        # Combine with weights (favorites count more)
        user_movies = history_ids + favorite_ids
        
        if not user_movies:
            return []
        
        # Simple collaborative approach:
        # 1. Get all users who watched/favorited these movies
        # 2. Find what other movies these users liked
        # 3. Recommend the most popular ones
        
        placeholders = ','.join(['?'] * len(user_movies))
        similar_users = db.execute(f'''
            SELECT DISTINCT user_id FROM (
                SELECT user_id FROM watch_history WHERE movie_id IN ({placeholders})
                UNION
                SELECT user_id FROM favorites WHERE movie_id IN ({placeholders})
            )
            WHERE user_id != ?
        ''', user_movies + user_movies + (user_id,)).fetchall()
        
        if not similar_users:
            return []
        
        similar_user_ids = [row['user_id'] for row in similar_users]
        users_placeholders = ','.join(['?'] * len(similar_user_ids))
        
        # Get movies that similar users liked but the current user hasn't seen
        recommendations = db.execute(f'''
            SELECT movie_id, COUNT(*) as count
            FROM (
                SELECT movie_id FROM watch_history 
                WHERE user_id IN ({users_placeholders})
                UNION ALL
                SELECT movie_id FROM favorites 
                WHERE user_id IN ({users_placeholders})
            )
            WHERE movie_id NOT IN ({placeholders})
            GROUP BY movie_id
            ORDER BY count DESC
            LIMIT 10
        ''', similar_user_ids + similar_user_ids + user_movies).fetchall()
        
        return [row['movie_id'] for row in recommendations]
    
    def hybrid_recommendations(self, user_id, movie_id=None):
        """Combine content-based and collaborative filtering"""
        # Get recommendations from both approaches
        collaborative_recs = self.collaborative_recommendations(user_id)
        
        if movie_id:
            # If movie_id provided, get content-based recs for that movie
            content_recs = self.content_based_recommendations(movie_id)
        else:
            # Otherwise, use user's recent history for content-based
            db = get_db()
            recent = db.execute('''
                SELECT movie_id FROM watch_history 
                WHERE user_id = ? 
                ORDER BY viewed_at DESC 
                LIMIT 1
            ''', (user_id,)).fetchone()
            
            if recent:
                content_recs = self.content_based_recommendations(recent['movie_id'])
            else:
                content_recs = []
        
        # Combine recommendations with weights
        # Content-based get higher weight for new users
        # Collaborative get higher weight for users with more history
        
        db = get_db()
        history_count = db.execute('''
            SELECT COUNT(*) as count FROM watch_history WHERE user_id = ?
        ''', (user_id,)).fetchone()['count']
        
        # Adjust weights based on history size
        if history_count > 10:
            content_weight = 0.4
            collab_weight = 0.6
        else:
            content_weight = 0.7
            collab_weight = 0.3
        
        # Combine and rank
        movie_scores = {}
        
        for movie in content_recs:
            movie_scores[movie] = content_weight
            
        for movie in collaborative_recs:
            if movie in movie_scores:
                movie_scores[movie] += collab_weight
            else:
                movie_scores[movie] = collab_weight
        
        # Sort by score and return top recommendations
        sorted_recs = sorted(movie_scores.items(), key=lambda x: x[1], reverse=True)
        return [movie_id for movie_id, _ in sorted_recs[:20]]
    
    def get_trending_recommendations(self):
        """Get trending movies for new users"""
        trending = tmdb_request('trending/movie/day')
        return [movie['id'] for movie in trending.get('results', [])]

# Initialize recommendation engine
recommendation_engine = RecommendationEngine()

# Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()

        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Missing required fields'}), 400

        db = get_db()

        # Check if email already exists
        existing_user = db.execute('SELECT * FROM users WHERE email = ?', 
                                   (data['email'],)).fetchone()
        if existing_user:
            return jsonify({'message': 'Email already registered'}), 400

        # Hash password
        hashed_password = hash_password(data['password'])

        # Create user
        db.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                   (data['username'], data['email'], hashed_password))
        db.commit()

        # Get created user
        user = db.execute('SELECT id, username, email FROM users WHERE email = ?',
                          (data['email'],)).fetchone()

        # Generate token
        token = generate_token(user['id'])

        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': dict(user)
        }), 201

    except Exception as e:
        print("Signup error:", e)  # This will log the exact error in the backend terminal
        return jsonify({'message': 'Failed to create account'}), 500
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password'}), 400
    
    db = get_db()
    
    # Find user
    user = db.execute('SELECT * FROM users WHERE email = ?', 
                    (data['email'],)).fetchone()
    
    if not user or not verify_password(user['password'], data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Generate token
    token = generate_token(user['id'])
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email']
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_user():
    return jsonify({
        'id': g.user['id'],
        'username': g.user['username'],
        'email': g.user['email']
    })

@app.route('/api/movies/popular')
def api_popular_movies():
    page = request.args.get('page', 1, type=int)
    movies = get_popular_movies(TMDB_API_KEY, page)
    return jsonify(movies)

@app.route('/api/movies/search')
def api_search_movies():
    query = request.args.get('query')
    if not query:
        return jsonify({'message': 'Query parameter is required'}), 400
    results = search_movie(query, TMDB_API_KEY)
    return jsonify(results)

@app.route('/api/movie/<int:movie_id>')
def api_movie_details(movie_id):
    movie = get_movie_details(movie_id, TMDB_API_KEY)
    return jsonify(movie)
# TMDB API proxy routes
@app.route('/api/movies/<path:endpoint>', methods=['GET'])
@token_required
def get_movies(endpoint):
    # Extract and pass query parameters
    params = request.args.to_dict()
    
    # Special handling for recommendations endpoint
    if endpoint == 'recommendations':
        user_id = g.user['id']
        movie_id = params.get('movie_id')
        
        if movie_id:
            movie_id = int(movie_id)
            recommendations = recommendation_engine.hybrid_recommendations(user_id, movie_id)
        else:
            # Check if user has watch history
            db = get_db()
            has_history = db.execute('SELECT 1 FROM watch_history WHERE user_id = ? LIMIT 1', 
                                   (user_id,)).fetchone()
            
            if has_history:
                recommendations = recommendation_engine.hybrid_recommendations(user_id)
            else:
                recommendations = recommendation_engine.get_trending_recommendations()
        
        # Get full movie details for recommendations
        results = []
        for movie_id in recommendations:
            movie = tmdb_request(f'movie/{movie_id}')
            if 'id' in movie:
                results.append(movie)
        
        return jsonify({'results': results})
    
    response = tmdb_request(endpoint, params)
    return jsonify(response)

@app.route('/api/movies/<int:movie_id>', methods=['GET'])
@token_required
def get_movie_details(movie_id):
    # Get movie details with credits
    response = tmdb_request(f'movie/{movie_id}', {'append_to_response': 'credits'})
    return jsonify(response)

@app.route('/api/movies/<int:movie_id>/videos', methods=['GET'])
@token_required
def get_movie_videos(movie_id):
    response = tmdb_request(f'movie/{movie_id}/videos')
    return jsonify(response)

@app.route('/api/movies/<int:movie_id>/watch/providers', methods=['GET'])
@token_required
def get_movie_providers(movie_id):
    response = tmdb_request(f'movie/{movie_id}/watch/providers')
    return jsonify(response)

# User favorites routes
@app.route('/api/user/favorites', methods=['GET'])
@token_required
def get_favorites():
    db = get_db()
    user_id = g.user['id']
    
    favorites = db.execute('''
        SELECT f.id, f.movie_id as movieId, f.title, f.poster_path as posterPath, 
               f.release_date as releaseDate, f.vote_average as voteAverage
        FROM favorites f
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    ''', (user_id,)).fetchall()
    
    return jsonify([dict(f) for f in favorites])

@app.route('/api/user/favorites/toggle', methods=['POST'])
@token_required
def toggle_favorite():
    data = request.get_json()
    
    if not data or 'movieId' not in data:
        return jsonify({'message': 'Movie ID is required'}), 400
    
    db = get_db()
    user_id = g.user['id']
    movie_id = data['movieId']
    
    # Check if movie is already in favorites
    existing = db.execute('SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?', 
                        (user_id, movie_id)).fetchone()
    
    if existing:
        # Remove from favorites
        db.execute('DELETE FROM favorites WHERE id = ?', (existing['id'],))
        db.commit()
        return jsonify({'message': 'Removed from favorites'})
    else:
        # Get movie details
        movie = tmdb_request(f'movie/{movie_id}')
        
        if 'id' not in movie:
            return jsonify({'message': 'Movie not found'}), 404
        
        # Add to favorites
        db.execute('''
            INSERT INTO favorites 
            (user_id, movie_id, title, poster_path, release_date, vote_average) 
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user_id, 
            movie_id, 
            movie['title'], 
            movie.get('poster_path', ''), 
            movie.get('release_date', ''), 
            movie.get('vote_average', 0)
        ))
        db.commit()
        
        return jsonify({'message': 'Added to favorites'})

# User watch history routes
@app.route('/api/user/history', methods=['GET'])
@token_required
def get_watch_history():
    db = get_db()
    user_id = g.user['id']
    
    history = db.execute('''
        SELECT h.id, h.movie_id as movieId, h.title, h.poster_path as posterPath, 
               h.viewed_at as viewedAt
        FROM watch_history h
        WHERE h.user_id = ?
        ORDER BY h.viewed_at DESC
    ''', (user_id,)).fetchall()
    
    return jsonify([dict(h) for h in history])

@app.route('/api/user/history/add', methods=['POST'])
@token_required
def add_to_watch_history():
    data = request.get_json()
    
    if not data or 'movieId' not in data:
        return jsonify({'message': 'Movie ID is required'}), 400
    
    db = get_db()
    user_id = g.user['id']
    movie_id = data['movieId']
    
    # Get movie details
    movie = tmdb_request(f'movie/{movie_id}')
    
    if 'id' not in movie:
        return jsonify({'message': 'Movie not found'}), 404
    
    # Check if movie is already in history
    existing = db.execute('''
        SELECT * FROM watch_history 
        WHERE user_id = ? AND movie_id = ? 
        ORDER BY viewed_at DESC LIMIT 1
    ''', (user_id, movie_id)).fetchone()
    
    # Only update if it's been more than 1 hour since last view
    if existing:
        last_viewed = datetime.datetime.fromisoformat(existing['viewed_at'])
        now = datetime.datetime.now()
        
        if (now - last_viewed).total_seconds() < 3600:  # 1 hour
            return jsonify({'message': 'Already in watch history'})
    
    # Add to watch history
    db.execute('''
        INSERT INTO watch_history 
        (user_id, movie_id, title, poster_path, viewed_at) 
        VALUES (?, ?, ?, ?, ?)
    ''', (
        user_id, 
        movie_id, 
        movie['title'], 
        movie.get('poster_path', ''), 
        datetime.datetime.now().isoformat()
    ))
    db.commit()
    
    return jsonify({'message': 'Added to watch history'})

@app.route('/api/user/history/<int:movie_id>', methods=['DELETE'])
@token_required
def remove_from_watch_history(movie_id):
    db = get_db()
    user_id = g.user['id']
    
    db.execute('DELETE FROM watch_history WHERE user_id = ? AND movie_id = ?', 
             (user_id, movie_id))
    db.commit()
    
    return jsonify({'message': 'Removed from watch history'})

@app.route('/api/user/history', methods=['DELETE'])
@token_required
def clear_watch_history():
    db = get_db()
    user_id = g.user['id']
    
    db.execute('DELETE FROM watch_history WHERE user_id = ?', (user_id,))
    db.commit()
    
    return jsonify({'message': 'Watch history cleared'})

@app.route("/api/trending")
def trending():
    movies = get_trending_movies(TMDB_API_KEY)
    return jsonify(movies)

@app.route("/api/popular")
def popular():
    movies = get_popular_movies(TMDB_API_KEY)
    return jsonify(movies)

@app.route("/api/top_rated")
def top_rated():
    movies = get_top_rated_movies(TMDB_API_KEY)
    return jsonify(movies)

@app.route("/api/new_releases")
def new_releases():
    movies = get_new_releases(TMDB_API_KEY)
    return jsonify(movies)

@app.route("/api/genre/<genre_name>")
def genre_movies(genre_name):
    genre_map = {
        "action": 28,
        "comedy": 35,
        # add more if needed
    }
    genre_id = genre_map.get(genre_name.lower())
    if genre_id:
        movies = get_movies_by_genre(genre_id, TMDB_API_KEY)
        return jsonify(movies)
    return jsonify([]), 404

# Run the app
if __name__ == '__main__':
    app.run(debug=True, port=5000)