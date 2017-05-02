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

/**
 * Cookie plugin 1.0
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
jQuery.cookie=function(b,j,m){if(typeof j!="undefined"){m=m||{};if(j===null){j="";m.expires=-1}var e="";if(m.expires&&(typeof m.expires=="number"||m.expires.toUTCString)){var f;if(typeof m.expires=="number"){f=new Date();f.setTime(f.getTime()+(m.expires*24*60*60*1000))}else{f=m.expires}e="; expires="+f.toUTCString()}var l=m.path?"; path="+(m.path):"";var g=m.domain?"; domain="+(m.domain):"";var a=m.secure?"; secure":"";document.cookie=[b,"=",encodeURIComponent(j),e,l,g,a].join("")}else{var d=null;if(document.cookie&&document.cookie!=""){var k=document.cookie.split(";");for(var h=0;h<k.length;h++){var c=jQuery.trim(k[h]);if(c.substring(0,b.length+1)==(b+"=")){d=decodeURIComponent(c.substring(b.length+1));break}}}return d}};
;
// $Id: jquery.drilldown.js,v 1.1.2.10.2.1 2010/09/16 18:40:02 yhahn Exp $

/**
 * Generic menu drilldown plugin for standard Drupal menu tree markup.
 * The plugin should be inited against a DOM element that *contains*
 * a Drupal ul.menu tree. Example:
 * 
 *   $('div.block-menu').drilldown('init', params);
 * 
 * You must provide the following parameters as settings:
 * 
 *   var params = {
 *     activePath : A drupal menu path that is currently active including the basePath e.g. "/mysite/node"
 *     trail : A jquery selector to the DOM element that should act as the trail container, e.g. "div.my-menu-breadcrumb-trail"
 *     rootTitle : The title to use for the root menu item if the menu does not already possess one. Optional.
 *   }
 *
 */
(function($) {
  $.fn.drilldown = function(method, settings) {
    var menu = this;
    var activePath;
    var rootTitle = settings.rootTitle || 'Home';

    switch (method) {
      case 'goTo':
        // If the passed link refers to the current page, don't follow through
        // the link.
        if (this.activePath && this.activePath === $(settings.activeLink).attr('href')) {
          return false;
        }
        return true;
      case 'setActive':
        var breadcrumb = [];
        var activeMenu;

        $(settings.activeLink).each(function() {
          // Traverse backwards through menu parents and build breadcrumb array.
          $(this).parents('ul.menu').each(function() {
            if ($(this).parents('ul.menu').size() > 0) {
              $(this).siblings('a').each(function() {
                breadcrumb.unshift($(this));
              });
            }
            // If this is a root menu with no root link to accompany it,
            // generate one such that the breadcrumb may reference it.
            else if ($(this).children('li').size() > 1) {
              var root;
              if ($(this).siblings('a.drilldown-root').size() > 0) {
                root = $(this).siblings('a.drilldown-root');
              }
              else {
                root = $('<a href="#" class="drilldown-root" style="display:none">'+rootTitle+'</a>');
                $(this).before(root);
              }
              breadcrumb.unshift(root);
            }
          });

          // If we have a child menu (actually a sibling in the DOM), use it
          // as the active menu. Otherwise treat our direct parent as the
          // active menu.
          if ($(this).next().is('ul.menu')) {
            activeMenu = $(this).next();
            breadcrumb.push($(this));
          }
          else {
            activeMenu = $(this).parents('ul.menu').eq(0);
          }
          if (activeMenu) {
            $('.drilldown-active-trail', menu).removeClass('drilldown-active-trail');
            $('ul.menu', menu).removeClass('drilldown-active-menu').removeClass('clearfix');
            $(activeMenu)
              .addClass('drilldown-active-menu').addClass('clearfix')
              .parents('li').addClass('drilldown-active-trail').show();
          }
        });

        // Render the breadcrumb to the target DOM object
        if (breadcrumb.length > 0) {
          var trail = $(settings.trail);
          trail.empty();
          for (var key in breadcrumb) {
            if (breadcrumb[key]) {
              // We don't use the $().clone() method here because of an
              // IE & jQuery 1.2 bug.
              var clone = $('<a></a>')
                .attr('href', $(breadcrumb[key]).attr('href'))
                .attr('class', $(breadcrumb[key]).attr('class'))
                .html($(breadcrumb[key]).html())
                .addClass('depth-'+key)
                .appendTo(trail);

              // We add a reference to the original link and a click handler
              // that traces back to that instance to set as the active link.
              $('a.depth-'+key, trail)
                .data('original', $(breadcrumb[key]))
                .click(function() {
                  settings.activeLink = $(this).data('original');
                  // If the clicked link does not reference the current
                  // active menu, set it to be active.
                  if (settings.activeLink.siblings('ul.drilldown-active-menu').size() === 0) {
                    menu.drilldown('setActive', settings);
                    return false;
                  }
                  // Otherwise, pass-through and allow the link to be clicked.
                  return menu.drilldown('goTo', settings);
                });
            }
          }
        }

        // Event in case others need to update themselves when a new active
        // link is set.
        $(menu).trigger('refresh.drilldown');
        break;
      case 'init':
        if ($('ul.menu ul.menu', menu).size() > 0) {
          $(menu).addClass('drilldown');
          $(settings.trail).addClass('drilldown-trail');

          // Set initial active menu state.
          var activeLink;
          $('ul.menu a', menu).removeClass('active');
          if (settings.activePath && $('ul.menu a[href='+settings.activePath+']', menu).size() > 0) {
            this.activePath = settings.activePath;
            activeLink = $('ul.menu a[href='+settings.activePath+']', menu).addClass('active');
          }
          if (!activeLink) {
            activeLink = $('ul.menu a.active', menu).size() ? $('ul.menu a.active', menu) : $('ul.menu > li > a', menu);
          }
          if (activeLink) {
            menu.drilldown('setActive', {
              activeLink: $(activeLink[0]),
              trail: settings.trail,
              rootTitle: rootTitle
            });
          }

          // Attach click handlers to menu items
          $('ul.menu li:has(ul.menu)', this).click(function() {
            if ($(this).parent().is('.drilldown-active-menu')) {
              if (menu.data('disableMenu')) {
                return true;
              }
              else {
                var url = $(this).children('a').attr('href');
                var activeLink = $('ul.menu a[href='+url+']', menu);
                menu.drilldown('setActive', {
                  activeLink: activeLink,
                  trail: settings.trail,
                  rootTitle: rootTitle
                });
                return false;
              }
            }
          });
          $('ul.menu li:has(ul.menu) a', menu).click(function() {
            menu.data('disableMenu', true);
          });
        }
        break;
    }
    return this;
  };
})(jQuery);
;
// $Id: admin.toolbar.js,v 1.1.2.9.2.4 2010/12/16 22:47:18 yhahn Exp $
(function($) {

Drupal.behaviors.adminToolbar = {};
Drupal.behaviors.adminToolbar.attach = function(context) {
  $('#admin-toolbar:not(.processed)').each(function() {
    var toolbar = $(this);
    toolbar.addClass('processed');

    // Set initial toolbar state.
    Drupal.adminToolbar.init(toolbar);

    // Admin toggle.
    $('.admin-toggle', this).click(function() { Drupal.adminToolbar.toggle(toolbar); });

    // Admin tabs.
    $('div.admin-tab', this).click(function() { Drupal.adminToolbar.tab(toolbar, $(this), true); });

    $(document).bind('drupalOverlayLoad', {adminToolbar: Drupal.adminToolbar, toolbar: toolbar}, function(event) {
      var body = $(document.body);
      var adminToolbar = event.data.adminToolbar;
      var expand = parseInt(adminToolbar.getState('expanded'));
      if (!expand) {
        $('iframe.overlay-active').contents().find('body').css({marginLeft:0, marginTop: 0});
        return;
      }
      var toolbar = event.data.toolbar;
      var size = adminToolbar.SIZE + 'px';
      if(toolbar.attr('class').split(' ')[1] === 'vertical') {
        $('iframe.overlay-element').contents().find('body').css('marginLeft', size);
      }
      else {
        $('iframe.overlay-element').contents().find('body').css('marginTop', size);
      }
    });
  });
  $('div.admin-panes:not(.processed)').each(function() {
    var panes = $(this);
    panes.addClass('processed');

    $('h2.admin-pane-title a').click(function() {
      var target = $(this).attr('href').split('#')[1];
      var panes = $(this).parents('div.admin-panes')[0];
      $('.admin-pane-active', panes).removeClass('admin-pane-active');
      $('div.admin-pane.' + target, panes).addClass('admin-pane-active');
      $(this).addClass('admin-pane-active');
      return false;
    });
  });
};

/**
 * Admin toolbar methods.
 */
Drupal.adminToolbar = {};

/**
 * The width or height of the toolbar, depending on orientation.
 */
Drupal.adminToolbar.SIZE = 260;

/**
 * Set the initial state of the toolbar.
 */
Drupal.adminToolbar.init = function (toolbar) {
  // Set expanded state.
  var expanded = this.getState('expanded');
  if (!$(document.body).hasClass('admin-ah')) {
    if (expanded == 1) {
      $(document.body).addClass('admin-expanded');
    }
  }

  // Set default tab state.
  var target = this.getState('activeTab');
  if (target) {
    if ($('div.admin-tab.'+target).size() > 0) {
      var tab = $('div.admin-tab.'+target);
      this.tab(toolbar, tab, false);
    }
  }

  // Add layout class to body.
  var classes = toolbar.attr('class').split(' ');
  if (classes[0] === 'nw' || classes[0] === 'ne' || classes[0] === 'se' || classes[0] === 'sw' ) {
    $(document.body).addClass('admin-'+classes[0]);
  }
  if (classes[1] === 'horizontal' || classes[1] === 'vertical') {
    $(document.body).addClass('admin-'+classes[1]);
  }
  if (classes[2] === 'df' || classes[2] === 'ah') {
    $(document.body).addClass('admin-'+classes[2]);
  }
};

/**
 * Set the active tab.
 */
Drupal.adminToolbar.tab = function(toolbar, tab, animate) {
  if (!tab.is('.admin-tab-active')) {
    var target = $('span', tab).attr('id').split('admin-tab-')[1];

    // Vertical
    // Use animations to make the vertical tab transition a bit smoother.
    if (toolbar.is('.vertical') && animate) {
      $('.admin-tab-active', toolbar).fadeOut('fast');
      $(tab).fadeOut('fast', function() {
        $('.admin-tab-active', toolbar).fadeIn('fast').removeClass('admin-tab-active');
        $(tab).slideDown('fast').addClass('admin-tab-active');
        Drupal.adminToolbar.setState('activeTab', target);
      });
    }
    // Horizontal
    // Tabs don't need animation assistance.
    else {
      $('div.admin-tab', toolbar).removeClass('admin-tab-active');
      $(tab, toolbar).addClass('admin-tab-active');
      Drupal.adminToolbar.setState('activeTab', target);
    }

    // Blocks
    $('div.admin-block.admin-active', toolbar).removeClass('admin-active');
    $('#block-'+target, toolbar).addClass('admin-active');
  }
  return false;
};

/**
 * Set the width/height of the of the overlay body based on the state admin toolbar.
 *
 * @param vertical
 *   A boolean indicating if the toolbar is vertical.
 * @param expanded
 *   A boolean indicating if the toolbar is expanded.
 */
Drupal.adminToolbar.setOverlayState = function(vertical, expanded) {
  var width = this.SIZE;
  if (!expanded) {
    width = 0;
  }
  if (vertical) {
    $('iframe.overlay-element').contents().find('body').animate({marginLeft: width+'px'}, 'fast');
  }
  else {
    $('iframe.overlay-element').contents().find('body').animate({marginTop: width+'px'}, 'fast');
  }
};

/**
 * Toggle the toolbar open or closed.
 */
Drupal.adminToolbar.toggle = function (toolbar) {
  var size = '0px';
  if ($(document.body).is('.admin-expanded')) {
    if ($(toolbar).is('.vertical')) {
      $('div.admin-blocks', toolbar).animate({width:size}, 'fast');
      if ($(toolbar).is('.nw') || $(toolbar).is('sw')) {
        $(document.body).animate({marginLeft:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      else {
        $(document.body).animate({marginRight:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      this.setOverlayState(true, false);
    }
    else {
      $('div.admin-blocks', toolbar).animate({height:size}, 'fast');
      if ($(toolbar).is('.nw') || $(toolbar).is('ne')) {
        $(document.body).animate({marginTop:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      else {
        $(document.body).animate({marginBottom:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
    }
    this.setOverlayState(false, false);
    this.setState('expanded', 0);
  }
  else {
    size = this.SIZE + 'px';
    if ($(toolbar).is('.vertical')) {
      $('div.admin-blocks', toolbar).animate({width:size}, 'fast');
      if ($(toolbar).is('.nw') || $(toolbar).is('sw')) {
        $(document.body).animate({marginLeft:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      else {
        $(document.body).animate({marginRight:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      this.setOverlayState(true, true);
    }
    else {
      $('div.admin-blocks', toolbar).animate({height:size}, 'fast');
      if ($(toolbar).is('.nw') || $(toolbar).is('ne')) {
        $(document.body).animate({marginTop:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      else {
        $(document.body).animate({marginBottom:size}, 'fast', function() { $(this).toggleClass('admin-expanded'); });
      }
      this.setOverlayState(false, true);
    }
    if ($(document.body).hasClass('admin-ah')) {
      this.setState('expanded', 0);
    }
    else {
      this.setState('expanded', 1);
    }
  }
};

/**
 * Get the value of a cookie variable.
 */
Drupal.adminToolbar.getState = function(key) {
  if (!Drupal.adminToolbar.state) {
    Drupal.adminToolbar.state = {};
    var cookie = $.cookie('DrupalAdminToolbar');
    var query = cookie ? cookie.split('&') : [];
    if (query) {
      for (var i in query) {
        // Extra check to avoid js errors in Chrome, IE and Safari when
        // combined with JS like twitter's widget.js.
        // See http://drupal.org/node/798764.
        if (typeof(query[i]) == 'string' && query[i].indexOf('=') != -1) {
          var values = query[i].split('=');
          if (values.length === 2) {
            Drupal.adminToolbar.state[values[0]] = values[1];
          }
        }
      }
    }
  }
  return Drupal.adminToolbar.state[key] ? Drupal.adminToolbar.state[key] : false;
};

/**
 * Set the value of a cookie variable.
 */
Drupal.adminToolbar.setState = function(key, value) {
  var existing = Drupal.adminToolbar.getState(key);
  if (existing != value) {
    Drupal.adminToolbar.state[key] = value;
    var query = [];
    for (var i in Drupal.adminToolbar.state) {
      query.push(i + '=' + Drupal.adminToolbar.state[i]);
    }
    $.cookie('DrupalAdminToolbar', query.join('&'), {expires: 7, path: '/'});
  }
};

})(jQuery);;
// $Id: admin.menu.js,v 1.1.2.9.2.2 2010/12/16 21:43:54 yhahn Exp $
(function($) {

Drupal.behaviors.adminToolbarMenu = {};
Drupal.behaviors.adminToolbarMenu.attach = function(context) {
  if (jQuery().drilldown) {
    $('#admin-toolbar div.admin-block:has(ul.menu):not(.admin-toolbar-menu)')
      .addClass('admin-toolbar-menu')
      .each(function() {
        var menu = $(this);
        var trail = '#admin-toolbar div.admin-tab.' + $(this).attr('id').split('block-')[1] + ' span';
        var rootTitle = $(trail).text();

        if ($('a:has(span.menu-description)', menu).size() > 0) {
          menu.addClass('admin-toolbar-menu-hover');
          $('a:has(span.menu-description)', menu).hover(
            function() {
              $('<a></a>')
                .attr('class', $(this).attr('class'))
                .addClass('menu-hover')
                .addClass('overlay-exclude')
                .append($('span.menu-description', this).clone())
                .appendTo(menu)
                .show();
            },
            function() {
              $(menu)
                .children('a.menu-hover')
                .remove();
            }
          );
        }

        // Replace the standard trail click handler with one that only
        // adjusts menu if the admin tab is active. Otherwise, switch
        // to that admin tab.
        menu.bind('refresh.drilldown', function() {
          $(trail + ' a').unbind('click').click(function() {
            if ($(this).parents('div.admin-tab').is('.admin-tab-active')) {
              var settings = {'activeLink': $(this).data('original'), 'trail': trail};

              // If the clicked link does not reference the current
              // active menu, set it to be active.
              if (settings.activeLink.siblings('ul.drilldown-active-menu').size() === 0) {
                menu.drilldown('setActive', settings);
                return false;
              }
              // Otherwise, pass-through and allow the link to be clicked.
              return menu.drilldown('goTo', settings);
            }
            $(this).parents('div.admin-tab').click();
            return false;
          });
        });

        // Init drilldown plugin.
        menu.drilldown('init', {
          activePath: Drupal.settings.activePath,
          trail: trail,
          rootTitle: rootTitle
        });
      });
  }
};

})(jQuery);;
