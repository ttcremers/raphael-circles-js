var BackgroundBubble = (function(vec, paper, radius) {
  var randomINTBetween = function(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  };

  // Fixed properties
  var _vec = vec;
  var _paper = paper;
  var _radius = radius;
  var _decorativePosition = randomINTBetween(1, 360); 
  
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
    var degrees = _decorativePosition; 
    // FIXME the hardcoded radius of 200 should be refactored out
    var scale = parentCircle.attrs.r / 200;

    // Small
    var v1 = getCircumWorldCoordsByDegrees(degrees);
    var c1 = _paper.circle(
        v1.x, 
        v1.y, 
        8 * scale);
    c1.attr('stroke', "#89cff0");
    c1.attr('fill', "#FFF");

    // Medium
    degrees += ( 8 * scale );
    var v2 = getCircumWorldCoordsByDegrees(degrees);
    var c2 = _paper.circle(
        v2.x, 
        v2.y, 
        16 * scale);
    c2.attr('stroke', "#89cff0");
    c2.attr('fill', "#FFF");
    
    // Large
    degrees += ((8 * scale) + (5 * scale));
    var v3 = getCircumWorldCoordsByDegrees(degrees);
    var c3 = _paper.circle(
        v3.x, 
        v3.y, 
        24 * scale);
    c3.attr('stroke', "#89cff0");
    c3.attr('fill', "#FFF");
  };
    

  return {
    update: function(vec) { 
      if ( vec ) {
        _vec = vec; 
      }
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
    },

    getCircumWorldCoordsByDegrees: getCircumWorldCoordsByDegrees
    
  };
});

var SmartBubble = (function(vec, paper, baseRadius, percent, growRate) {
  // Fixed properties
  var _paper            = paper;
  var _baseRadius       = baseRadius;
  var _growRate         = growRate;
  var _vec              = vec;
  var _percent          = percent;
  var _initialTextColor = "#89cff0"
  var _targetTextColor  = "#FFF"
  var _targetFillColor  = "#FFF"
  var _initialFillColor = "#89cff0"
 
  // Calculated based on percentages
  var _initialRadius = _baseRadius + (_baseRadius * percent); 
  var _initialFontSize = 12 + (12 * percent);  

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
    fillColor: "#FFF"
  };
  var onmouseover = function() {
    _state = _StatesEnum.MOUSEOVER;
  };
  var onmouseout = function() {
    _state = _StatesEnum.MOUSEOUT;
  };

  return {
    update: function(distance) {
      /* update internal properties */
      switch (_state) {
        case _StatesEnum.MOUSEOVER:
          var targetSize = _initialRadius + (_initialRadius * growRate);
          if ( _renderState.radiusSize < targetSize ) {
            _renderState.radiusSize += distance;  
          } 
          break;

        case _StatesEnum.MOUSEOUT:
          var targetSize = _initialRadius + (_initialRadius * growRate);
          // SVG doesn't like -0 values so let's make sure we'll never hit that
          var sizeToBe = _renderState.radiusSize - distance;
          if ( sizeToBe > targetSize ) {
            _renderState.radiusSize = sizeToBe;  
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

      circle.mouseover(onmouseover);
      circle.mouseout(onmouseout);
      circle.toFront(); 
      
      var text = _paper.text(vec.x, vec.y, text);
      txt.attr('fill', _renderState.textColor);
      txt.attr('font-size', _renderState.fontSize);
    }
  };
});

