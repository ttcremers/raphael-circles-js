// size/property tracking object
var FrameAgnosticProperties = (function() {
  var registry = [];
  var fap = {};

  fap.newSize = function(radius) {
    var size = radius;
    var targetSize = radius;
    var obj =  {
      getSize: function() {
        return size; 
      },
      setSize: function(s) {
        size = s;
      },
      setTargetSize: function(s) {
        targetSize = s;
      },
      getTargetSize: function() {
        return targetSize; 
      }    
    };
    registry.push(obj);
    return obj;
  };

  fap.getOrCreateSize = function(id, radius) {
    if ( typeof registry[id] === 'undefined' ) {
      return fap.newSize(radius); 
    } 
    return registry[id];
  };

  fap.getSizeForID = function(id) {
    return registry[id]; 
  };

  fap.getAllSizes = function() {
    return registry; 
  };

  return fap;
})();

// Main module implementation (which we be moved out of this file)
var circleGridModule = function(brwsrViewPortX, brwsrViewPortY, width, height) {
  if ( typeof Raphael === 'undefined' ) {
    throw "CircleGrid depends on Raphael.js"; 
  }

  // Creates an SVG canvas
  var _paper = Raphael(brwsrViewPortX, brwsrViewPortX, width, height);
  var _circles = [];

  var circleGrid = {};
  circleGrid.internalCounter = 0; // Used for creating internal circle ID

  // Returns a circle object
  circleGrid.createCircle = function(vec, radius, fill, stroke) {
    var circle = {
      vec: vec,
      radius: radius,
      id: circleGrid.internalCounter
    }; 

    /**
     * Helper function to make it easy to get a world point on 
     * the circomference of the circle by just specifying at 
     * which degree you'd like to know the coordinates
     *
     * @returns a vector (x,y)
     */
    circle.getCircumWorldCoordsByDegrees = function(degrees) {
      return {
        x: (radius * Math.cos(degrees * Math.PI / 180.0) + circle.vec.x),
        y: (radius * Math.sin(degrees * Math.PI / 180.0) + circle.vec.y)
      };
    };
    
    circle.element = _paper.circle(circle.vec.x, circle.vec.y, radius);
    
    if ( typeof fill !== 'undefined' ) {
      circle.element.attr("fill", fill);
    } else {
      circle.element.attr("fill", '#FFF');
    }
    
    if ( typeof stroke !== 'undefined' ) {
      circle.element.attr("stroke", stroke);
    } else {
      // Default stroke color is black
      circle.element.attr("stroke", '#000');
    }
    circle.fill =  circle.element.attr("fill");
    circle.stroke = circle.element.attr("stroke"); 

    circle.isDrawn = true;

    // Remeber the circle
    _circles[circleGrid.internalCounter] = circle;
    circleGrid.internalCounter++;
    
    return circle;
  };

  circleGrid.getAllCircles = function() {
    return _circles;  
  };
  
  circleGrid.getMainPaper = function() {
    return _paper;  
  };

  circleGrid.drawAll = function() {
    for (var i = 0; i < _circles.length; i++) {
      c = _circles[i];
      c.draw();
    }
  };
  
  circleGrid.resetInternalCounter = function() {
    circleGrid.internalCounter = 0;
  }

  return circleGrid;
};

