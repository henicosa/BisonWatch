import bison2data as b2d
from bs4 import BeautifulSoup
import requests
import data2csv as d2c

import re
numelem = 10000
year = "2022"
# 1 für Sommer, 2 für Winter
semester = "2"
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
    print("Meta: Liste wird erstellt auf Basis von " + r.url)
    soup = BeautifulSoup(r.text, 'html.parser')
    course_tags = soup.find_all(attrs={"summary" : "Übersicht über alle Veranstaltungen"})[0]("tr")
    for i in range(len(course_tags)-1):
        course_link = course_tags[1+ i]
        course_link = course_link.find_all("td")[1]
        course_link = course_link.find("a")["href"]
        link_queue.append(course_link)
        numelem -= 1
        if numelem < 0:
            break
    if numelem < 0:
        break
#print(link_queue)



for link in link_queue:
    try:
        b2d.process_url(link, dataset)
    except Exception as e:
        print("FATALER FEHLER : " + link)
        print(e)


d2c.data2csv(dataset)
