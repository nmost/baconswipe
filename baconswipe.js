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
    this.cellhorizontalsize = marginRight + cellwidth + 1;
    this.element.style.width = this.columns*(this.cellhorizontalsize)+'px';
    var rows = 0;   
    while(this.height > 0) {
	rows++;
	this.height -= cellheight;
    } 
    this.height += cellheight;
    var marginBottom = this.height/(rows - 1);
    this.cellverticalsize = cellheight + marginBottom;
    if(this.individual)
        this.hpages = this.columns;
    else
        this.hpages = Math.ceil(this.columns/(this.width/cellwidth)); 
    this.vpages = 2;
    while (index--) {
      var el = this.slides[index];
      el.style.width =  cellwidth+ 'px';
      el.style.height = cellheight+'px';
      el.style.marginRight = marginRight+'px';
      el.style.marginBottom = marginBottom +'px';
      el.style.display = 'inline-block';
      el.style.verticalAlign = 'top';
    }

    // set start position and force translate to remove initial flickering
    this.slide(this.index, 0); 

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
    if(this.individual) {
      style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.cellhorizontalsize) + 'px,0,0)';
      style.msTransform = style.OTransform = 'translateX(' + -(index * this.cellhorizontalsize) + 'px)';
    } else {
      style.MozTransform = style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px,0,0)';
      style.msTransform = style.OTransform = 'translateX(' + -(index * this.width) + 'px)';

    }
    // set new index to allow for expression arguments
    this.index = index;

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

    // if user is not trying to scroll vertically
    if (!this.isScrolling) {

      // prevent native scrolling 
      e.preventDefault();

      // cancel slideshow
      clearTimeout(this.interval);

      // increase resistance if first or last slide
      this.deltaX = 
        this.deltaX / 
          ( (!this.index && this.deltaX > 0               // if first slide and sliding left
            || this.index == this.hpages - 1              // or if last slide and sliding right
            && this.deltaX < 0                            // and if sliding at all
          ) ?                      
          ( Math.abs(this.deltaX) / this.cellhorizontalwidth + 1 )      // determine resistance level
          : 1 );                                          // no resistance if false
      
      // translate immediately 1-to-1
      if (this.individual)
      	this.element.style.MozTransform = this.element.style.webkitTransform = 'translate3d(' + (this.deltaX - this.index * this.cellhorizontalsize) + 'px,0,0)';
      else
        this.element.style.MozTransform = this.element.style.webkitTransform = 'translate3d(' + (this.deltaX - this.index * this.width) + 'px,0,0)';
      
      e.stopPropagation();
    } else if (this.isScrolling){
       clearTimeout(this.interval);
       
       this.element.style.MozTransform = this.element.style.webkitTransform = 'translate3D(0,'+(this,deltaY - this.vindex * this.cellverticalsize) + 'px,0)';
       e.stopPropagation();
    }

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
    
    e.stopPropagation();
  }

};
