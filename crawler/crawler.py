import bison2data as b2d
from bs4 import BeautifulSoup
import requests
import data2csv as d2c

import re
numelem = 10000
year = "2021"
# 1 für Sommer, 2 für Winter
semester = "1"
dataset = year + semester

payload = {"state": "wsearchv", "search": "1", "subdir": "veranstaltung","veranstaltung.semester": dataset, "P_start": "0", "P_anzahl": str(numelem), "P.sort": "", "_form": "display"}

url = "https://www.uni-weimar.de/qisserver/rds"
headers = {'user-agent': 'bisonwatch-vis_project_2021'}

r = requests.get(url, headers=headers, params=payload)
soup = BeautifulSoup(r.text, 'html.parser')
search_link_queue = [url]
link_queue = []
for elem in soup.findAll("a", class_="linkAsButton"):
    search_link_queue.append(elem["href"])
for search_link in search_link_queue:
    r = requests.get(search_link, headers=headers, params=payload)
    soup = BeautifulSoup(r.text, 'html.parser')
    course_tags = soup("a", "regular")
    for i in range(len(course_tags)-3):
        link_queue.append(course_tags[3+i]["href"])
        numelem -= 1
        if numelem < 0:
            break
    if numelem < 0:
        break
#print(link_queue)

for link in link_queue:
    try:
        b2d.process_url(link, dataset)
    except Exception:
        print("FATALER FEHLER : " + url)


d2c.data2csv(dataset)
