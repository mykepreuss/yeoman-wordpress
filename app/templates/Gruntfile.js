'use strict';

module.exports = function(grunt) {
	var app = 'app/wp-content/themes/<%= themeName %>/';
	var dist = 'dist/wp-content/themes/<%= themeName %>/';

	grunt.initConfig({
		watch: {
			css: {
				files: [<% if (includeLESS) { %>
					app + '/assets/less/*.less',
					app + '/assets/less/site/*.less',<% } if (includeSASS) { %>
					app + '/assets/sass/*.scss',
					app + '/assets/sass/site/*.scss'<% } %>
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
					app + '/assets/js/*.js',
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
					app + '*.css',
					app + 'assets/img/*',
					app + 'assets/js/*.js',
					app + '{,*/}*.php'
				],
			},
			options: {
				watchTask: true,
				host: '<%= themeName %>',
				port: 8888
			}
		}, <% if (includeLESS) { %>
		less: {
			development: {
				options: {
					sourceMap: true,
					sourceMapFilename: app + '/style.css.map',
					sourceMapURL: '/wp-content/themes/<%= themeName %> /style.css.map',
					sourceMapBasepath: 'public',
					sourceMapRootpath: '/'
				},
				files: {
					'app/wp-content/themes/<%= themeName %>/style.css': 'app/wp-content/themes/<%= themeName %>/assets/less/style.less'
				}
			},
			dist: {
				options: {
					paths: app,
					sourceMap: false,
					cleancss: true,
					compress: true
				},
				files: {
					'dist/wp-content/themes/<%= themeName %>/style.css': 'app/wp-content/themes/<%= themeName %>/assets/less/style.less'
				}
			}
		},<% } if (includeSASS) { %>
		sass: {
			development: {
				options: {
					sourceMap: true,
					sourceMapFilename: app + 'style.css.map',
					sourceMapURL: '/wp-content/themes/<%= themeName %> /style.css.map',
					sourceMapBasepath: 'public',
					sourceMapRootpath: '/'
				},
				files: {
					'app/wp-content/themes/<%= themeName %>/style.css': 'app/wp-content/themes/<%= themeName %>/assets/sass/style.scss'
				}
			},
			dist: {
				options: {
					style: 'compressed',
					sourceMap: false
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
				app + 'assets/js/{,*/}*.js'
			]
		},<% if (includeSASS) { %>
		// Configuration needs to be completed
		compass: {
			options: {
				sassDir: app,
				cssDir: app,
				generatedImagesDir: app + 'img',
				imagesDir: app + 'img',
				javascriptsDir: app + 'js',
				fontsDir: app + 'css/fonts',
				httpImagesPath: app + 'img',
				httpGeneratedImagesPath: app + 'img',
				httpFontsPath: app + 'fonts',
				relativeAssets: false
			},
			dist: {
				options: {
					generatedImagesDir: dist + 'img/generated'
				}
			}
		},<% } if (includeRequireJS) { %>
		requirejs: {
			dist: {
				// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options: {
					// `name` and `out` is set by grunt-usemin
					baseUrl: app + 'assets/js',
					mainConfigFile: app + 'assets/js/main.js',
					paths: {
						jquery: 'empty:',
						underscore: 'empty:',
						app: 'app'
					},
					dir: dist + 'assets/js',
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
					cwd: app + 'assets/images',
					src: '**/*.{png,jpg,jpeg}',
					dest: dist + 'assets/images'
				}],
				options: {
					cache: false
				}
			}
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: app + 'assets/images',
					src: '**/*.svg',
					dest: dist + 'assets/images'
				}]
			}
		},
		preprocess: {
			dev: {
				options: {
					context: {
						NODE_ENV: 'DEVELOPMENT'
					},
				},
				files: {
					'app/wp-content/themes/<%= themeName %>/base.php': 'app/wp-content/themes/<%= themeName %>/base-template.html'
				},
			},
			dist: {
				options: {
					context: {
						NODE_ENV: 'PRODUCTION'
					},
				},
				files: {
					'dist/wp-content/themes/<%= themeName %>/base.php': 'app/wp-content/themes/<%= themeName %>/base-template.html'
				},
			},
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
		hashres: {
			options: {
				encoding: 'utf8',
				fileNameFormat: '${name}.${ext}?${hash}',
				renameFiles: false
			},
			css: {
				src: [
					dist + 'style.css'
				],
				dest: dist + 'templates/head.php',
			}
		},
		concurrent: {
			dev: ['clean:dist', 'preprocess:dev'],
			build1: ['imagemin:dist', 'copy:dist', <% if (includeLESS) { %> 'less:dist' <% } %>, if (includeSASS) { %>'sass:dist'<% } %>],
			build2: ['preprocess:dist', 'svgmin:dist']
		}
	});

	// Load the Grunt plugins.
	<% if (includeLESS) { %>
	grunt.loadNpmTasks('grunt-contrib-less');<% } if (includeSASS) { %>
	grunt.loadNpmTasks('grunt-contrib-sass');<% } %>
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-svgmin');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-hashres'); <% if (includeRequireJS) { %>
	grunt.loadNpmTasks('grunt-contrib-requirejs'); <% } %>

	grunt.registerTask('build', [
		'clean:dist',
		'concurrent:build1',
		'concurrent:build2',
		'requirejs',
		'hashres'
	]);

	grunt.registerTask('dev', [
		'concurrent:dev',
		'browser_sync',
		'watch'
	]);
};
