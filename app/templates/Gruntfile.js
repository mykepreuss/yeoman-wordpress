'use strict';

module.exports = function(grunt) {
	var app = 'app/wp-content/themes/<%= themeName %>/';
	var dist = 'dist/wp-content/themes/<%= themeName %>/';
	var projectName = '<%= projectName %>'.replace(/\ /g, '').toLowerCase();

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	require('time-grunt')(grunt);

	// Project configuration.
	grunt.initConfig({
		watch: {
			css: {
				files: [
					app + 'assets/less/*.less',
					app + 'assets/less/site/*.less'
				],
				tasks: [
					'less:development',
					'autoprefixer'
				],
				options: {
					livereload: true
				}
			},
			js: {
				files: [
					app + 'assets/js/*.js',
					'Gruntfile.js'
				],
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			}
		},
		browserSync: {
			files: {
				src : [
					app + '*.css',
					app + 'assets/img/*',
					app + 'assets/js/*.js',
					app + '**/*.php'
				],
			},
			options: {
				watchTask: true,
				host: projectName,
				port: 8888
			}
		},
		less: {
			development: {
				options: {
					sourceMap: true,
					sourceMapFilename: app + 'style.css.map',
					sourceMapURL: '/wp-content/themes/<%= themeName %>/style.css.map',
					sourceMapBasepath: 'public',
					sourceMapRootpath: app,
					paths: app + 'assets/css'
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
					'app/wp-content/themes/<%= themeName %>/style.css': 'app/wp-content/themes/<%= themeName %>/assets/less/style.less'
				}
			}
		},
		autoprefixer: {
			single_file: {
				options: {
					browsers: ['> 1%', 'last 2 versions', 'ie 9']
				},
				src: app + 'style.css',
				dest: app + 'style.css'
			}
		},
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
		},
		exec: {
			get_grunt_sitemap: {
				command: 'curl --silent --output sitemap.json http://'+projectName+':8888/?show_sitemap'
			}
		},
		uncss: {
			development: {
				options: {
					ignore: ['.active', '.open'],
					stylesheets: ['style.css'],
					media: ['(min-width: 768px)', '(min-width: 992px)', '(min-width: 1200px)'],
					urls: [], //Overwritten in load_sitemap_and_uncss task
				},
				files: {
					'app/wp-content/themes/<%= themeName %>/style.clean.css': ['app/wp-content/themes/<%= themeName %>/**/*.php']
				}
			},
			dist: {
				options: {
					ignore: ['.active', '.open'],
					stylesheets: ['style.css'],
					media: ['(min-width: 768px)', '(min-width: 992px)', '(min-width: 1200px)'],
					urls: [], //Overwritten in load_sitemap_and_uncss task
				},
				files: {
					'dist/wp-content/themes/<%= themeName %>/style.clean.css': ['app/wp-content/themes/<%= themeName %>/**/*.php']
				}
			}
		},
		modernizr: {
			dist: {
				'devFile': 'app/wp-content/themes/<%= themeName %>/assets/bower_components/modernizr/modernizr.js',
				'outputFile': 'dist/wp-content/themes/<%= themeName %>/assets/bower_components/modernizr/modernizr-custom.js',
				'extra': {
					'shiv': false,
					'printshiv': false,
					'load': true,
					'mq': false,
					'cssclasses': true
				},
				'extensibility': {
					'addtest': false,
					'prefixed': false,
					'teststyles': false,
					'testprops': false,
					'testallprops': false,
					'hasevents': false,
					'prefixes': false,
					'domprefixes': false
				},
				'parseFiles': true,
				'files': {
					'src': [
						'app/wp-content/themes/<%= themeName %>/assets/js/app.js'
					]
				}
			}
		},
		requirejs: {
			compile: {
				options: {
					baseUrl: app + 'assets/js',
					mainConfigFile: app + 'assets/js/main.js',
					optimize : 'uglify2',
					inlineText : true,
					findNestedDependencies : true,
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
		},
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
			},
			uploads: {
				files: [{
					expand: true,
					cwd: 'app/media',
					src: '**/*.{png,jpg,jpeg}',
					dest: 'dist/media'
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
			},
			uploads: {
				files: [{
					expand: true,
					cwd: 'app/media',
					src: '**/*.svg',
					dest: 'dist/media'
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
					'app/wp-content/themes/<%= themeName %>/base.php': 'app/wp-content/themes/<%= themeName %>/base-template.html',
					'app/wp-content/themes/<%= themeName %>/templates/head.php': 'app/wp-content/themes/<%= themeName %>/templates/head-template.html'
				},
			},
			dist: {
				options: {
					context: {
						NODE_ENV: 'PRODUCTION'
					},
				},
				files: {
					'dist/wp-content/themes/<%= themeName %>/base.php': 'app/wp-content/themes/<%= themeName %>/base-template.html',
					'dist/wp-content/themes/<%= themeName %>/templates/head.php': 'app/wp-content/themes/<%= themeName %>/templates/head-template.html'
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
						'*.{ico,png,txt,php,html,md}',
						'.htaccess',
						'.gitignore',
						'wp-admin/*.php',
						'wp-admin/**/*',
						'wp-includes/**/*',
						'wp-includes/*.php',
						'wp-content/*.php',
						'wp-content/plugins/*.php',
						'wp-content/plugins/**/*',
						'wp-content/themes/*.php',
						'wp-content/themes/<%= themeName %>/*.{php,md,png,css}',
						'wp-content/themes/<%= themeName %>/templates/**/*',
						'wp-content/themes/<%= themeName %>/lib/**/*',
						'wp-content/themes/<%= themeName %>/lang/**/*',
						'wp-content/themes/<%= themeName %>/assets/fonts/**/*',
						'wp-content/themes/<%= themeName %>/assets/js/**/*',
						'wp-content/themes/<%= themeName %>/assets/css/**/*',
						'wp-content/themes/<%= themeName %>/assets/bower_components/requirejs/require.js'
					]
				}]
			}
		},
		hashres: {
			options: {
				encoding: 'utf8',
				fileNameFormat: <%="'"%><%= '${name}.${ext}?${hash}' %><%="'"%>,
				renameFiles: false
			},
			css: {
				src: [
					dist + 'style.css'
				],
				dest: dist + 'templates/head.php',
			}
		},
		buildcontrol: {
			options: {
				dir: 'dist',
				commit: true,
				push: true,
				message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
			},
			prod: {
				options: {
					<% if (includeBitBucket) { %>
					remote: 'https://bitbucket.org/<%= accountName %>/<%= repoName %>',
					<% } if (includeGitHub) { %>
					remote: 'https://github.com/<%= accountName %>/<%= repoName %>',
					<% } %>
					branch: 'master'
				}
			}
		},
		concurrent: {
			dev: ['clean:dist', 'preprocess:dev'],
			build1: ['imagemin:dist', 'copy:dist', 'less:dist'],
			build2: ['preprocess:dist', 'svgmin:dist', 'modernizr']
		}
	});

	grunt.registerTask('load_sitemap_json', function() {
		var sitemap_urls = grunt.file.readJSON('./sitemap.json');
		grunt.config.set('uncss.dist.options.urls', sitemap_urls);
	});

	grunt.registerTask('optimize-uncss', [
		'exec:get_grunt_sitemap',
		'load_sitemap_json','uncss:dist'
	]);

	grunt.registerTask('test-uncss', [
		'exec:get_grunt_sitemap',
		'load_sitemap_json','uncss:development'
	]);

	grunt.registerTask('deploy', [
		'buildcontrol'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'concurrent:build1',
		'concurrent:build2',
		'optimize-uncss',
		'hashres'
	]);

	grunt.registerTask('dev', [
		'concurrent:dev',
		'browserSync',
		'watch'
	]);

	grunt.registerTask('default', 'dev');
};