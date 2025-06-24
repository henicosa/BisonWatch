import logging
import requests
from bs4 import BeautifulSoup
import os
import pickle
import urllib.parse
import json
import time

cache_path = "cache/"

seconds_delay = 0.5


# configure request log
logging.basicConfig(filename="bison_requests.log",
                            level=logging.INFO,
                            filemode='a',
                            format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s',
                            datefmt='%H:%M:%S')

def generate_cache_filename(url):
    # Remove forbidden characters from URL and generate a stable filename from the encoded URL
    encoded_url = urllib.parse.quote(url, safe='')
    filename = f"{encoded_url}.cache"
    return cache_path + filename

def is_cache_valid(cache_filename):
    # Check if the cached data is older than 3 days
    if os.path.exists(cache_filename):
        with open(cache_filename, 'r', encoding='utf-8') as f:
            cached_data = json.load(f)
            mod_time = cached_data.get('timestamp', 0)
            current_time = time.time()
            return (current_time - mod_time) < (3 * 24 * 60 * 60)  # 3 days in seconds
    return False

def fetch_url_as_soup(url):
    # Create a cache filename from the URL
    cache_filename = generate_cache_filename(url)
    if is_cache_valid(cache_filename):
        # If the cached data is valid, load and return it
        with open(cache_filename, 'r', encoding='utf-8') as f:
            cached_data = json.load(f)
            html_content = cached_data.get('html', '')
    else:
        # If it's not valid or doesn't exist, make the request
        logging.info(url)
        headers = {'user-agent': 'bisonwatch-vis_project_2021'}
        r = requests.get(url, headers=headers)
        html_content = r.text

        time.sleep(seconds_delay)

        # Cache the HTML content along with the current timestamp
        with open(cache_filename, 'w', encoding='utf-8') as f:
            cached_data = {'html': html_content, 'timestamp': time.time()}
            json.dump(cached_data, f)

    return BeautifulSoup(html_content, "html.parser")
