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


function makeModal(options) {
  return  `
  <div class='modal'>
    <div class='modal-header'><i class='fa fa-fw fa-book'></i> Add Repository</div>
    <div class='modal-content'>
      <label class='modal-label' for='input-repo-name'>
        Name
      </label>
      <div class='modal-input'>
        <input id='input-repo-name' type='text'>
      </div>
      <label class='modal-label' for='input-repo-location'>
        Absolute Path
      </label>
      <div class='modal-input'>
        <input id='input-repo-location' type='text'>
      </div>
      <div class='modal-actions'>
        <button id='confirm-repo-add' class='modal-confirm' type='button'>confirm</button>
        <button id='cancel-repo-add' class='modal-cancel' type='button'>cancel</button>
      </div>
    </div>
  </div>`
}

let curtain = $('.curtain');

$(document).on('click', '#insert-repo', function() {
  let modal = $(makeModal());
  modal.hide();
  curtain.html(modal);
  curtain.fadeIn(250, function() {
    modal.slideDown();
  });
});

$(document).on('click', '#confirm-repo-add', function() {
  let name = $('#input-repo-name').val();
  let location = $('#input-repo-location').val();
  $('.modal-content').html('<i class="fa fa-fw fa-cog fa-spin fa-lg"></i>');
  $('.modal-content').css('text-align', 'center');

  db.repository.insert({
    'name': name,
    'local': location
  }, function(err, newDoc) {
    if (err) {
      $('.modal-content').html(`<pre>${err}</pre><br /><button type='button' id='cancel-repo-add' class='modal-cancel'>cancel</button>`);
    } else {
      loadRepos();
      curtain.fadeOut(500);
      curtain.html('');
    }
  });
});

$(document).on('click', '#cancel-repo-add', function() {
  curtain.fadeOut(500);
  curtain.html('');
});
