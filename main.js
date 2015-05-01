// Main module implementation (which we be moved out of this file)
var circleGridModule = function(brwsrViewPortX, brwsrViewPortY, width, height) {
  if ( typeof Raphael === 'undefined' ) {
    throw "CircleGrid depends on Raphael.js"; 
  }

  // Creates an SVG canvas
  var _paper = Raphael(brwsrViewPortX, brwsrViewPortX, width, height);
  var _circles = [];

  var circleGrid = {};

  // Returns a circle object
  circleGrid.drawCircle = function(vec, radius, fill, stroke) {
    var circle = {
      vec: vec,
      radius: radius
    }; 
        
    circle.paper = _paper.circle(circle.vec.x, circle.vec.y, circle.radius);
    if ( typeof fill !== 'undefined' ) {
      circle.paper.attr("fill", fill);
    }
    
    if ( typeof stroke !== 'undefined' ) {
      circle.paper.attr("stroke", stroke);
    } else {
      // Default stroke color is black
      circle.paper.attr("stroke", '#000');
    }

    /**
     * Helper function to make it easy to get a world point on 
     * the circomference of the circle by just specifying at 
     * which degree you'd like to know the coordinates
     *
     * @returns a vector (x,y)
     */
    circle.getCircumWorldCoordsByDegrees = function(degrees) {
      return {
        x: (circle.radius * Math.cos(degrees * Math.PI / 180.0) + circle.vec.x),
        y: (circle.radius * Math.sin(degrees * Math.PI / 180.0) + circle.vec.y)
      };
    };

    // Remeber the circle
    _circles.push(circle);
    
    return circle;
  };

  circleGrid.getAllCircles = function() {
    return _circles;  
  };

  return circleGrid;
};

