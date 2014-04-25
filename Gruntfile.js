module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({
    meta: {
      pkg: grunt.file.readJSON('package.json'),
      srcFiles: [
        'src/base.js',
        'src/helpers.js',
        'src/charts/**/*.js',
        'src/features/**/*.js',
        'src/parsers/**/*.js',
        'src/builders/**/*.js'
      ]
    },
    watch: {
      scripts: {
        files: ['src/**/*.js', 'test/tests/**/*.js'],
        tasks: ['jshint','test']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      test: {
        options: {
          globals: {
            d3: true,
            d4: true,
            assert: true,
            chai: true,
            setup: true,
            teardown: true,
            suite: true,
            it: true,
            describe: true,
            test: true,
            sinon: true
          }
        },
        files: {
          src: ['test/tests/*.js']
        }
      },
      grunt: {
        options: {
          node: true
        },
        files: {
          src: ['Gruntfile.js']
        }
      }
    },
    mocha: {
      options: {
        run: true,
        log: true
      },
      src: ['test/index.html']
    },
    concat: {
      options: {
        banner: '/*! <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n' +
          ' *  License: <%= meta.pkg.license %>\n' +
          ' *  Date: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
          ' *  Copyright: <%= meta.pkg.author.name %>\n' +
          ' */\n'
      },
      test: {
        files: {
          'test/lib/d4.js': '<%= meta.srcFiles %>',
          '../d4-www/src/assets/js/d4.js': '<%= meta.srcFiles %>'
        }
      },
      release: {
        files: {
          'd4.js': '<%= meta.srcFiles %>'
        }
      }
    },
    plato: {
      quality: {
        options: {
          jshintrc: '.jshintrc'
        },
        files: {
          'reports/plato': ['<%= meta.srcFiles %>']
        }
      }
    },
    removelogging: {
      release: {
        src: 'd4*.js'
      }
    },
    jsbeautifier : {
      files : ['src/**/*.js'],
      options : {
        js: {
          indentLevel: 0,
          indentSize: 2
        }
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      release: {
        files: {
          'd4.min.js': 'd4.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-plato');
  grunt.loadNpmTasks('grunt-remove-logging');

  grunt.registerTask('test', ['concat', 'mocha']);
  grunt.registerTask('quality', ['plato']);
  grunt.registerTask('default', ['jsbeautifier', 'jshint', 'test']);
  grunt.registerTask('release', ['default', 'concat', 'uglify', 'removelogging']);
};
