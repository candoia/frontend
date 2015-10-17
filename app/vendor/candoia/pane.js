'use strict';
//
// module.exports.Pane = class Pane {
//   constructor(container
// }

let $ = require('jquery');

function makeAppPane(options) {
  return `
  <div class='pane active' style='flex-grow: 1'>
    <div class='pane-header'>
      <i id='pane-close-${options.count}' class='close fa fa-fw fa-close'></i>
      <span class='pane-title'></span>
    </div>
    <div class='pane-content'>
      <div class='pane-body-container'>
        <div class='pane-body'>
        </div>
      </div>
    </div>
    <span class='pane-splitter'><span>
  </div>
  `;
};



module.exports = new function() {
  this.state = {
    'count': 1,
    'arrangement': [[],[]],
  };

  this.addPane = function createPane(options) {
    let container = $('#pane-root');
    this.state.count++;
    console.log(container.append(makeAppPane({'count': this.state.count})));
    $(document).on('click', `#pane-close-${this.state.count}`, function(event) {
      $(event.target.offsetParent).remove();
      this.state.count = $('#pane-root')[0].childElementCount;
    });
  };

  this.removePane = function removePane(id, options) {
    $(event.target.offsetParent).remove();
    panes.count = $('#pane-root')[0].childElementCount;
  };


  return this;
}();
