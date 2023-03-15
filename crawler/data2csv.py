import csv
from pathlib import Path


def strip(word):
    word = str(word)\
        .replace("\\t", "")\
        .replace("\\n", "") \
        .replace("\t", "") \
        .replace("\n", "") \
        .replace("[", "").\
        replace("]", "").replace("\\xa0", " ")
    while word and word[0] == " ":
        word = word[1:]
    while word and word[-1] == " ":
        word = word[:-1]
    return word


def data2csv(dataset):
    with open("../data/bisondata" + dataset + ".csv", 'w', newline='') as csvfile:
        csvwriter = csv.writer(csvfile, delimiter="\t", quotechar="|", quoting=csv.QUOTE_MINIMAL)
        selected_attributes = ["Fakultät", "Veranstaltungstitel", "Bisonlink", "Veranstaltungsart", "SWS", "Sprache", "Tag", "Personen", "Beschreibung"]
        with_persons = True
        csvwriter.writerow(selected_attributes)

        delimiter = " :3 S: "

        if dataset != "":
            txt_folder = Path('database/semester_' + dataset + '/').rglob("*.txt")
        else:
            txt_folder = Path('database/').rglob("*.txt")
        files = [x for x in txt_folder]
        for filepath in files:
            entry = open(filepath, "r")
            next_row = ["missing" for i in range(len(selected_attributes))]
            for line in entry:
                if line[0] != "#":
                    split_line = line.split(delimiter)
                    if split_line[0] in selected_attributes:
                        if split_line[0] in ["Personen"]:
                            multi_entry = strip(split_line[1])
                            for i in range(2, len(split_line)):
                                multi_entry += (delimiter + split_line[i])
                            next_row[selected_attributes.index(split_line[0])] = strip(multi_entry)
                        else:
                            next_row[selected_attributes.index(split_line[0])] = strip(split_line[1])
            # print(next_row)
            csvwriter.writerow(next_row)

            if dataset != "":
                dataset = ""
                data2csv(dataset)


if __name__ == "__main__":
    data2csv("20221")
