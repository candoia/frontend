'use strict';	
$('#content').hide();
let json = api.boa.run('hotfiles.boa');
$('#loading').hide();
$('#content').show();
//console.log(json);
let count = 0;
for(let index in json.out["[]"]) {
	count++;
	let label = 
		$('#table-output-body').append(`<tr><td> ${count} </td> <td> <i>${index}</i> </td> <td> ${json.out["[]"][index]} </td> </tr>`)
}



