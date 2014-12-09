module.exports = function (grunt) {

	/**
	 * Load required Grunt tasks. These are installed based on the versions listed
	 * in `package.json` when you do `npm install` in this directory.
	 */
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-contrib-compress');

	/**
	 * Middleware for grunt-contrib-connect
	 */
	var modRewrite = require('connect-modrewrite');

	/**
	 * Load in our build configuration file.
	 */
	var userConfig = require('./build.config.js');

	var taskConfig = {
		pkg: grunt.file.readJSON("bower.json"),

		clean: [
			'<%= build_dir %>',
			'<%= release_dir %>'
		],

		copy: {
			build_app_js: {
				src: [ '<%= app_files.js %>' ],
				dest: '<%= build_dir %>/',
				cwd: '.',
				expand: true
			},
			build_vendor_js: {
				src: [ '<%= vendor_files.js %>' ],
				dest: '<%= build_dir %>/',
				cwd: '.',
				expand: true
			},
			release: {
				files: [
					{
						src: [ 'bower.json' ],
						dest: '<%= release_dir %>/bower.json'
					},
					{
						src: [ 'README.md' ],
						dest: '<%= release_dir %>/README.md'
					}
				]
			}
		},

		concat: {
			release: {
				src: [
					'module.prefix',
					'<%= build_dir %>/src/**/*.js',
					'module.suffix'
				],
				dest: '<%= release_dir %>/<%= pkg.name %>.js'
			}
		},

		ngAnnotate: {
			options: {
				singleQuotes: true
			},
			build: {
				files: [
					{
						src: [ '<%= app_files.js %>' ],
						cwd: '<%= build_dir %>/<%= pkg.name %>',
						dest: '<%= build_dir %>/<%= pkg.name %>',
						expand: true
					},
					{
						src: [ '<%= vendor_files.js %>' ],
						cwd: '<%= build_dir %>/<%= pkg.name %>',
						dest: '<%= build_dir %>/<%= pkg.name %>',
						expand: true
					}
				]
			}
		},

		uglify: {
			release: {
				options: {
					mangle: false,
					sourceMap: true
				},
				files: [
					{
						src: ['<%= release_dir %>/**/*.js'],
						expand: true,
						ext: '.min.js',
						extDot: 'last'
					}
				]
			}
		},

		less: {
			build: {
				files: [
					{
						src: [
							'<%= app_files.less %>',
							'<%= vendor_files.css %>'
						],
						dest: '<%= build_dir %>',
						cwd:'.',
						expand:true,
						ext:'.css',
						extDot: 'last'
					}
				]
			},
			release: {
				options: {
					compress: true,
					cleancss: true,
					cleancssOptions: {
						keepSpecialComments:0
					}
				},
				files: [
					{
						src: [
							'<%= app_files.less %>',
							'<%= vendor_files.css %>'
						],
						dest: '<%= release_dir %>/<%= pkg.name %>.css'
					}
				]
			}
		},

		jshint: {
			options: {
				curly: true,
				immed: true,
				newcap: true,
				noarg: true,
				sub: true,
				boss: true,
				asi: true,
				eqnull: true,
				shadow: true,
				globals: {
					angular: true,
					_: true,
					app: true
				}
			},
			source: {
				src: [
					'<%= app_files.js %>'
				]
			},

			test: {
				options: {
					newcap: false
				},
				src: [ '<%= app_files.jsunit %>' ]
			},
			gruntfile: {
				src: [
					'Gruntfile.js'
				]
			}
		},

		karma: {
			options: {
				configFile: '<%= build_dir %>/karma-unit.js'
			},
			unit: {
				singleRun: true
			},
			continuous: {
				singleRun: false,
				background: true
			}
		},

		index: {
			options: {
				templateSrc: 'src/index.html',
				templateDest: '<%= build_dir %>/index.html'
			},
			build: {
				files: [
					{ // Vendor files (dependencies)
						src: [
							'<%= vendor_files.js %>'
						],
						cwd: '<%= build_dir %>/',
						expand: true
					},
					{ // App files
						src: [
							'src/**/*.js',
							'src/**/*.css',
							'!vendor/**/*' // Don't re-add vendor files
						],
						cwd: '<%= build_dir %>/',
						expand: true
					}
				]
			},

			release: {
				options: {
					templateDest: '<%= release_dir %>/index.html',
					async: true
				},
				files: [
					{
						src: [
							'**/*.min.js.gz',
							'**/*.css.gz'
						],
						cwd: '<%= release_dir %>/',
						expand: true
					}
				]
			}
		},

		compress: {
			release: {
				options: {
					mode: 'gzip'
				},
				files: [
					// Each of the files in the src/ folder will be output to
					// the dist/ folder each with the extension .gz.js
					{
						src: ['<%= release_dir %>/**/*.min.js'],
						expand: true,
						ext: '.js.gz',
						extDot: 'last'
					},
					{
						src: ['<%= release_dir %>/**/*.css'],
						expand: true,
						ext: '.css.gz',
						extDot: 'last'
					}
				]
			}
		},

		imageEmbed: {
			release: {
				src: [ '<%= release_dir %>/<%= pkg.name %>.css' ],
				dest: '<%= release_dir %>/<%= pkg.name %>.css',
				options: {
					deleteAfterEncoding: true
				}
			}
		},

		karmaconfig: {
			unit: {
				dir: '<%= build_dir %>',
				src: [
					'<%= vendor_files.js %>',
					'<%= build_dir %>/**/*.tpl.js',
					'<%= test_files.js %>'
				]
			}
		},

		delta: {
			options: {
				livereload: true
			},

			gruntfile: {
				files: 'Gruntfile.js',
				tasks: [ 'jshint:gruntfile' ],
				options: {
					livereload: false
				}
			},

			jssrc: {
				files: [
					'<%= app_files.js %>'
				],
				tasks: [ 'jshint:source', 'copy:build_app_js', 'ngAnnotate', 'karma:unit:run' ]
			},

			jsvendor: {
				files: [
					'<%= vendor_files.js %>'
				],
				tasks: [ 'copy:build_vendor_js', 'ngAnnotate' ]
			},

			html: {
				files: [ '<%= app_files.html %>' ],
				tasks: [ 'index:build' ]
			},

			less: {
				files: [ 'src/**/*.less', 'vendor/**/*.less' ],
				tasks: [ 'less:build' ]
			},

			jsunit: {
				files: [
					'<%= app_files.jsunit %>'
				],
				tasks: [ 'jshint:test', 'karma:unit:run' ],
				options: {
					livereload: false
				}
			}
		},

		connect: {
			options: {
				port: 8080,
				protocol: 'https',
				middleware: function (connect, options) {
					var middlewares = [];
					var name = taskConfig.pkg.name;
					middlewares.push(modRewrite(['!\\.?(js|css|html|eot|svg|ttf|woff|otf|css|png|jpg|gif|ico) / [L]'])); // Anything after project name
					middlewares.push(function (req, res, next) {
						var url = req.url.split('?')[0];
						if (/\.(gz|gzip)$/.test(url)) {
							var type = 'text/html';
							if (/\.js\.(gz|gzip)$/.test(url)) {
								type = 'application/javascript';
							} else if (/\.css\.(gz|gzip)$/.test(url)) {
								type = 'text/css';
							}

							res.setHeader('Content-Type', type);
							res.setHeader('Content-Encoding', 'gzip');
						}

						// don't just call next() return it
						return next();
					});
					options.base.forEach(function (base) {
						middlewares.push(connect.static(base));
					});
					return middlewares;
				}
			},
			build: {
				options: {
					base: '<%= build_dir %>'
				}
			},
			release: {
				options: {
					base: '<%= release_dir %>'
				}
			}
		}
	};

	grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

	grunt.renameTask('watch', 'delta');
	grunt.registerTask('watch', [ 'build', 'connect:build', 'karma:continuous', 'delta' ]);

	/**
	 * The default task is to build and release.
	 */
	grunt.registerTask('default', [ 'build' ]);
	grunt.registerTask('test', [ 'build' ]);

	/**
	 * The build task gets your app ready to run for development and testing.
	 */
	grunt.registerTask('build', [
		'jshint', 'clean', 'less:build',
		'copy:build_app_js', 'copy:build_vendor_js', 'ngAnnotate', 'index:build', 'karmaconfig',
		'karma:unit'
	]);

	/*
	 * The release task gets your app ready for deployment
	 */
	grunt.registerTask('release', [
		'build', 'copy:release', 'concat:release', 'less:release' , 'uglify:release', 'compress:release'
	]);

	function filterForJS(files) {
		return files.filter(function (file) {
			return file.match(/\.js(\.gz)?$/);
		});
	}

	function filterForCSS(files) {
		return files.filter(function (file) {
			return file.match(/\.css(\.gz)?$/);
		});
	}

	grunt.registerMultiTask('index', 'Process index.html template', function () {
		var options = this.options({
			templateSrc: 'src/index.html',
			async: false
		});

		var files = this.files.map(function (file) {
			return file.dest;
		});
		var jsFiles = filterForJS(files);
		var cssFiles = filterForCSS(files);

		if (cssFiles.length !== 0) {
			grunt.log.writeln('Including CSS:');
			cssFiles.forEach(function (f) {
				grunt.log.writeln(String(f).cyan);
			});
		}

		if (jsFiles.length !== 0) {
			grunt.log.writeln('Including JS:');
			jsFiles.forEach(function (f) {
				grunt.log.writeln(String(f).cyan);
			});
		}

		grunt.file.copy(options.templateSrc, options.templateDest, {
			process: function (contents, path) {
				return grunt.template.process(contents, {
					data: {
						async: options.async,
						scripts: jsFiles,
						styles: cssFiles,
						version: grunt.config('pkg.version'),
						name: grunt.config('pkg.name'),
						timestamp: new Date().getTime()
					}
				});
			}
		});
	});

	grunt.registerMultiTask('karmaconfig', 'Process karma config templates', function () {
		var jsFiles = filterForJS(this.filesSrc);

		grunt.file.copy('karma/karma-unit.tpl.js', grunt.config('build_dir') + '/karma-unit.js', {
			process: function (contents, path) {
				return grunt.template.process(contents, {
					data: {
						scripts: jsFiles
					}
				});
			}
		});
	});
};
