import bison2data as b2d
from bs4 import BeautifulSoup
import requests
import data2csv as d2c

import re
numelem = 900
semester = 20212
payload = {"state": "wsearchv", "search": "1", "subdir": "veranstaltung","veranstaltung.semester": str(semester), "P_start": "0", "P_anzahl": str(numelem), "P.sort": "", "_form": "display"}

url = "https://www.uni-weimar.de/qisserver/rds"
headers = {'user-agent': 'bisonwatch-vis_project_2021'}

r = requests.get(url, headers=headers, params=payload)
soup = BeautifulSoup(r.text, 'html.parser')
course_tags = soup("a", "regular")

link_queue = []
for i in range(numelem):
    link_queue.append(course_tags[3+i]["href"])

for link in link_queue:
    b2d.process_url(link)

d2c.data2csv()
