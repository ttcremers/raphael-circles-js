var Bubbles = {
	objectStore: [],

	init: function(levelDefinition, elmID, width, height) {
		
		var mainPaper = Raphael(elmID, width, height); 
		var centerVector = {
			x: Math.round(mainPaper.width / 2),
			y: Math.round(mainPaper.height / 2)
		}; 

		// Generate all objects
		var resolveBackgroundParents = {}; 
		for (var i = 0; i < Object.keys(levelDefinition).length; i++) {
			var b = levelDefinition[Object.keys(levelDefinition)[i]];
			var position = b.position || centerVector;
			b.args.unshift(mainPaper);	

			// BackgroundBubbles
			this.objectStore.push( { 
						bubble: BackgroundBubble.apply(null, b.args),
						parentID: b.parent,
						position: position,
						name: Object.keys(levelDefinition)[i], 
						type: "BackgroundBubble"
					});
		 
			// SmartBubbles
			var p_idx = this.objectStore.length -1;
			resolveBackgroundParents[Object.keys(levelDefinition)[i]] = p_idx;

			for (var x = 0; x < b.smartBubbles.length; x++) {
				var s = b.smartBubbles[x];
				s.args.unshift(mainPaper);	

				this.objectStore.push( { 
							bubble: SmartBubble.apply(null, s.args),
							parentID: p_idx,
							position: s.position,
							name: s.name,
							type: "SmartBubble"
						});
			}
		}

		// Translate parentID string to array index ID
		for (var i = 0; i < this.objectStore.length; i++) {
			if (typeof this.objectStore[i].parentID !== 'number') {
				this.objectStore[i].parentID = 
					resolveBackgroundParents[this.objectStore[i].parentID];
			}
		}
		this.start(mainPaper); // This starts the game loop
	},

	start: function(mainPaper) {
		this.update(mainPaper);
		this.render(mainPaper);
	},

	update: function(mainPaper) {
		for (var i = 0; i < this.objectStore.length; i++) {
			var obj = this.objectStore[i];
			if ( typeof obj.position === 'object' ) {
				obj.bubble.update(obj.position); 
			} else {
				obj.bubble.update(
						this.objectStore[obj.parentID].bubble.getCircumWorldCoordsByDegrees(obj.position)); 
			}
		}
	},

	render: function(mainPaper) {
		mainPaper.clear(); // clean our stage
		for (var i = 0; i < this.objectStore.length; i++) {
			var obj = this.objectStore[i];
			if (obj.type === "BackgroundBubble") { 
				obj.bubble.render(this.objectStore.filter(function(e) {
					return e.parentID === i && e.type === "SmartBubble"; 
				}));
			}
		} 
	}
};


var BackgroundBubble = (function(paper, radius, delay) {
  var randomINTBetween = function(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  };

  // Fixed properties
  var _vec = { x:0, y:0 };
  var _paper = paper;
  var _radius = radius;
  var _decorativeSmallPosition = randomINTBetween(1, 120); 
  var _decorativeMediumPosition = randomINTBetween(120, 240); 
  var _decorativeLargePosition = randomINTBetween(240, 360); 

  var _renderChilderen = [];
 
  /**
    * Helper function to make it easy to get a world point on 
    * the circomference of the circle by just specifying at 
    * which degree you'd like to know the coordinates
    *
    * @returns a vector (x,y)
    */
  var getCircumWorldCoordsByDegrees = function(degrees, spacing) {
    var spacing = spacing || 0;
    return {
      x: (_radius * Math.cos(degrees * Math.PI / 180.0) + _vec.x) + spacing,
      y: (_radius * Math.sin(degrees * Math.PI / 180.0) + _vec.y) + spacing
    };
  };
  
  var drawDecortiveCircles = function(parentCircle) {
    // FIXME the hardcoded radius of 200 should be refactored out
    var scale = parentCircle.attrs.r / 200;
    var zeroDegrees = getCircumWorldCoordsByDegrees(_decorativeSmallPosition); 

    // Small
    var v1 = getCircumWorldCoordsByDegrees(_decorativeSmallPosition);
    var c1 = _paper.circle( v1.x, v1.y, 0);
    c1.attr('stroke', "#89cff0");
    c1.attr('fill', "#FFF");

    // Medium
    //degrees += ( 4 * scale );
    var v2 = getCircumWorldCoordsByDegrees(_decorativeMediumPosition);
    var c2 = _paper.circle(
        v2.x, 
        v2.y, 
        16 * scale);
    c2.attr('stroke', "#89cff0");
    c2.attr('fill', "#FFF");
    c2.toBack(); 
    
    // Large
    //degrees += ((8 * scale) + (5 * scale));
    var v3 = getCircumWorldCoordsByDegrees(_decorativeLargePosition);
    var c3 = _paper.circle(
        v3.x, 
        v3.y, 
        24 * scale);
    c3.attr('stroke', "#89cff0");
    c3.attr('fill', "#FFF");
    c3.toBack(); 

  };
    

  return {
    update: function( vec ) { 
      _vec = vec; 
    },
    
    render: function( childeren ) { 
      _renderChilderen = childeren;

      var centerVector = {}; 
      centerVector.x = Math.round(_paper.width / 2);
      centerVector.y = Math.round(_paper.height / 2);

      var circle = _paper.circle( _vec.x, _vec.y, 0);
      circle.attr('fill-opacity', 0);
      circle.attr('stroke', "#89cff0");
			window.setTimeout(function() {
				circle.animate({
						r: _radius,
					}, 
					1500, 
					"backOut", 
					function() {
						drawDecortiveCircles(circle);

						if ( _renderChilderen.length > 0 ) {
							for (var i = 0; i < _renderChilderen.length; i++) {
								var child = _renderChilderen[i];
								child.bubble.render();
							}
						}
						circle.toBack(); 
				});
			}, delay );
      
    },
    getCircumWorldCoordsByDegrees: getCircumWorldCoordsByDegrees
    
  };
});

var SmartBubble = (function(paper, baseRadius, percent, growRate, text, href, delay) {
  // Our main venue 
  var _circle, _header, _body, _hello;
  
  // Fixed properties
  var _paper                  = paper;
  var _baseRadius             = baseRadius;
  var _growRate               = growRate;
  var _vec                    = { x:0, y:0 };
  var _percent                = percent;
  var _initialTextColor       = "#89cff0"
  var _targetTextColor        = "#FFF"
  var _targetFillColor        = "#89cff0"
  var _initialFillColor       = "#FFF"
  var _initialStrokeColor     = "#89cff0"
  var _targetStrokeColor      = "#89cff0"
  var _text                   = text;
  var _animationFrameCount    = 0;
  var _maxAnimationFrameCount = 15;
  var _frameDelayShowRings    = 50;
 
  // Calculated based on percentages
  var _initialRadius = _baseRadius + (_baseRadius * percent); 
  var _initialFontSize = 8 + (8 * (percent) );  
  var _targetRadius = _initialRadius + (_initialRadius * growRate);
  var _targetFontSize = _initialFontSize + ( _initialFontSize * growRate );

  var STATES = {
    IS_MOUSEOVER: 1, 
    IS_MOUSEOUT: 2, 
  };
  var STATE = STATES.IS_MOUSEOUT;

  return {
    update: function(vec) {
      _vec = vec;
    },

    render: function() {
      /* render out the graphic to main paper */
      _circle = _paper.circle(
          _vec.x, 
          _vec.y, 
          5);
      _circle.attr('fill', _initialFillColor);
      _circle.attr('stroke', _initialStrokeColor);
      
      var onmouseover = function(e) {
				this[0].style.cursor = "pointer";

        var targetSize = _targetRadius;
        var targetFontSize = _targetFontSize;

        _circle.animate({
          r: targetSize,
          fill: _targetFillColor 
        }, 100, "backIn", function() {
          _hello.show();
          _hello.animate({ opacity: 1.0 }, 100, "<");
        });

        _header.animate({"font-size": _targetFontSize + 18 }, 100, "backIn");
        _body.animate({"font-size": _targetFontSize }, 100, "backIn");

        _header.attr("fill", _targetTextColor);
        _body.attr("fill", _targetTextColor);

      };

      var onmouseout = function(e) {
				this[0].style.cursor = "";
        var x = e.layerX || e.x,
            y = e.layerY || e.y; 
        if (this.isPointInside(x, y)) return false;

        _hello.animate({
          opacity: 0.0 
        }, 100, ">", function() { 
          _hello.hide();
          _circle.animate({ r: _initialRadius, fill: _initialFillColor }, 100, "backOut");
        });

        _header.animate({"font-size": _initialFontSize + 18 }, 100, "backOut");
        _body.animate({"font-size": _initialFontSize }, 100, "backOut");

        _header.attr("fill", _initialTextColor);
        _body.attr("fill", _initialTextColor);

      };

			var onclick = function(e) { window.location.href = href;	};
     
		 	window.setTimeout( function() {
				_circle.animate({ r: _initialRadius, x: _vec.x, y: _vec.y}, 
					800, 
					"backOut", 
					function() { 
						_header = smartText(
								_paper, _vec,  _text.split("\n")[0].trim(), {
									fill: _initialTextColor, 
									font_size: _initialFontSize + 18, // Pretend header font
									max_width: _initialRadius
								}).render();
						
						_body = smartText(
								_paper, _vec, _text.split("\n")[1].trim(), {
									fill: _initialTextColor, 
									font_size: _initialFontSize,
									max_width: _initialRadius
								}).render();
					
						// Hack to get baseline alignment
						var hBboxHeight = _header.getBBox().height;
						var bBboxHeight = _body.getBBox().height;
						_header.attr('y', _vec.y - ( bBboxHeight ));
						_body.attr('y', _vec.y + ( hBboxHeight / 2 ));
						
						_circle.mouseover(onmouseover);
						_circle.mouseout(onmouseout);
						_circle.click(onclick);

						_header.click(onclick);
						_body.click(onclick);
						_header.mouseover( function() { this[0].style.cursor = "pointer"} );
						_body.mouseover( function() { this[0].style.cursor = "pointer"} );
				});
			}, delay);

     
      _hello = _paper.set();
      _hello.push(
        _paper.circle( _vec.x, _vec.y, _targetRadius + 30)
          .attr('fill', _targetFillColor)
          .attr('fill-opacity', 0.2)
          .attr('stroke-opacity', 0.0), 
        _paper.circle( _vec.x, _vec.y, _targetRadius + 60)
          .attr('fill', _targetFillColor)
          .attr('fill-opacity', 0.1)
          .attr('stroke-opacity', 0.0));
      _hello.attr('opacity', 0.0);
      _hello.toBack();
    },
    
    getCircumWorldCoordsByDegrees: function() {
      throw "SmartBubble doesn't implement this method! Check your definition";
    }
  };
});

var smartText = function(paper, vec, text, opts) {
  var options = stampit.mixIn({
        font_family: "HelveticaNeueLTStd-Lt",
        fill: "#000",
        font_size: 10,
        max_width: 100
      }, opts);
  
  var writeTextInBBox = function(r_txt) {
    var words = text.split(" ");
    var tempText = "";
    for ( var i=0; i < words.length; i++ ) {
      r_txt.attr("text", tempText + " " + words[i]);
      if (r_txt.getBBox().width > options.max_width) {
        tempText += "\n" + words[i];
      } else {
        tempText += " " + words[i];
      }
    }
    r_txt.attr("text", tempText.substring(1));
  };

  return {
    render: function() {
      var body = paper.text(vec.x, vec.y, "");
      writeTextInBBox(body, text, options.max_width);
      body.attr('font-family', options.font_family);
      body.attr('fill', options.fill);
      body.attr('font-size', options.font_size);
      return body;
    }
  };
};

