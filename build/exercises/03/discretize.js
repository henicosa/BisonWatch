import * as d3 from "../../_snowpack/pkg/d3.js";

/* Function to discretize the defined ordered attributes to categorical attributes
  - data, the given dataset in our case the whole movies.csv
  RETURN: same dataset reduced to the 4 discretized attributes
*/
export function discretize(data) {
  // DONE: Task 1: define a scale to map performance (revenue - budget) to
  // the following categories and explain you choice shortly
  // Your explanation: I also included a little range around zero perfomance in none, since it makes the plot more meaningful
  const performanceCategories = ["negative", "none", "positive"];
  const performanceScale = d3.scaleThreshold()
                              .domain([-5, 5])
                              .range(performanceCategories);//(_) => performanceCategories[Math.round(1*(performanceCategories.length-1))];

  // DONE: Task 1: define a scale to map imdbRating to
  // the following categories and explain you choice shortly
  // Your explanation: I decided to use 5 uniform segments for the Rating to get a more detailed plot. To avoid the alphabetical ordering I numbered the segments.
  const ratingCategories = ["1 - ok", "2 - good", "3 - nice", "4 - very nice", "5 - excellent"];
  // Note: since the films have been chosen based on high rating the lowest
  // category was defined as high (you are free to choose your own categories) 
  const ratingScale = d3.scaleQuantize()
                      .domain(d3.extent(data, d => d.imdbRating)) 
                      .range(ratingCategories);

  // DONE: Task 1: define a scale to map spokenLanguages to
  // the following categories and explain you choice shortly
  // local         means only one spoken language
  // international means more then one language
  // Your explanation: Because every movie with more than one language is international, I splitted the sets into movies with at most one and movies with at least two language.
  const internationality = ["local", "international"];
  const interantionalityScale = d3.scaleThreshold()
                                  .domain([2])
                                  .range(internationality);

  // TODO: Task 1: define a scale to map releaseDate to
  // the following categories and explain your choice shortly
  // Your explanation: Since we have 3 year categories, I splitted the data accordingly.
  const yearCategories = [`${d3.min(data, d => d.releaseDate.getFullYear())} - 1950`, 
  "1950 - 2000", `2000 - ${d3.max(data, d => d.releaseDate.getFullYear())}`];
  const fiftyYearScale = d3.scaleThreshold()
                          .domain([1950,2000])
                          .range(yearCategories);


  // Apply the defined scales to the respective 
  // attributes of the data and return them. 
  // The resulting dataset will be an array of objects that only
  // contain the newly created discretized attributes and the movies title
  return data.map((d) => {
    let entry = { title: d.title };

    // transform releaseDate 
    entry.period = fiftyYearScale(d.releaseDate.getFullYear());

    // transform performance (revenue - budget)
    entry.performance = performanceScale(d.revenue - d.budget);

    // transform imdbRating
    entry.rating = ratingScale(d.imdbRating);

    // transform spokenLanguages
    entry.internationality = interantionalityScale(d.spokenLanguages.length);

    return entry;
  });
}
