Chart.defaults.global.defaultFontColor = '#ccc';

function generateRadarChart(canvasElm, data) {
    var config = {
    	type: 'radar',
    	data: data,
    	options: {
    		legend: {
    			display: false,
    		},
    		tooltips: {
                enabled: true,
                callbacks: {
                    label: function(tooltipItem, data) {
                        return data.datasets[tooltipItem.datasetIndex].label + ' : ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    }
                }
            },
    		scale: {
    			ticks: {
    			    display: false,
    			    min: 0,
    			    max: 10,
    			    stepSize: 2,
    			}
    		}
    	}
    };
    new Chart(canvasElm, config);
}
function generatePatchChart(canvasElm, data) {
    var config = {
    	type: 'line',
    	data: data,
    	options: {
    		legend: {
    			display: false,
    		}
    	}
    };
    new Chart(canvasElm, config);
}