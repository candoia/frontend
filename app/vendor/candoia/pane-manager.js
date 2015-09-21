'use strict';

let $ = require('jquery');

let master = $('.pane-container.master');

var oldx = 0;
var oldy = 0;
var direction = '';

var btnDown = false;
var isDragging = false;

$(document).on('mousedown', '.pane-splitter', function(e) {
  console.log('click splitter');
  btnDown = true;
  isDragging = true;
});

$(document).on('mousemove', function(e) {
  if (isDragging && e.buttons == 1) {
    console.log(e.pageX, e.pageY);
  }
});

$(document).on('mouseup', function(e) {
  if (btnDown) {
    console.log('release splitter');
    isDragging = false;
    btnDown = false;
  }
});
