/**
 * @file
 * Integrates d3 library and functionality with D7 core javascript
 */

(function($, Drupal) {

  /**
   * Global object for holding d3 internal and visualization style methods.
   */
  Drupal.d3 = {
    draw: function(element, settings) {
      // Invoke JavaScript library function, if it exists.
      var name = settings.type.toLowerCase();
      if (Drupal.d3[name]) {
        Drupal.d3[name](element, settings);
      }
    }
  };

  /**
   * Drupal behaviors for D3 module.
   */
  Drupal.behaviors.d3 = {
    attach: function(context, settings) {
      var id, $context = $(context);
      // Check to see if there are visualizations that have been set.
      if (settings.d3 && settings.d3.inventory) {
        // Iterate over each of the visualizations set in inventory.
        for (id in settings.d3.inventory) {
          // Only process the visualization once, if it exists.
          $context.find('#' + id).once('d3', function () {
            Drupal.d3.draw(id, settings.d3.inventory[id]);
          });
        }
      }
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * Extends d3 with helper functions.
 */

/**
 * helper function to adjust Y axis based on how many text lines
 */
d3.tileText = function(str, w) {
  this.y = (!this.y) ? 0 : this.y;

  var store = this.y;
  this.y += d3.splitString(str, w).length * 25;
  return store;
}
/**
 * helper function to split a text string into an array based on a length
 */
d3.splitString = function(str, w) {
  var strArray = str.split(" ");
  var endArray = [];
  var pos = 0;

  for(var i = 0; i < strArray.length; i++) {
    if (!endArray[pos]) {
      endArray[pos] = "";
    }

    if (endArray[pos].length + strArray[i].length + 1 <= w) {
      endArray[pos] = [endArray[pos],strArray[i]].join(" ");
    }
    else {
      pos++;
      endArray[pos] = strArray[i];
    }
  }

  return endArray;
}

/**
 * Helps create blocks of text that word wrap correctly using font size.
 * 
 * @param string str
 *   String to split into multiple text elements.
 * @param number w
 *   Maximum width of a line in pixels
 * @param function addText
 *   Adds another text element to the document.
 *   @param object currentText
 *     Object containing the current text element's svg object.
 *   @param int totalBoxes
 *     The total number of boxes currently displayed.
 *   @returns object currentText
 *     Returns the new text element's svg object.
 * @returns int totalBoxes
 *   The total number of boxes used to display the string.
 */
d3.svgSplitString = function(str, w, addText) {
  var text = str.split(" ");
  var pos = 0;
  var box;
  var total = 0;
  while (pos < text.length) {
    if (!box) {
      box = addText(box, total);
      total++;
    }
    var old_HTML = box.textContent;
    box.textContent += ' ' + text[pos];
    var length = box.getComputedTextLength();
    if (length > w) {
      box.textContent = old_HTML;
      box = addText(box, total);
      box.textContent = text[pos];
      total++;
    }
    pos++;
  }
  return total;
}

/**
 * Provides a maximum width that a text box should be, and iterates from the
 * end of the text value (textContent) to the beginning until the width matches
 * the parameter.
 *
 * @param int|function value 
 *   Either a dynamic function that calculates a width, or a static number.
 *
 * @return none.
 */
d3.selection.prototype.ellipsis = function(value) {
  return arguments.length ? this.each(typeof value === "function" ? function() {
    // If a dynamic function was passed
  } : value == null ? function() {
    this.textContent = "";
  } : function() {
    // If this is just a static value and not a function

    // Do not do anything if this is already the right length.
    if (this.getComputedTextLength() > value) {
      // Starting string.
      this.textContent += '...';
      // Index of the last character of the string (without the ...).
      var index = this.textContent.length - 3;
      while (this.getComputedTextLength() >= value) {
        // Shrink string by one character, and add in again the ellipsis.
        this.textContent = this.textContent.substr(0, index) + '...';
        index--;
      }
    }
  }) : this.node().textContent;
}

/**
 * Takes a text element, and adds ellipses if it goes over a certain length.
 *
 * @param string str
 *   The string to display
 * @param svgObject box
 *   The text element that the text will go into.
 * @param float width
 *   The maximum width of the text element.
 *
 * @return none.
 */
d3.ellipses = function(str, box, width) {
  box.textContent = str;
  if (box.getComputedTextLength() > width){
    var index = 0;
    var text = '';
    var elipses = '...';
    box.textContent = text + elipses;
    var oldContent;
    while (box.getComputedTextLength() <= width) {
      text += str[index];
      index += 1;
      var oldContent = box.textContent;
      box.textContent = text + elipses;
    }
    if (oldContent) {
      box.textContent = oldContent;
    }
  }
}
;
/**
 * @file
 * D3.js tooltip extensions
 */
(function($) {
  d3 = d3 || {};

  /**
   * Creates a tooltip-like popup in svg
   *
   * @param tipjar
   *   Container to put the tooltip
   * @param x
   *   X axis of container group
   * @param y
   *   Y axis of container group
   * @param txt
   *   Text to display inside the popup
   *   @todo make more customizable
   * @param h
   *   height of container group
   * @param w
   *   width of container group
   */
  d3.tooltip = function(tipjar, txt, h, w) {

    var tooltip = {
      w: 65,
      h: 40,
      tip: {
        // The width of the triangular tip as it is on the base
        width: 12,
        // Tip length, vertically
        length: 9,
        // Tip offset point, from the very tip to the middle of the square
        offset: 22,
      },
    };

    var svg = tipjar.node();
    while (svg.tagName != "svg" && svg.parentNode) {
      svg = svg.parentNode;
    }
    w = parseInt(svg.attributes.width.textContent, 10);
    h = parseInt(svg.attributes.height.textContent, 10);

    //Precomputing the x and y attributes is difficult. Need to find a new way.
    //console.log(tipjar.node().getBBox());

    // Create a container for the paths specifically
    var img = tipjar.append("g");
    // Creates 3 identical paths with different opacities
    // to create a shadow effect
    var path = d3.tooltip.tooltipPath(tooltip);
    for (var x = 2; x >= 0; x--) {
      img.append('path')
        .attr("d", path)
        .attr("fill", (x == 0) ? '#fff' : '#ccc')
        .attr('transform', 'translate(' + x + ',' + x + ')')
        .attr('stroke', '#ccc')
        .attr('fill-opacity', function(d) {
          switch (x) {
            case 0:
              return 1;
              break;

            case 1:
              return 0.6;
              break;

            case 2:
              return 0.4;
              break;

          }
        })
        .attr('stroke-width', (x == 0) ? 1 : 0);
    }

    var offset = (tooltip.w / 2) - (tooltip.tip.offset - tooltip.tip.width);

    var textbox = tipjar.append('g')
      .attr('class', 'text')
      .attr('transform', function(d) { return 'translate(-' + offset + ',-' + tooltip.h + ')'});

    textbox.append('text')
      .text('Value:')
      .attr('text-anchor', 'start')
      .attr('dx', 5)
      .attr('dy', 8)
      .attr('font-family', 'Arial,sans-serif')
      .attr('font-size', '12')
      .attr('font-weight', 'bold');

    textbox.append('text')
      .text(txt)
      .attr('text-anchor', 'start')
      .attr('dx', 5)
      .attr('dy', 25)
      .attr('font-family', 'Arial,sans-serif')
      .attr('font-size', '12')
      .attr('font-weight', 'normal');
  };

  d3.tooltip.tooltipDefault = {
    w: 65,
    h: 40,
    // The width of the triangular tip as it is on the base
    tip : {width: 12,
    // Tip length, vertically
    length: 9,
    // Tip offset point, from the very tip to the middle of the square
    offset: 22, },
  };
  d3.tooltip.tooltipPath = function (tooltip) {
    tooltip = $.extend(true, {}, d3.tooltip.tooltipDefault, tooltip);
    return "M0,0"
      + 'l' + tooltip.tip.offset+',-' + tooltip.tip.length
      + 'l' + ((tooltip.w / 2) - tooltip.tip.width) + ',0'
      + 'l0,-' + tooltip.h + ''
      + 'l-' + tooltip.w + ',0'
      + 'l0, ' + tooltip.h
      + 'l' + (tooltip.w / 2) +',0'
      + "L0,0";
  };

})(jQuery);
;
/**
 * @file
 * D3 Line Graph library js file.
 */

(function($) {

  Drupal.d3.linegraph = function (select, settings) {
    var labels = [],
      key = settings.legend || [],
      rows = settings.rows,
      p = settings.padding || [10, 50, 70, 50],
      w = (settings.width || 900) - p[1] - p[3],
      h = (settings.height || 400),
      chart = settings.chart || {w: w * .60, h: h - p[0] - p[2] },
      legend = {w: w * .25, h:h},
      x = d3.scale.linear().domain([0,rows.length - 1]).range([20,chart.w]),
      y = d3.scale.linear().domain([0,maxValue(rows)]).range([chart.h, 0]),
      z = d3.scale.ordinal().range(["blue", "red", "orange", "green"]);

    var svg = d3.select('#' + settings.id).append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr('class', 'container')
      .append("g");

    var graph = svg.append("g")
      .attr("class", "chart")
      .attr('height', chart.h)
      .attr("transform", "translate(" + p[3] + "," + p[0] + ")");

    var data = (key.map(function(value,index) {
      return rows.map(function(d,i) {
        labels[i] = d[0];
        return {x: i, y: + d[index + 1], index: index};
      });
    }));

    // LINES
    graph.selectAll("path.line")
        .data(data)
      .enter().append("path")
        .attr("class", "line")
        .style("stroke", function(d, i) { return d3.rgb(z(i)); })
        .style("stroke-width", 3)
        .attr("d", d3.svg.line()
        .x(function(d,i) { return x(i); })
        .y(function(d) { return y(d.y); }));

    // Creates a container for each group of circles.
    var circles = graph.selectAll("g.circles")
        .data(data)
      .enter().append("g")
        .attr('class', function(d,i) { return 'circle-group-' + i; })
        .attr("fill", function(d, i) { return d3.rgb(z(i)); });

    // Container for each circle to have a outer circle, a main one, and a rollover circle.
    var circle = circles.selectAll('g')
        .data(function(d) { return d; })
      .enter().append('g');

    var defaultSize = 6;
    var expandedSize = 9;
    var sensitiveSize = 50;
    // This is the outer circle that is not visible on init.
    circle.append('circle')
        .attr('class', function(d,i) { return 'circle-outer circle-' + i + '-outer'; })
        .attr("cx", function(d,i) { return x(i); })
        .attr("cy", function(d,i) { return y(d.y); })
        .attr('fill-opacity', 0.2)
        .attr("r", defaultSize);

    circle.append('circle')
        .attr("class", function(d,i) { return 'circle circle-' + i; })
        .attr("cx", function(d,i) { return x(i); })
        .attr("cy", function(d,i) { return y(d.y); })
        .attr("r", defaultSize);


    var mouseover = function (d, i) {
      if ($.isArray(d)) d = d[i];
      // Find the sibling circle, expand radius.

      var circle = d3.select(this.parentNode.parentNode).select('.circle-outer');
      circle.attr('r', expandedSize);

      var tip = graph.select('.tooltip')
        .attr('visibility', 'visible')
        .attr('transform', function(d,i) { return 'translate(' + circle.attr('cx') + ',' + circle.attr('cy') + ')'})
        .select('.text text:last-child').text(d.y);

      var textWidth = graph.select('.tooltip .text :last-child')[0][0].getComputedTextLength();
      textWidth = textWidth < 55 ? 55 : textWidth;
      graph.select('.tooltip .text').attr('transform', 'translate(' + (10 - 5 - textWidth / 2) + ",-40)");
      graph.select('.tooltip').selectAll('path').attr("d", d3.tooltip.tooltipPath({ w: textWidth + 10, h: 40}));
    };
    var mouseout = function (d, i) {
      if ($.isArray(d)) d = d[i];
      // Find the sibling circle and reset its radius.
      d3.select(this.parentNode.parentNode).select('.circle-outer')
        .attr('r', defaultSize);

      graph.select('.tooltip').attr('visibility', 'hidden');
    };
    circle.append('clipPath').attr("id", function (d, i) { return "clip-" + d.index + "-" + i;}).append('circle')
      .attr("class", function(d,i) { return 'circle-mouse circle-' + i + '-mouse'; })
      .attr("fill", "#000000")
      .attr("color", "#000000")
      .attr("cx", function(d,i) { return x(d.x); })
      .attr("cy", function(d,i) { return y(d.y); })
      .attr("r", sensitiveSize)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);


    d3.tooltip(graph.append('g')
      .attr('class', 'tooltip')
      .attr('visibility', 'hidden'), "");

    var voronoi = d3.geom.voronoi()
      .clipExtent([[0, 0], [w, h * 0.75]])
      .x(function (d) { return x(d.x); })
      .y(function (d) { return y(d.y); });

    var vertices = data.map(function (d, i) {
      return d.map(function (d, j) {
        var result = d;
        result.i = i;
        result.j = j;
        return result;
      });
    }).reduce(function (a, b) { return a.concat(b); });

    graph.append('g')
        .attr('class', 'voronoi')
        .attr('opacity', 0)
      .selectAll('g.voronoi').data(voronoi(vertices).map(function (d, i) {
        return {path: "M" + d.join("L") + "Z", vertex: vertices[i]}; }).filter(function(n) { return n != undefined }))
        .enter().append('path')
          .attr('class', 'voronoi')
          .attr('d', function (d) { return d.path; })
          .attr('clip-path', function (d, i) { return "url(#clip-" + d.vertex.i + "-" + d.vertex.j + ")"; })
          .on('mouseover', function (d, i) {
            var circle = graph.select('.circle-group-' + d.vertex.i).select('.circle-' + d.vertex.j + '-mouse')[0][0];
            mouseover.bind(circle)(d.vertex);
          })
          .on('mouseout', function (d, i) {
            var circle = graph.select('.circle-group-' + d.vertex.i).select('.circle-' + d.vertex.j + '-mouse')[0][0];
            mouseout.bind(circle)(d.vertex);
          });

    /* X AXIS */
    var xTicks = graph.selectAll("g.ticks")
        .data(x.ticks(rows.length - 1))
      .enter().append("g")
        .attr("class","ticks")
        .attr('transform', function(d,i) { return 'translate(' + x(d) + ',' + (chart.h) + ')'});

    xTicks.append('text')
        .text(function(d,i) { return labels[i]; })
        .attr("text-anchor", "end")
        .attr('dy', '.71em')
        .attr('transform', function(d) { return "rotate(-40)"; });

    /* Y AXIS */
    var rule = graph.selectAll("g.rule")
        .data(y.ticks(8))
      .enter().append("g")
        .attr("class", "rule")
        .attr("transform", function(d) { return "translate(0," + y(d) + ")"; });

    rule.append("line")
      .attr("x2", chart.w)
      .style("stroke", function(d) { return d ? "#ccc" : "#000"; })
      .style("stroke-opacity", function(d) { return d ? .7 : null; });

    rule.append("text")
      .attr("x", -15)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(d3.format(",d"));

    /* LEGEND */
    var legend = svg.append("g")
      .attr("class", "legend")
      .attr('width', legend.w)
      .attr("transform", "translate(" + (w - legend.w) + "," + 0 + ")");

    var keys = legend.selectAll("g")
        .data(key)
      .enter().append("g")
        .attr("transform", function(d,i) { return "translate(0," + i*25 + ")"});
        // FIXME
//        .attr("transform", function(d,i) { return "translate(0," + d3.tileText(d,15) + ")"});

    keys.append("rect")
      .attr("fill", function(d,i) { return d3.rgb(z(i)); })
      .attr("width", 16)
      .attr("height", 16)
      .attr("y", 0)
      .attr("x", 0)
      .on('mouseover', function(d,i) {
        var group = graph.select('g.circle-group-' + i);
        group.selectAll('g').select('.circle-outer').attr('r', expandedSize);
      })
      .on('mouseout', function(d,i) {
        var group = graph.select('g.circle-group-' + i);
        group.selectAll('g').select('.circle-outer').attr('r', defaultSize);
      });

    var labelWrapper = keys.append("g");

    labelWrapper.selectAll("text")
        .data(function(d,i) { return d3.splitString(key[i], 15); })
      .enter().append("text")
        .text(function(d,i) { return d})
        .attr("x", 20)
        .attr("y", function(d,i) { return i * 20})
        .attr("dy", "1em");

    function maxValue(rows) {
      var data = jQuery.extend(true, [], rows);
      data = d3.merge(data);
      var max = d3.max(data.map(function(d) {
        return + d;
      }));
      return max;
    }

  }

})(jQuery);
;
