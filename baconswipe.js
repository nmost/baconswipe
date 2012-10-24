/*
 * Swipe 1.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/
//TODO PUT SHIT IN OPTIONS
window.Swipe = function(element, options, cellPaddedWidth, cellPaddedHeight, columns) {

  // return immediately if element doesn't exist
  if (!element) return null;

  var _this = this;

  // retreive options
  this.options = options || {};
  this.index = this.options.startSlide || 0;
  this.vindex = this.options.vindex || 0;
  this.speed = this.options.speed || 300;
  this.callback = this.options.callback || function() {};
  this.delay = this.options.auto || 0;
  this.individual = this.options.individual || false;
  this.columns = columns;

  // reference dom elements
  this.container = element;
  this.element = this.container.children[0]; // the slide pane/<ul>

  // static css
  this.container.style.overflow = 'hidden';
  this.element.style.listStyle = 'none';
  this.element.style.margin = 0;

  // trigger slider initialization
  this.setup(cellPaddedWidth, cellPaddedHeight);

  // begin auto slideshow
  this.begin();

  // add event listeners
  if (this.element.addEventListener) {
    this.element.addEventListener('touchstart', this, false);
    this.element.addEventListener('touchmove', this, false);
    this.element.addEventListener('touchend', this, false);
    this.element.addEventListener('webkitTransitionEnd', this, false);
    this.element.addEventListener('msTransitionEnd', this, false);
    this.element.addEventListener('oTransitionEnd', this, false);
    this.element.addEventListener('transitionend', this, false);
    window.addEventListener('resize', this, false);
  }

};

Swipe.prototype = {

  setup: function(cellwidth, cellheight) {

    // get and measure amt of slides
    this.slides = this.element.children;
    this.length = this.slides.length;

    // return immediately if their are less than two slides
    if (this.length < 2) return null;

    // determine width of each slide
    this.width = ("getBoundingClientRect" in this.container) ? this.container.getBoundingClientRect().width : this.container.offsetWidth;
    this.height = ("getBoundingClientRect" in this.container) ? this.container.getBoundingClientRect().height : this.container.offsetHeight;


    // return immediately if measurement fails
    if (!this.width || !this.height) return null;

    // hide slider element but keep positioning during setup
    this.container.style.visibility = 'hidden';

    // set sizing attributes
    var index = this.slides.length;
    var extrawidth = this.width%cellwidth;
    var cellsperrow = Math.floor(this.width/cellwidth);
    var marginRight = extrawidth/cellsperrow;

//FIX FOR WEBKIT ENGINES: NOTE THIS MEANS YOU CAN'T HAVE MARGIN 0
    marginRight+=1;
//define the horizontal size
    this.cellhorizontalsize = marginRight + cellwidth + 1;
//set the UL width
    this.element.style.width = this.columns*(this.cellhorizontalsize)+'px';

//calculate heights
    var rows = 0;   
    var extraheight = this.height;
    while(extraheight > 0) {
	rows++;
	extraheight -= cellheight;
    } 
    extraheight += cellheight;
    var marginBottom = extraheight/(rows - 1);
    this.cellverticalsize = cellheight + marginBottom;

//set the number of "pages" the slider will slide through depending on if a "page" is an individual grid item or a full viewport's worth of grid items
    if(this.individual) {
        this.hpages = this.columns;
        this.vpages = rows;
    }
    else {
        this.hpages = Math.ceil(this.columns/(this.width/cellwidth)); 
    	this.vpages = Math.ceil(rows/(this.height/cellheight));
    }
//set sizing variables for each cell
    while (index--) {
      var el = this.slides[index];
      el.style.width =  cellwidth+ 'px';
      el.style.height = cellheight+'px';
      el.style.marginRight = marginRight+'px';
      el.style.marginBottom = marginBottom +'px';
      el.style.display = 'inline-block';
      el.style.verticalAlign = 'top';
    }

    this.element.style.webkitTransform = 'translate(0, 0)';
    // set start position and force translate to remove initial flickering
    this.slide(this.index, 0); 
    this.vslide(this.vindex, 0);

    // show slider element
    this.container.style.visibility = 'visible';

  },

  slide: function(index, duration) {

    var style = this.element.style;

    // fallback to default speed
    if (duration == undefined) {
        duration = this.speed;
    }

    // set duration speed (0 represents 1-to-1 scrolling)
    style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 'ms';

    // translate to given index position
    /*if(this.individual) {
      style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.cellhorizontalsize) + 'px,0,0)';
      style.msTransform = style.OTransform = 'translateX(' + -(index * this.cellhorizontalsize) + 'px)';
    } else {
      style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px,0,0)';
      style.msTransform = style.OTransform = 'translateX(' + -(index * this.width) + 'px)';

    }*/
    if(this.individual) {
    	style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.cellhorizontalsize) + 'px,' + -(this.vindex * this.cellverticalsize) + 'px,0)';
      	style.msTransform = style.OTransform = 'translateX(' + -(index * this.cellhorizontalsize) + 'px)';
    } else { 
    	style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px,' + -(this.vindex * this.height) + 'px,0)';
      	style.msTransform = style.OTransform = 'translateX(' + -(index * this.width) + 'px)';
    }
    // set new index to allow for expression arguments
    this.index = index;

  },

  vslide: function(vindex, duration) {
	var style = this.element.style;
        if (duration == undefined)
		duration = this.speed;
	style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.OTransitionDuration = style.transitionDuration = duration + 'ms';
	/*if(this.individual) {
      		style.MozTransform = style.webkitTransform = 'translate3d(0,' + -(vindex * this.cellverticalsize) + 'px,0)';
     		style.msTransform = style.OTransform = 'translateY(' + -(vindex * this.cellverticalsize) + 'px)';
    	} else { 
      		style.MozTransform = style.webkitTransform = 'translate3d(0,' + -(vindex * this.height) + 'px,0)';
      		style.msTransform = style.OTransform = 'translateY(' + -(vindex * this.height) + 'px)';
	}*/
	if(this.individual) {
      		style.MozTransform = style.webkitTransform = 'translate3d(' + -(this.index * this.cellhorizontalsize) + 'px,' + -(vindex * this.cellverticalsize) + 'px,0)';
     		style.msTransform = style.OTransform = 'translateY(' + -(vindex * this.cellverticalsize) + 'px)';
    	} else { 
      		style.MozTransform = style.webkitTransform = 'translate3d(' + -(this.index * this.width) + 'px,' + -(vindex * this.height) + 'px,0)';
      		style.msTransform = style.OTransform = 'translateY(' + -(vindex * this.height) + 'px)';
	}
	this.vindex = vindex;
  },

  getPos: function() {
    
    // return current index position
    return this.index;

  },

  prev: function(delay) {

    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    // if not at first slide
    if (this.index) this.slide(this.index-1, this.speed);

  },

  next: function(delay) {

    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    if (this.index < this.hpages - 1) this.slide(this.index+1, this.speed); // if not last slide
    else this.slide(0, this.speed); //if last slide return to start

  },

  begin: function() {

    var _this = this;

    this.interval = (this.delay)
      ? setTimeout(function() { 
        _this.next(_this.delay);
      }, this.delay)
      : 0;
  },
  
  stop: function() {
    this.delay = 0;
    clearTimeout(this.interval);
  },
  
  resume: function() {
    this.delay = this.options.auto || 0;
    this.begin();
  },

  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchend': this.onTouchEnd(e); break;
      case 'webkitTransitionEnd':
      case 'msTransitionEnd':
      case 'oTransitionEnd':
      case 'transitionend': this.transitionEnd(e); break;
      case 'resize': this.setup(); break;
    }
  },

  transitionEnd: function(e) {
    
    if (this.delay) this.begin();

    this.callback(e, this.index, this.slides[this.index]);

  },

  onTouchStart: function(e) {
    
    // prevent native scrolling 
    e.preventDefault();

    this.start = {

      // get touch coordinates for delta calculations in onTouchMove
      pageX: e.touches[0].pageX,
      pageY: e.touches[0].pageY,

      // set initial timestamp of touch sequence
      time: Number( new Date() )

    };

    // used for testing first onTouchMove event
    this.isScrolling = undefined;
    
    // reset deltaX and Y
    this.deltaX = 0;
    this.deltaY = 0;

    // set transition time to 0 for 1-to-1 touch movement
    this.element.style.MozTransitionDuration = this.element.style.webkitTransitionDuration = 0;
    
    this.matrix = new WebKitCSSMatrix(window.getComputedStyle(this.element).webkitTransform);
    e.stopPropagation();
  },

  onTouchMove: function(e) {
    // ensure swiping with one touch and not pinching
    if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

    this.deltaX = e.touches[0].pageX - this.start.pageX;
    this.deltaY = e.touches[0].pageY - this.start.pageY;

    // determine if scrolling test has run - one time test
    if ( typeof this.isScrolling == 'undefined') {
      this.isScrolling = !!( this.isScrolling || Math.abs(this.deltaX) < Math.abs(this.deltaY) );
    }

    //increase resistance if first or last slide
    this.deltaX = this.deltaX/
	( (!this.index && this.deltaX > 0 			//if on first item sliding right
	  || this.index == this.hpages - 1 && this.deltaX < 0 )	//or on last item sliding left
	? (Math.abs(this.deltaX)/this.cellhorizontalsize + 1)	//decrease deltaX proportionately
	: 1 ); 							//otherwise leave it alone

    this.deltaY = this.deltaY/
	( (!this.vindex && this.deltaY > 0			//if on first row sliding down
	  || this.index == this.vpages - 1 && this.deltaY < 0 )	//or on bottom row sliding up
	? (Math.abs(this.deltaY)/this.cellverticalsize + 1)
	: 1);

    if (this.individual && this.isScrolling) {
	this.element.style.webkitTransform = this.matrix.translate(0,this.deltaY);
    } else if (this.isScrolling) {
	this.element.style.webkitTransform = this.matrix.translate(0,this.deltaY);  
    } else if (this.individual) {
	this.element.style.webkitTransform = this.matrix.translate(this.deltaX, 0);
    } else{
	this.element.style.webkitTransform = this.matrix.translate(this.deltaX,0); 
    } 
    
    e.stopPropagation();

  },

  onTouchEnd: function(e) {

    // determine if slide attempt triggers next/prev slide
    var isValidSlide; 

    // determine if slide attempt is past start and end
    var isPastBounds; 

    // if not scrolling vertically
    if (!this.isScrolling) {
      isValidSlide = (Math.abs(this.deltaX) > 20) || (Math.abs(this.deltaX) > this.cellhorizontalsize/2);
      isPastBounds = (!this.index && this.deltaX > 0) || (this.index == this.hpages - 1 && this.deltaX < 0);
      // call slide function with slide end value based on isValidSlide and isPastBounds tests
      this.slide( this.index + ( isValidSlide && !isPastBounds ? (this.deltaX < 0 ? 1 : -1) : 0 ), this.speed );
    }
    else if (this.isScrolling) {
	isValidSlide = (Math.abs(this.deltaY) > 20) || (Math.abs(this.deltaY) > this.cellverticalsize/2);
	isPastBounds = (!this.vindex && this.deltaY > 0) || (this.vindex == this.vpages -1 && this.deltaY < 0);

	this.vslide( this.vindex + (isValidSlide && !isPastBounds ? (this.deltaY < 0 ? 1 : -1) : 0 ), this.speed );
    }
    
    e.stopPropagation();
  }

};
