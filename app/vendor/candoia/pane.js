'use strict';
//
// module.exports.Pane = class Pane {
//   constructor(container
// }

let $ = require('jquery');

function makeTab(options) {
  return `
    <div class='tab' id='tab-${options.appId}'>
      <i id='tab-close-${options.appId}' class='close fa fa-fw fa-close'></i>
      <span class='tab-title'>
        <i class='fa fa-fw fa-${options.icon}'></i>
        ${options.title}
      </span>
    </div>
  `;
}

function removeTab(id) {
  var e = $(`#tab-${id}`);
  var container = e.parent();
}

function showApp() {
}

function insertTab(pane) {
  var tabs = pane.find('.tab-container');
}


function makeAppPane(options) {
  return `
  <div class='pane active' style='flex-grow: 1'>
    <div class='tab-container'>
      <div class='tab'>
        <i class='close fa fa-fw fa-close'></i>
        <span class='tab-title'>
          <i class='fa fa-fw fa-fire'></i> Number of Attributes over Revisions
        </span>
      </div>
      <div class='tab'>
        <i class='close fa fa-fw fa-close'></i>
        <span class='tab-title'>
          <i class='fa fa-fw fa-terminal'></i> Terminal
        </span>
      </div>
    </div>
    <div class='pane-header'>
      <i id='pane-close-${options.count}'  data-id='${options.count}' class='close fa fa-fw fa-close'></i>
      <span class='pane-title'></span>
    </div>
    <div class='pane-content'>
      <div class='pane-body-container'>
        <div class='pane-body'>
        </div>
      </div>
    </div>
  </div>
  `;
};

function makeVerticalPaneDiv(options) {
  return `
    <div class='pane-axis vertical' style='flex-grow: 1'>
      <div class='pane-axis horizontal' style='flex-grow: 1'>
        ${options.content}
      </div>
    </div>
  `;
};

function makeHorizontalPaneDiv(options) {
  return `
    <div class='pane-axis horizontal' style='flex-grow: 1'>
      ${options.content}
    </div>
  `;
}

function PaneInstance(handle, index) {
  this.handle = handle;
  this.index = index;
  return this;
};

function insertPane(pane, state, container) {
  let furthestVertical = state.arrangement[state.arrangement.length - 1];
  let handle = container;
  if(furthestVertical.length == 1) {
    furthestVertical.push(new PaneInstance(pane, state.count));
    $(container[0].children[state.arrangement.length - 1]).append(makeHorizontalPaneDiv({content:pane}));
  } else if(furthestVertical.length == 2) {
    state.arrangement.push([new PaneInstance(pane, state.count)]);
    container.append(makeVerticalPaneDiv({content: pane}));
  } else if(furthestVertical.length == 0) {
    furthestVertical.push(new PaneInstance(pane, state.count));
    container.append(makeVerticalPaneDiv({content:pane}));
  }
  handle = $('.active');
  handle.removeClass('active');
  return handle;
}

function deleteFromArrangement(id, arrangement) {
  for(var i = 0; i < arrangement.length; i++) {
    for(var j = 0; j < arrangement[i].length; j++) {
      if(arrangement[i][j].index == id) {
        if(j == (arrangement[i].length - 1) && i != 0) {
          arrangement.splice(i, 1);
        } else {
          arrangement[i].splice(j, 1);
        }
      }
    }
  }
};

function isLower(id, arrangement) {
  for(var i = 0; i < arrangement.length; i++) {
    for(var j = 0; j < arrangement[i].length; j++) {
      if(arrangement[i][j].index == id) {
        return arrangement[i];
      }
    }
  }
};


module.exports = new function() {
  this.state = {
    'count': 0,
    'arrangement': [[]],
  };

  this.addPane = function createPane(options) {
    let container = $('#pane-root');
    let newPaneHandle = $(container[0].children[container[0].children.length - 1]);
    this.state.count++;
    let paneQuery = insertPane(makeAppPane({'count': this.state.count}), this.state, container);
    $(document).on('click', `#pane-close-${this.state.count}`, function(event) {
      let id =  $(event.target).data('id');
      this.removePane(id);
    }.bind(this));
    return paneQuery;
  };

  this.removePane = function removePane(id, options) {
    if(isLower(id, this.state.arrangement).length == 2) {
      $(event.target.offsetParent.parentNode).remove();
    } else {
      $(event.target.offsetParent.parentNode.parentNode).remove();
    }
    deleteFromArrangement(id, this.state.arrangement);
  };

  return this;
}();
