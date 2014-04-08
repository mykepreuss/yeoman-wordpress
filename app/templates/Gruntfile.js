'use strict';

module.exports = function(grunt) {
	var app = 'app/wp-content/themes/<%= themeName %>/';
	var dist = 'dist/wp-content/themes/<%= themeName %>/';

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
					'less:development'
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
		browser_sync: {
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
				host: '<%= themeName %>',
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
					'app/wp-content/themes/<%= themeName %>/styles.css': 'app/wp-content/themes/<%= themeName %>/assets/less/styles.less'
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
					'dist/wp-content/themes/<%= themeName %>/styles.css': 'app/wp-content/themes/<%= themeName %>/assets/less/styles.less'
				}
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
		},<% if (includeRequireJS) { %>
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
					'app/wp-content/themes/assembly-theme/base.php': 'app/wp-content/themes/assembly-theme/base-template.html'
				},
			},
			dist: {
				options: {
					context: {
						NODE_ENV: 'PRODUCTION'
					},
				},
				files: {
					'dist/wp-content/themes/assembly-theme/base.php': 'app/wp-content/themes/assembly-theme/base-template.html'
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
						'wp-content/themes/<%= themeName %>/assets/bower_components/modernizr/modernizr.js',
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
			build2: ['preprocess:dist', 'svgmin:dist']
		}
	});

	grunt.registerTask('deploy', [
		'buildcontrol'
	]);

	grunt.registerTask('build', [
		'clean:dist',
		'concurrent:build1',
		'concurrent:build2',
		'hashres'
	]);

	grunt.registerTask('dev', [
		'concurrent:dev',
		'browser_sync',
		'watch'
	]);

	grunt.registerTask('default', 'dev');
};