from bs4 import BeautifulSoup
import requests
import re
import unicodedata
import json
from webrequest import fetch_url_as_soup


def slugify(value, allow_unicode=False):
    """
    Taken from https://github.com/django/django/blob/master/django/utils/text.py
    Convert to ASCII if 'allow_unicode' is False. Convert spaces or repeated
    dashes to single dashes. Remove characters that aren't alphanumerics,
    underscores, or hyphens. Convert to lowercase. Also strip leading and
    trailing whitespace, dashes, and underscores.
    """
    value = str(value)
    value = value.replace("\\", "-")
    value = value.replace("/", "-")
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')


def enumerate_tags(tag_list):
    for i in range(len(tag_list)):
        print(i, tag_list[i])


def strip(word):
    word = str(word) \
        .replace("\\t", "") \
        .replace("\\n", "") \
        .replace("\'", "") \
        .replace("\"", "") \
        .replace("[", ""). \
        replace("]", "").replace("\\xa0", " ")
    while word and word[0] == " ":
        word = word[1:]
    while word and word[-1] == " ":
        word = word[:-1]
    # word = " ".join(word.split())
    return word


def process_url(url, dataset="20241"):
    # specify user agent
    soup = fetch_url_as_soup(url)

    delimiter = " :3 S: "
    
    tags = soup.find_all(re.compile("td"))

    course_id = strip(tags[4].contents[0])

    # Course title
    try:
        course_title = str(soup.find("h1").contents) \
            .removesuffix(" - Einzelansicht\\n        ']") \
            .removeprefix("['\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t        \\t")
    except Exception: 
        print("Kein Kurstitel gefunden für " + url)
        course_title = "Missing"

    
    # Filename
    try:
        filename = strip(course_id)
    except Exception:
        print("Crawler: Fehler bei url " + url)

    if len(filename) < 2:
        filename = "NoNumber - " + slugify(strip(course_title))
    else:
        filename = slugify(filename)

    dict = extract_bison_data(soup)
    with open("database/semester_" + dataset + "/" + filename + ".html", "w") as f:
        f.write(soup.prettify())

    with open("database/semester_" + dataset + "/" + filename + ".json", "w") as f:
        json.dump(dict, f, indent=4)

    # Open File
    f = open("database/semester_" + dataset + "/" + filename + '.txt', 'w')
    #f = open("database/" + "test_" + filename + '.txt', 'w')

    try:
        event_type = strip(tags[2].contents)
        sws_credits = strip(tags[3].contents)
        max_participants = strip(tags[5].contents)
        estimated_participants = strip(tags[8].contents)
        semester = strip(tags[6].contents)
        linked_course = strip(tags[7].contents)
        rhythm = strip(tags[9].contents)

    except Exception: 
        print("Hinweis: Fehler beim Schreiben der Tags für " + url)

    try:
        hyperlink = tags[10].find("a")["href"]
    except Exception:
        hyperlink = "missing"

    try:
        language = soup.find(attrs={"headers": "basic_13"}).contents
    except Exception:
        print("Hinweis: Keine Sprache für " + filename)
        language = "missing"
    

    try: 
        f.write("Veranstaltungstitel" + delimiter + course_title + "\n")
        f.write("Bisonlink" + delimiter + url + "\n")
        f.write('# Grunddaten' + delimiter + "\n")
        f.write('Veranstaltungsart' + delimiter + event_type + "\n")
        if len(sws_credits) == 0:
            f.write('SWS' + delimiter + "missing" + "\n")
        else:
            f.write('SWS' + delimiter + sws_credits + "\n")
        f.write('Veranstaltungsnummer' + delimiter + course_id + "\n")
        f.write('Max. Teilnehmer/-innen' + delimiter + max_participants + "\n")
        f.write('Semester' + delimiter + semester + "\n")
        f.write('Zugeordnetes Modul' + delimiter + linked_course + "\n")
        f.write('Erwartete Teilnehmer/-innen' + delimiter + estimated_participants + "\n")
        f.write('Rhythmus' + delimiter + rhythm + "\n")
        f.write('Hyperlink' + delimiter + hyperlink + "\n")
    except Exception:
        print("Hinweis: Fehler beim Schreiben der Tags für " + url)
    hyperlink = ""
    
    
    f.write('Sprache' + delimiter + strip(language) + "\n")
    # Fakultät
    faculty = extract_faculty(soup)
    f.write('Fakultät' + delimiter + faculty + "\n")
    # Zeit
    time = extract_time(soup)
    if time:
        f.write('# Zeit' + "\n")
        f.write('Tag' + delimiter + time["Tag"] + "\n")
        f.write('Zeit' + delimiter + time["Zeit"] + "\n")
        f.write('Terminrhythmus' + delimiter + time["Terminrhythmus"] + "\n")
        f.write('Bemerkung' + delimiter + time["Bemerkung"]  + "\n")

    f.write('# Personen' + "\n")
    hosts = extract_hosts(soup)
    if hosts:
        f.write('Personen')
        for host in hosts:
            faculty = host["faculty"]
            regular_name = host["regular_name"]
            f.write(delimiter + faculty + "," + regular_name)
        f.write("\n")

    f.write("# Beschreibung" + "\n")
    try:
        tags = soup.find(attrs={"summary": "Weitere Angaben zur Veranstaltung"}).find_all("td")
    except Exception:
        # print("Hinweis: Keine Beschreibung für " + filename)
        tags = []
    if tags and tags[0].find("p"):
        try:
            f.write('Beschreibung' + delimiter + strip(tags[0].find("p").contents) + "\n")
        except Exception:
            print("Keine Beschreibung für " + url)

def extract_time(soup):
    time = {}
    try:
        tags = soup.find(attrs={"summary": "Übersicht über alle Veranstaltungstermine"}).find_all("td")
    except Exception:
        # print("Hinweis: Keine Veranstaltungstermine für " + filename)
        tags = []
    if tags:
        try:
            for i in range(int((len(tags)) / 11)):
                
                day = strip(tags[i * 11 + 1].contents)
                if len(day) < 1 or day not in ["Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa.", "So."]:
                    time["Tag"] = "missing"
                else:
                    time["Tag"] = day
                
                time["Zeit"] = strip(tags[i * 11 + 2].contents).replace("\\xa0bis\\xa0", " - ")
                time["Terminrhythmus"] = strip(tags[i * 11 + 3].contents)
                time["Bemerkung"] = strip(tags[i * 11 + 8].contents)
                
        except Exception:
            print("Fehler beim Lesen der Tags für Zeit")
    return time


def find_teachers_faculty(url):
    person_soup = fetch_url_as_soup(url)
    try:
        faculty = strip(person_soup.find_all("h2", string="Strukturbaum")[0].find_next("a").find_next("a").contents)
    except Exception:
        faculty = None
        print("Hinweis: Keine Fakultät im Strukturbaum für " + url)
    if faculty and faculty != "Startseite":
        return faculty
    try:
        einrichtung_url = \
        person_soup.find(attrs={"summary": "Übersicht über die Zugehörigkeit zu Einrichtungen"}).find_all("td")[0].find(
            "a")["href"]
    except Exception:
        einrichtung_url = None
    if einrichtung_url:
        einrichtung_soup = fetch_url_as_soup(einrichtung_url)
        try:
            faculty = strip(
                einrichtung_soup.find_all("h2", string="Strukturbaum")[0].find_next("a").find_next("a").contents)
        except Exception:
            faculty = None
            print("Keine Fakultät bei " + einrichtung_url)
        if faculty:
            return faculty
    # print("Fakultät fehlt für " + url)
    return "missing"

from bs4 import BeautifulSoup

def extract_hosts(soup):
    try:
        tags = soup.find(attrs={"summary": "Verantwortliche Dozenten"}).find_all("td")
    except Exception:
        # print("Hinweis: Keine Dozenten für " + filename)
        tags = []

    hosts = []
    
    if tags:
        
        for i in range(int((len(tags) / 2))):
            try:
                person_entry = strip(tags[i * 2].find("a").contents).split(",")
            except Exception:
                print("Hinweis: Kein Personenlink")
            # Teste ob Vor- und Nachname gegeben sind
            if len(person_entry) > 1:
                regular_name = strip(person_entry[1]).split(" ")[0] + " " + strip(person_entry[0])
                # print("Startseite: " + tags[i*2].find("a")["href"])
            else:
                regular_name = strip(person_entry[0])

            faculty = find_teachers_faculty(tags[i * 2].find("a")["href"])
            
            hosts.append({"regular_name": regular_name, "faculty": faculty})
                # print("Achtung: " + strip(person_entry[0]))
        return hosts

def extract_general_tables(table):
    
    summary = table.get('summary')
    if summary:
        summary = summary.strip()  # Remove leading/trailing whitespace

    # Initialize dictionary for current table
    table_dict = {}

    # Find all rows (tr) in the table
    rows = table.find_all('tr')

    # Iterate over each row
    for row in rows:
        # Find all header (th) and data (td) cells in the row
        headers = row.find_all('th', {'class': 'mod'})
        data_cells = row.find_all('td')

        # Extract text from header and data cells
        for header, data_cell in zip(headers, data_cells):
            header_text = header.get_text(strip=True)
            data_text = data_cell.get_text(strip=True)
            if data_text == "":
                data_text = "missing"

            # Add key-value pairs to the table dictionary
            table_dict[header_text] = data_text

    return summary, table_dict

def extract_faculty(soup):
    faculty = ""
    try:
        faculty = strip(soup.find(attrs={"style": "padding-left: 10px;"}).find("a").contents[0])
    except Exception:
        try:
            faculty = strip(soup.find(attrs={"summary": "Übersicht über die zugehörigen Einrichtungen"}).find("a").contents[-1])
            if faculty not in ["Bauhaus-Universität Weimar", "Fakultät Bauingenieurwesen",
                               "Fakultät Architektur und Urbanistik", "Fakultät Medien",
                               "Fakultät Kunst und Gestaltung"]:
                institution_url = soup.find(attrs={"summary": "Übersicht über die zugehörigen Einrichtungen"}).find("a")["href"]
                einrichtung_soup = fetch_url_as_soup(institution_url)

                try:
                    faculty = strip(
                        einrichtung_soup.find_all("h2", string="Strukturbaum")[0].find_next("a").find_next(
                            "a").contents)
                except Exception:
                    faculty = None
                #print(faculty)
                if faculty not in ["Bauhaus-Universität Weimar", "Fakultät Bauingenieurwesen",
                              "Fakultät Architektur und Urbanistik", "Fakultät Medien",
                               "Fakultät Kunst und Gestaltung"]:
                    faculty = "missing"
        except Exception:
            faculty = "missing"
    return faculty
    

def extract_bison_data(soup):

    bison_data = {}

    # Extrahiere Grunddaten
    table = soup.find(attrs={"summary": "Grunddaten zur Veranstaltung"})
    if table:
        summary, table_data = extract_general_tables(table)
        bison_data[summary] = table_data

    # Extrahiere Beschreibung
    table = soup.find(attrs={"summary": "Weitere Angaben zur Veranstaltung"})
    if table:
        summary, table_data = extract_general_tables(table)
        bison_data[summary] = table_data

    bison_data["Fakultät"] = extract_faculty(soup)
    bison_data["Personen"] = extract_hosts(soup)
    bison_data["Zeit"] = extract_time(soup)

    return bison_data

if __name__ == "__main__":
    #process_url("https://www.uni-weimar.de/qisserver/rds?state=verpublish&status=init&vmfile=no&moduleCall=webInfo&publishConfFile=webInfo&publishSubDir=veranstaltung&veranstaltung.veranstid=51739")
    process_url("https://www.uni-weimar.de/qisserver/rds?state=verpublish&status=init&vmfile=no&publishid=62544&moduleCall=webInfo&publishConfFile=webInfo&publishSubDir=veranstaltung")
