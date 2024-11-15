from flask_caching import Cache

# Define cache as None initially
cache = None

def init_cache(app):
    """
    Initializes cache with app context.
    """
    global cache  # Use the global cache variable
    cache = Cache(config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300})
    cache.init_app(app)

def cache_content(topic, content):
    """
    Caches the generated content for efficient future retrieval.
    
    Args:
        topic (str): Topic name to use as cache key.
        content (dict): Content data to cache.
    """
    if cache:
        cache.set(topic, content)
    else:
        raise RuntimeError("Cache not initialized. Call init_cache(app) first.")

def get_cached_content(topic):
    """
    Retrieves cached content for a topic if available.
    
    Args:
        topic (str): Topic name to look up in cache.
    
    Returns:
        dict or None: Cached content, or None if cache miss.
    """
    if cache:
        return cache.get(topic)
    else:
        raise RuntimeError("Cache not initialized. Call init_cache(app) first.")