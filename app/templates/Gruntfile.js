'use strict';

module.exports = function(grunt) {

	grunt.initConfig({
		watch: {
			css: {
				files: [<% if (includeLESS) { %>
					'app/wp-content/themes/<%= themeName %>/assets/less/*.less',
					'app/wp-content/themes/<%= themeName %>/assets/less/site/*.less'<% } if (includeSASS) { %>
					'app/wp-content/themes/<%= themeName %>/assets/sass/*.scss',
					'app/wp-content/themes/<%= themeName %>/assets/sass/site/*.scss'<% } %>
				],
				tasks: [<% if (includeLESS) { %>
					'less:development'<% } if (includeSASS) { %>
					'sass:development'<% } %>
				],
				options: {
					livereload: true
				}
			},
			js: {
				files: [
					'app/wp-content/themes/<%= themeName %>/assets/js/*.js',
					'Gruntfile.js'
				],
				tasks: ['jshint'],
				options: {
					livereload: true,
				}
			}
		},
		browser_sync: {
			files: {
				src : [
					'app/wp-content/themes/<%= themeName %>/*.css',
					'app/wp-content/themes/<%= themeName %>/assets/img/*',
					'app/wp-content/themes/<%= themeName %>/assets/js/*.js',
					'app/wp-content/themes/<%= themeName %>/{,*/}*.php'
				],
			},
			options: {
				watchTask: true
			}
		},
		<% if (includeLESS) { %>
		less: {
			development: {
				options: {
					paths: 'app/wp-content/themes/<%= themeName %>/'
				},
				files: {
					'app/wp-content/themes/<%= themeName %>/style.css': 'app/wp-content/themes/<%= themeName %>/assets/less/style.less'
				}
			},
			production: {
				options: {
					paths: 'app/wp-content/themes/<%= themeName %>/',
					cleancss: true
				},
				files: {
					'dist/wp-content/themes/<%= themeName %>/style.css': 'app/wp-content/themes/<%= themeName %>/assets/less/style.less'
				}
			}
		},<% } if (includeSASS) { %>
		sass: {
			development: {
				files: {
					'app/wp-content/themes/<%= themeName %>/style.css': 'app/wp-content/themes/<%= themeName %>/assets/sass/style.scss'
				}
			},
			production: {
				options: {
					style: 'compressed'
				},
				files: {
					'dist/wp-content/themes/<%= themeName %>/style.css': 'app/wp-content/themes/<%= themeName %>/assets/sass/style.scss'
				}
			}
		},<% } %>
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'dist/*',
						'dist/.git*'
					]
				}]
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'app/wp-content/themes/<%= themeName %>/assets/js/{,*/}*.js'
			]
		},<% if (includeSASS) { %>
		// Configuration needs to be completed
		compass: {
			options: {
				sassDir: 'app/wp-content/themes/<%= themeName %>',
				cssDir: 'app/wp-content/themes/<%= themeName %>',
				generatedImagesDir: 'app/wp-content/themes/<%= themeName %>/img',
				imagesDir: 'app/wp-content/themes/<%= themeName %>/img',
				javascriptsDir: 'app/wp-content/themes/<%= themeName %>/js',
				fontsDir: 'app/wp-content/themes/<%= themeName %>/css/fonts',
				httpImagesPath: 'app/wp-content/themes/<%= themeName %>/img',
				httpGeneratedImagesPath: 'app/wp-content/themes/<%= themeName %>/img',
				httpFontsPath: 'app/wp-content/themes/<%= themeName %>/fonts',
				relativeAssets: false
			},
			dist: {
				options: {
					generatedImagesDir: 'dist/wp-content/themes/<%= themeName %>/img/generated'
				}
			}
		},<% } if (includeRequireJS) { %>
		requirejs: {
			dist: {
				// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options: {
					// `name` and `out` is set by grunt-usemin
					baseUrl: 'app/wp-content/themes/<%= themeName %>/assets/js',
					mainConfigFile: 'app/wp-content/themes/<%= themeName %>/assets/js/main.js',
					paths: {
						jquery: 'empty:',
						underscore: 'empty:',
						app: 'app'
					},
					dir: 'dist/wp-content/themes/<%= themeName %>/assets/js',
					shim: {
						underscore: {
							deps: ['jquery'],
							exports: '_'
						},
						app: {
							deps: ['jquery', 'underscore']
						}
					}
				}
			}
		},<% } %>
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'app/wp-content/themes/<%= themeName %>/assets/img',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: 'dist/wp-content/themes/<%= themeName %>/assets/img'
				}]
			}
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'wp-content/themes/<%= themeName %>/assets/img',
					src: '{,*/}*.svg',
					dest: 'dist/wp-content/themes/<%= themeName %>/assets/img'
				}]
			}
		},
		// Put files not handled in other tasks here
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: 'app',
					dest: 'dist',
					src: [
						'*.{ico,png,txt,php}',
						'.htaccess',
						'wp-admin/*',
						'wp-includes/*',
						'wp-content/plugins/*',
						'wp-content/themes/<%= themeName %>/*.{php,md,png,css}',
						'wp-content/themes/<%= themeName %>/templates/*',
						'wp-content/themes/<%= themeName %>/lib/*',
						'wp-content/themes/<%= themeName %>/lang/*',
						'wp-content/themes/<%= themeName %>/assets/fonts/{,*/}*.*'
					]
				}]
			}
		},
		concurrent: {
			dist: [
				<% if (includeSASS) { %>
				'compass',
				<% } %>
				'imagemin',
				'svgmin'
			]
		}
	});

	// Load the Grunt plugins.
	<% if (includeLESS) { %>
	grunt.loadNpmTasks('grunt-contrib-less');
	<% } if (includeSASS) { %>
	grunt.loadNpmTasks('grunt-contrib-sass');
	<% } %>
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-svgmin');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.registerTask('build', [
		'clean:dist',
		'concurrent:dist',
		'requirejs',
		'copy:dist'
	]);

	grunt.registerTask('default', [
		'browser_sync',
		'watch',
		'jshint',
		'build'
	]);
};
