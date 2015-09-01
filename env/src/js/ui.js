'use strict';


let toggle = $('#side-panel-toggle');
let panel = $('#side-panel');
let open = true;
let w = '200px';

$('#side-panel-toggle').on('click', function() {
  open = !open;
  panel.css('width',open ? w : 0);
  let dir = open ? 'left' : 'right';
  toggle.html(`<i class="fa fa-fw fa-angle-double-${dir}"></i>`);
});

let ACTIVE_PANE = $('.pane.active');

$(document).on('click', '.pane-header', function() {
  ACTIVE_PANE.removeClass('active');
  ACTIVE_PANE = $(this).parent();
  ACTIVE_PANE.addClass('active');
});
