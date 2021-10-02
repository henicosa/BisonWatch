## Comparison 
### What
In both cases we deal with the same data. Originated from the movies table data, the processed data is a tree hierarchy.
### Why
Both visualizations derive (action) a hierarchy, i.e. counted sets grouped by the data's attributes with a focus on their dependencies (target). 
### How
Both visualizations encode the data. Both map, although slightly different, categorical attributes to color hue. The mosaic plot also makes use of the saturation/opacity.   
Both vizualizations facet the data. The parrallel set juxtaposes the data for specifific attributes, which is aggregated in different sets according to the attribute. The mosaic plot iteratively partitions the data for a specific set of attributes
Both vizualizations reduce the data. To be precise they aggregate the data, since they both use the tree hierarchy.
## Used Channels
### Parallel Sets
- identity channels
    - color hue (3 perfomance bins)
    - horizontal position (separation of attributes)
- magnitude channels
    - vertical position on common scale (ordered / categorical attributes)
    - length / line thickness (number of items) 
    
### Mosaic Plot
- identity channels
    - spatial region
    - color hue (5 imdb rating bins)
        - opacity / saturation (internationality)
- magnitude channels
    - area (number of items) 

## Used Visual Marks
### Parallel Sets
- lines  

### Mosaic Plot
- areas