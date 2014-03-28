/*
 * Generated on 2014-02-14
 * generator-assemble v0.4.9
 * https://github.com/assemble/generator-assemble
 *
 * Copyright (c) 2014 Hariadi Hinta
 * Licensed under the MIT license.
 */

'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};


// # Globbing
// for performance reasons we're only matching one level down:
// '<%= app.src %>/templates/pages/{,*/}*.hbs'
// use this if you want to match all subfolders:
// '<%= app.src %>/templates/pages/**/*.hbs'

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt, {
    pattern: ['grunt-*', 'assemble']
  });
  require('time-grunt')(grunt);

  var appConfig = {
    src: 'src',
    dist: 'dist'
  };

  try {
    appConfig.src = require('./bower.json').appPath || appConfig.src;
  } catch (e) {}


  // Project configuration.
  grunt.initConfig({
    app: appConfig,
    meta: {
      pkg: grunt.file.readJSON('../package.json'),
    },
    watch: {
      assemble: {
        files: ['<%= app.src %>/{assets,content,data,templates}/**/*.{md,hbs,yml,css}', '<%= app.src %>/../../docs/**/*.{md,hbs,yml}', '<%= app.src %>/../../README.md', '<%= app.src %>/../docs/d4-doc.md', '<%= app.src %>/../d4.css'],
        tasks: ['copy:styles', 'assemble']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '{.tmp,<%= app.src %>}/**/*.html',
          '{.tmp,<%= app.src %>}/assets/css/{,*/}*.css',
          '<%= app.src %>/{,*/}*.html',
          '{.tmp,<%= app.src %>}/assets/js/**/*.js',
          '{.tmp,<%= app.src %>}/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    connect: {
      options: {
        port: 3000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, appConfig.src)
            ];
          }
        },
        dist: {
          options: {
            middleware: function(connect) {
              return [
                mountFolder(connect, appConfig.dist)
              ];
            }
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= app.dist %>/*',
            '!<%= app.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    useminPrepare: {
      html: '.tmp/index.html',
      options: {
        dest: '<%= app.dist %>'
      }
    },

    usemin: {
      html: ['<%= app.dist %>/**/*.html'],
      options: {
        dirs: ['<%= app.dist %>']
      }
    },

    cssmin: {},

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= app.src %>',
          dest: '<%= app.dist %>',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            'assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            'assets/fonts/{,*/}*.*'
          ]
        }, {
          expand: true,
          dot: true,
          cwd: '.tmp',
          dest: '<%= app.dist %>',
          src: ['**/*.html']
        }, {
          expand: true,
          cwd: '<%= app.src %>/assets/css/',
          dest: '<%= app.dist %>/assets/css/',
          src: ['**/*.*']
        }, {
          expand: true,
          cwd: '<%= app.src %>/assets/fonts/',
          dest: '<%= app.dist %>/assets/fonts/',
          src: ['**/*.*']
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= app.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      styles: {
        files: [{
          expand: true,
          cwd: '<%= app.src %>/assets/css',
          dest: '.tmp/assets/css',
          src: ['{,*/}*.css']
        }]
      }
    },
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles'
      ]
    },
    mox: {
      build: {
        sourceFiles: ['../src/'],
        options: {
          name: '<%= meta.pkg.name %>',
          version: '<%= meta.pkg.version %>',
          template: 'file',
          outputFile: '../docs/<%= meta.pkg.name %>-doc.md'
        }
      },
    },

    assemble: {
      pages: {
        options: {
          collections: [{ name : 'concepts', sortorder: 'asc', sortby: 'title' }, { name: 'features', sortorder: 'asc', sortby: 'title' },{ name: 'charts', sortorder: 'asc', sortby: 'title' }],
          flatten: true,
          assets: '.tmp/assets',
          layout: '<%= app.src %>/templates/layouts/default.hbs',
          data: '<%= app.src %>/data/*.{json,yml}',
          partials: '<%= app.src %>/templates/partials/*.hbs',
          plugins: ['assemble-contrib-permalinks', 'assemble-contrib-sitemap']
        },
        files: {
          '.tmp/': ['<%= app.src %>/templates/pages/*.hbs'],
          '.tmp/charts/column/': ['<%= app.src %>/content/charts/column/*.hbs'],
          '.tmp/charts/features/': ['<%= app.src %>/content/charts/features/*.hbs'],
          '.tmp/charts/grouped-column/': ['<%= app.src %>/content/charts/grouped-column/*.hbs'],
          '.tmp/charts/line/': ['<%= app.src %>/content/charts/line/*.hbs'],
          '.tmp/charts/row/': ['<%= app.src %>/content/charts/row/*.hbs'],
          '.tmp/charts/scatter/': ['<%= app.src %>/content/charts/scatter/*.hbs'],
          '.tmp/charts/stacked-column/': ['<%= app.src %>/content/charts/stacked-column/*.hbs'],
          '.tmp/charts/waterfall/': ['<%= app.src %>/content/charts/waterfall/*.hbs']
        }
      }
    },
  });
  grunt.registerTask('server', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'assemble',
      'concurrent:server',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'mox:build',
    'assemble',
    'useminPrepare',
    'concurrent:dist',
    'concat',
    'copy:dist',
    'uglify',
    'usemin',
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

};
