require.config({
	paths: {
		jquery: [
			'//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min',
			'../bower_components/jquery/jquery.min'
		],
		underscore: [
			'//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min',
			'../bower_components/underscore/underscore-min'
		],
		app: 'app'
	},
	shim: {
		underscore: {
			deps: ['jquery'],
			exports: '_'
		},
		app: {
			deps: ['jquery', 'underscore']
		}
	}
});

require([
	'jquery',
	'underscore',
	'app'
]);