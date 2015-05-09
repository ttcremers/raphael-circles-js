var BackgroundBubble = (function(paper, radius) {
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

    // Small
    var v1 = getCircumWorldCoordsByDegrees(_decorativeSmallPosition);
    var c1 = _paper.circle(
        v1.x, 
        v1.y, 
        8 * scale);
    c1.attr('stroke', "#89cff0");
    c1.attr('fill', "#FFF");
    c1.toBack(); 

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
    update: function(vec, distance, framecount) { 
      _vec = vec; 
    },
    
    render: function() {
      var circle = _paper.circle(
          _vec.x, 
          _vec.y, 
          _radius);
      circle.attr('fill-opacity', 0);
      circle.attr('stroke', "#89cff0");

      // We need to reset the internal Raphael counter 
      // which we don't use in our case. If we don't it
      // we'll keep incrementing with every frame
      circle.id=0;
      drawDecortiveCircles(circle);
      
      circle.toBack(); 
    },

    getCircumWorldCoordsByDegrees: getCircumWorldCoordsByDegrees
    
  };
});

var SmartBubble = (function(paper, baseRadius, percent, growRate, text) {
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

  var _StatesEnum = {
    MOUSEOVER: 0,
    MOUSEOUT: 1
  };
  var _state = _StatesEnum.MOUSEOUT;

  // Calculated in render loop
  var _renderState = {
    radiusSize: _initialRadius,
    fontSize: _initialFontSize,
    textColor: "#89cff0",
    strokeColor: "#89cff0",
    fillColor: "#FFF",
    glow: false,
    showRingsEase: 0
  };
  var onmouseover = function() {
    // Sometimes the mouse out isn't triggered, properly 
    // we'll compensate for that using this hack
    _paper.forEach(function(el) {
      el.trigger('mouseout');
    });

    _state = _StatesEnum.MOUSEOVER;
  };
  var onmouseout = function() {
    _state = _StatesEnum.MOUSEOUT;
  };

  return {
    update: function(vec, distance, framecount) {
      // Position
      _vec = vec;

      /* update internal properties */
      switch (_state) {
        case _StatesEnum.MOUSEOVER:

          var targetSize = _initialRadius + (_initialRadius * growRate);
          var targetFontSize = _initialFontSize + ( _initialFontSize * growRate );
          _renderState.fillColor = _targetFillColor;

          if (_animationFrameCount < _maxAnimationFrameCount) {
            _animationFrameCount++;
          }

          // Scale up bubble
          var step = easeOutQuad(_animationFrameCount, 
              _initialRadius, targetSize, _maxAnimationFrameCount);

          var modulu = (targetSize % step);
          if ( modulu !== targetSize ) {
            _renderState.radiusSize = step;  
          } else {
            // animation is finished chaine the next
            _renderState.glow = true;
            _animationFrameCount = 0;
          } 

          // Scale up text
          if ( _renderState.fontSize < targetFontSize ) {
            _renderState.fontSize += distance;
            _renderState.textColor = _targetTextColor;
          } 
          break;

        case _StatesEnum.MOUSEOUT:
          
          if (_animationFrameCount < _maxAnimationFrameCount) {
            _animationFrameCount++;
          }
         
          // Shrink down bubble
          var step = easeInQuad(_animationFrameCount, 
              _renderState.radiusSize, _initialRadius, _maxAnimationFrameCount);
          var sizeToBe = _renderState.radiusSize - (step - _renderState.radiusSize);

          if ( sizeToBe > _initialRadius ) {
            _renderState.radiusSize = sizeToBe;
            _renderState.glow = false;
            _renderState.fillColor = _initialFillColor;
          } else {
            _animationFrameCount = 0;
          }
          
          // Shrink down text
          var fontSizeToBe = _renderState.fontSize - distance;
          if ( fontSizeToBe > _initialFontSize ) {
            _renderState.fontSize = fontSizeToBe; 
            _renderState.textColor = _initialTextColor;
          }
          break;
      }
    },
    render: function() {
      /* render out the graphic to main paper */
      var circle = _paper.circle(
          _vec.x, 
          _vec.y, 
          _renderState.radiusSize);

      circle.attr('fill', _renderState.fillColor);
      circle.attr('stroke', _renderState.strokeColor);

      circle.mouseover(onmouseover);
      circle.mouseout(onmouseout);

      if ( _renderState.glow ) {
        var c1 = _paper.circle(
            _vec.x, 
            _vec.y, 
            _renderState.radiusSize + 30);
        var c2 = _paper.circle(
            _vec.x, 
            _vec.y, 
            _renderState.radiusSize + 60);
        
        c1.attr('fill', _renderState.fillColor);
        c2.attr('fill', _renderState.fillColor);
        c1.attr('fill-opacity', 0.2);
        c2.attr('fill-opacity', 0.1);
        c1.attr('stroke-opacity', 0.0);
        c2.attr('stroke-opacity', 0.0);
      }       

      circle.toFront(); 

      var header = smartText(
          _paper, _vec,  _text.split("\n")[0].trim(), {
            fill: _renderState.textColor, 
            font_size: _renderState.fontSize + 18, // Pretend header font
            max_width: _initialRadius
          }).render();
      
      var body = smartText(
          _paper, _vec, _text.split("\n")[1].trim(), {
            fill: _renderState.textColor, 
            font_size: _renderState.fontSize,
            max_width: _initialRadius
          }).render();
     
      // Hack to get baseline alignment
      var hBboxHeight = header.getBBox().height;
      var bBboxHeight = body.getBBox().height;
      header.attr('y', _vec.y - ( bBboxHeight ));
      body.attr('y', _vec.y + ( hBboxHeight / 2 ));
     
      // register the same listener as the circle on text 
      header.mouseover(onmouseover);
      header.mouseout(onmouseout);
      body.mouseover(onmouseover);
      body.mouseout(onmouseout);

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

Raphael.el.trigger = function(eventName) {
  if (this.events) {
    for(var i = 0, len = this.events.length; i < len; i++) {
      if (this.events[i].name == eventName) {
        this.events[i].f.call(this);
      }
    }
  }
}

