'use strict';

let handle = document.getElementById('resize-handle');
let panel = document.getElementById('panel-left');

let onDragStart = function(e) {
  console.log('dragging handle');
}

let onDragEnd = function(e) {
  // console.log('dragging stoped');
  // console.log(e);
  // panel.style.width = e.pageX + 'px';
}

let onDrag = function(e) {
  let x = e.clientX;
  if (x > 0) panel.style.width = x + 'px';
}

handle.addEventListener('dragstart', onDragStart);
handle.addEventListener('dragend', onDragEnd);
handle.addEventListener('drag', onDrag);
