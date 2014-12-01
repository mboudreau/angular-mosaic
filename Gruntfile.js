module.exports = function (grunt) {

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-contrib-compress');

	/**
	 * Rename watch task 
	 */
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.renameTask('watch', 'delta');

	/**
	 * Load in our build configuration file.
	 */
	var userConfig = require('./build.config.js');

	var taskConfig = {
        pkg: grunt.file.readJSON('./bower.json'),

		clean: [
			'<%= build_dir %>',
			'<%= release_dir %>'
		],

		copy: {
			build: {
				src: [ '<%= app_files.js %>' ],
				dest: '<%= build_dir %>/',
				cwd:'.',
				expand:true
			},
			release: {
				src: ['bower.json', 'README.md'],
				dest:'<%= release_dir %>/',
				cwd:'.',
				expand:true
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
						cwd: '<%= build_dir %>',
						dest: '<%= build_dir %>',
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

		compress: {
			release: {
				options: {
					mode: 'gzip'
				},
				files: [
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
				tasks: [ 'jshint:source', 'copy:build', 'ngAnnotate', 'karma:unit:run' ]
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
		}
	};

	grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

	grunt.registerTask('watch', [ 'build', 'karma:continuous', 'delta' ]);

	/**
	 * The default task is to build and release.
	 */
	grunt.registerTask('default', [ 'build' ]);
	grunt.registerTask('test', [ 'build' ]);

	/**
	 * The build task gets your app ready to run for development and testing.
	 */
	grunt.registerTask('build', [
		'jshint:source', 'clean', 'copy:build', 'ngAnnotate', 'karmaconfig', 'karma:unit'
	]);

	/**
	 * The release task gets your app ready for deployment
	 */
	grunt.registerTask('release', [
		'build', 'copy:release', 'concat:release', 'uglify:release', 'compress:release'
	]);

	grunt.registerMultiTask('karmaconfig', 'Process karma config templates', function () {
		var jsFiles = this.filesSrc.filter(function (file) {
			return file.match(/\.js(\.gz)?$/);
		});

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