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
					'less:development',<% } if (includeSASS) { %>
					'sass:development',<% } %>
					'autoprefixer'
				],
				options: {
					livereload: true
				}
			},<% if (includeLESS) { %>
			less: {
				development: {
					options: {
						paths: 'app/wp-content/themes/<%= themeName %>/'
					},
					files: {
						'app/wp-content/themes/<%= themeName %>/styles.css': 'app/wp-content/themes/<%= themeName %>/assets/less/styles.less'
					}
				},
				production: {
					options: {
						paths: 'app/wp-content/themes/<%= themeName %>/',
						cleancss: true
					},
					files: {
						'dist/wp-content/themes/<%= themeName %>/styles.css': 'app/wp-content/themes/<%= themeName %>/assets/less/styles.less'
					}
				}
			},<% } if (includeSASS) { %>
			sass: {
				development: {
					files: {
						'app/wp-content/themes/<%= themeName %>/styles.css': 'app/wp-content/themes/<%= themeName %>/assets/sass/styles.scss'
					}
				},
				production: {
					options: {
						style: 'compressed'
					},
					files: {
						'dist/wp-content/themes/<%= themeName %>/styles.css': 'app/wp-content/themes/<%= themeName %>/assets/sass/styles.scss'
					}
				}
			},<% } %>
			// The Compass integration needs to be configured
			// compass: {
			//	 files: ['app/wp-content/themes/<%= themeName %>/{,*/}*.{scss,sass}'],
			//	 tasks: ['compass:server', 'autoprefixer']
			// },		
			livereload: {
				options: {
					livereload: '<%%= connect.options.livereload %>'
				},
				files: [
					'app/wp-content/themes/<%= themeName %>/*.php',
					'app/wp-content/themes/<%= themeName %>/styles.css',
					'app/wp-content/themes/<%= themeName %>/assets/js/*.js',
					'app/wp-content/themes/<%= themeName %>/assets/img/*'
				]
			}
		},
		connect: {
			options: {
				port: 9000,
				livereload: 35729,
				// change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			livereload: {
				options: {
					open: true,
					base: [
						'.tmp',
						'app/wp-content/themes/<%= themeName %>'
					]
				}
			},
			test: {
				options: {
					base: [
						'.tmp',
						'test',
						'app/wp-content/themes/<%= themeName %>'
					]
				}
			},
			dist: {
				options: {
					open: true,
					base: 'dist'
				}
			}
		},
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'dist/*',
						'dist/.git*'
					]
				}]
			},
			server: '.tmp'
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'app/wp-content/themes/<%= themeName %>/js/{,*/}*.js',
				'!app/wp-content/themes/<%= themeName %>/js/vendor/*',
				'test/spec/{,*/}*.js'
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
				httpImagesPath: '/wp-content/themes/<%= themeName %>/img',
				httpGeneratedImagesPath: '/wp-content/themes/<%= themeName %>/img',
				httpFontsPath: '/wp-content/themes/<%= themeName %>/fonts',
				relativeAssets: false
			},
			dist: {
				options: {
					generatedImagesDir: 'dist/wp-content/themes/<%= themeName %>/img/generated'
				}
			},
			server: {
				options: {
						debugInfo: true
				}
			}
		},<% } %>
		autoprefixer: {
			options: {
				browsers: ['last 1 version']
			},
			dist: {
				files: [{
					expand: true,
					cwd: '.tmp/styles/',
					src: '{,*/}*.css',
					dest: '.tmp/styles/'
				}]
			}
		},<% if (includeRequireJS) { %>
		requirejs: {
			dist: {
				// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options: {
					// `name` and `out` is set by grunt-usemin
					baseUrl: 'app/wp-content/themes/<%= themeName %>/js',
					mainConfigFile: 'app/wp-content/themes/<%= themeName %>/assets/js/main.js',
					paths: {
						jquery: 'empty:',
						underscore: 'empty:',
						app: 'app'
					},
					dir: 'dist/assets/js',
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
		rev: {
			dist: {
				files: {
					src: [
						'dist/scripts/{,*/}*.js',
						'dist/styles/{,*/}*.css',
						'dist/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
						'dist/styles/fonts/{,*/}*.*'
					]
				}
			}
		},
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'app/wp-content/themes/<%= themeName %>/images',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: 'dist/images'
				}]
			}
		},
		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'app/wp-content/themes/<%= themeName %>/images',
					src: '{,*/}*.svg',
					dest: 'dist/images'
				}]
			}
		},
		// Put files not handled in other tasks here
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: 'app/wp-content/themes/<%= themeName %>',
					dest: 'dist',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						'images/{,*/}*.{webp,gif}',
						'styles/fonts/{,*/}*.*',
						'bower_components/sass-bootstrap/fonts/*.*'
					]
				}]
			}
		},
		concurrent: {
			server: [
				'compass',
			],
			dist: [
				'compass',
				'imagemin',
				'svgmin'
			]
		},
		bower: {
			all: {
				rjsConfig: 'app/wp-content/themes/<%= themeName %>/assets/js/main.js'
			}
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
	grunt.loadNpmTasks('grunt-bower-requirejs');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-rev');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-svgmin');
	grunt.loadNpmTasks('grunt-concurrent');


	grunt.registerTask('server', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			'concurrent:server',
			'autoprefixer',
			'connect:livereload',
			'watch'
		]);
	});

	grunt.registerTask('test', [
		'clean:server',
		'autoprefixer',
		'connect:test'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'concurrent:dist',
		'autoprefixer',
		'requirejs',
		'copy:dist',
		'rev'
	]);

	grunt.registerTask('default', [
		'jshint',
		'test',
		'build'
	]);
};
