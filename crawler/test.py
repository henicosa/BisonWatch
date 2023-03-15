from bs4 import BeautifulSoup

html_string = """
    <tr>
        <th scope="row" class="mod">Beschreibung</th>
        <td class="mod_n"><p>Schwerpunkte: Feuchte und bauschädliche Salze, zerstörende und zerstörungsfreie Prüfverfahren, mikroskopische Analyseverfahren, chemische Analysemethoden, mineralogische Phasenanalyse, Bauzustandsanalyse, Schädigung von Naturstein, Mauerziegel, Mörtel, Beton, Holzschadensanalyse, Hinweise zur Instandsetzung</p>
<p>Lernziel/ Kompetenzen: Die Studierenden sind in der Lage, eigenverantwortlich Analyse- und Nachweisverfahren zur Ermittlung von Ursachen der Schädigung verschiedener Baustoffe durchzuführen. Das Projekt befähigt die Studierenden, grundlegende experimentelle Untersuchungen zur Schadensanalyse im<br>Hinblick auf ein baustoffliches Gutachten zu konzipieren u. durchzuführen. Hierfür ist ein Interdisziplinäres Verstehen komplexer Zusammenhänge notwendig. Die Studierende können eigenverantwortlich Problemlösungen erarbeiten. Die Studierenden erwerben zudem Kompetenz in Rhetorik, Präsentationstechnik und Teamarbeit.</p>
<p>&nbsp;</p>
<p>The students are able to carry out analysis and verification procedures on their own responsibility to determine the causes of damage to various building materials. The project enables students to design and carry out fundamental experimental investigations for damage analysis with a view to obtaining an expert opinion on the building material. Complex interrelationships are understood interdisciplinary. The students are able to develop problem solutions on their own responsibility. They have competence in rhetoric, presentation techniques and teamwork.</p>
<p>Focal points: Moist and harmful salts, destructive and non-destructive testing methods, microscopic analysis methods, chemical analysis methods, mineralogical phase analysis, structural condition analysis, damage to natural stone, bricks, mortar, concrete, wood damage analysis, repair advice</p>
<p>&nbsp;</p></td>
    </tr>
"""

soup = BeautifulSoup(html_string)
td_element = soup.find("td", {'class': 'mod_n'})

# Use the get_text() method to extract only the text: 
text = td_element.get_text() 
print(text)
