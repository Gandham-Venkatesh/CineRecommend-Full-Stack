import requests
import time
BASE_URL = "https://api.themoviedb.org/3"


def fetch_with_retry(url, params, retries=2, delay=0.5):
    for _ in range(retries + 1):
        try:
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json().get("results", [])
                if data:
                    return data
        except Exception as e:
            print("Error:", e)
        time.sleep(delay)
    return []

# Example: trending
def get_trending_movies(api_key):
    url = "https://api.themoviedb.org/3/trending/movie/week"
    params = {'api_key': api_key}
    return fetch_with_retry(url, params)

# Do the same for other categories (top rated, new releases, etc.)


def search_movie(query, api_key):
    url = f"{BASE_URL}/search/movie"
    params = {'api_key': api_key, 'query': query, 'include_adult': False}
    response = requests.get(url, params=params)
    return response.json().get('results', []) if response.status_code == 200 else []

def get_popular_movies(api_key):
    url = f"{BASE_URL}/movie/popular"
    params = {'api_key': api_key}
    response = requests.get(url, params=params)
    return response.json().get('results', []) if response.status_code == 200 else []

def get_top_rated_movies(api_key):
    url = f"{BASE_URL}/movie/top_rated"
    params = {'api_key': api_key}
    response = requests.get(url, params=params)
    return response.json().get('results', []) if response.status_code == 200 else []

def get_trending_movies(api_key):
    url = f"{BASE_URL}/trending/movie/week"
    params = {'api_key': api_key}
    response = requests.get(url, params=params)
    return response.json().get('results', []) if response.status_code == 200 else []

def get_new_releases(api_key):
    url = f"{BASE_URL}/movie/now_playing"
    params = {'api_key': api_key}
    response = requests.get(url, params=params)
    return response.json().get('results', []) if response.status_code == 200 else []

def get_movies_by_genre(genre_id, api_key):
    url = f"{BASE_URL}/discover/movie"
    params = {'api_key': api_key, 'with_genres': genre_id}
    response = requests.get(url, params=params)
    return response.json().get('results', []) if response.status_code == 200 else []