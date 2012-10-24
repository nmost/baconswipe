# Baconswipe



### Baconswipe is a lightweight, 2D scrollable grid slider for webkit touch devices. It's also delicious.


##### Use Guide:
1. Create a div with id 'slider'

2. Inside the div create a ul; 
each list item is a "cell". Put your cell content inside the li tags.
3. To ensure some content is displayed even on non-compatible browsers, set the inline style display property to none for all but the first li, which should be inline-block.
4. Include baconswipe.js
5. Call: new BaconSwipe(document.getElementById('slider'), OPTIONS, height, width, columns) where options is an array of settings (see baconswipe.js), height and width are the TOTAL heights and widths of the li cells, including margins, padding, borders, etc, and columns is the number of columns in each row.
6. In CSS, set the dimensions of #slider
7. Baconswipe will automatically determine how many cells will be VISIBLE in a row/column at once, and calculate + add applicable margins.
