'use strict';

$(window).load(function() {
  let chart = $('#chart');
  let legend = $('#legend');
  let status = $('#status');
  let title = $('#chart-title');
  let legendTitle = $('#legend-title');
  let repoTitle = $('#repo-title');


  status.html('Retrieving Repository Metadata');
  let instance = api.instance.get();

  repoTitle.html(`Running Query on ${instance.repos.name}`);

  status.html('Running Boa Query');
  let json = api.boa.run('noa-over-revisions.boa', 'json');

  let sum = function(ar) {
    return _.reduce(ar, function(memo, num) {
      return memo + num;
    });
  }

  status.html('Formatting Data');
  let data = json['NOA'];
  let years = Object.keys(data);

  let months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let labels = _.flatten(
    _.map(years, function(y) {
      return _.map(months, function(m) {
        return m + ' ' + y + '\'';
      });
    })
  );


  let datasets = [];
  let attributes = {};
  _.each(years, function(year) {
    _.each(data[year], function(chunk, m) {
      _.each(chunk, function(val, key) {
        if (val > 0) {
           if (!(key in attributes)) {
             attributes[key] = {
               "label" : key,
               "data": {}
             }
           }
           let lbl = m + ' ' + year + '\'';
           attributes[key]['data'][lbl] = sum(val);
         }
      });
    });
  });

  legendTitle.html(`Found ${Object.keys(attributes).length} Types`);

  let options = {
    'pointDotRadius': 1,
    'scaleFontSize': 11,
    'responsive': true,
    'datasetFill': true
  }

  status.html('Drawing Legend');
  _.each(attributes, function(att, i) {
    legend.append(`<li data-att="${i}">${att.label}</li>`);
  });

  repoTitle.html(`NOA/Time for ${instance.repos.name}`);

  $('#loader').hide();
  $(document).on('click', '#legend li', function() {

    let k = $(this).data('att');
    let att = attributes[k];

    title.html(`NOA changes for ${att['label']} vs Time`);

    let datasets = [];
    let dataset = [];

    _.each(labels, function(lbl) {
      let val = lbl in att['data'] ? att['data'][lbl] : 0;
      dataset.push(val);
    });

    datasets.push({
      label: att['label'],
      fillColor: 'rgba(151,187,205,0.2)',
      strokeColor: 'rgba(151,187,205,1)',
      data: dataset
    });

    chart.html('<canvas></canvas>');
    let ctx = chart.find('canvas').get(0).getContext('2d');
    let chartData = { labels, datasets }
    new Chart(ctx).Line(chartData, options);
  });

});
