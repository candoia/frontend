'use strict';
$(window).load(function() {
	let json = api.boa.run('top-ten-commits.boa');
	$('#loading').hide();
	$('#content').show();
	let count = 0;
	let labels = [];
	let dataset = [];
	for(let index in json.out["[]"]) {
		count++;
		let label =
			$('#table-output-body').append(`<tr><td> ${count} </td> <td> ${index} </td> <td> ${json.out["[]"][index]} </td> </tr>`)
			labels.push(index);
		dataset.push(json.out["[]"][index]);
	}
	let chartData = {
			labels: labels,
			datasets: [{
				fillColor: '#ff8080',
				strokeColor: '#bf6060',
				data: dataset
			}]
	}

	let canvas = document.createElement('canvas');
	canvas.setAttribute('width', '400px');
	canvas.setAttribute('height', '300px');
	canvas.id = "chart-output";
	$('#content').prepend(canvas);

	let ctx = canvas.getContext('2d');
	new Chart(ctx).Bar(chartData, { 'responsive': true, });
});
