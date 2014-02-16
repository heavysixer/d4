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
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};


// # Globbing
// for performance reasons we're only matching one level down:
// '<%= app.src %>/templates/pages/{,*/}*.hbs'
// use this if you want to match all subfolders:
// '<%= app.src %>/templates/pages/**/*.hbs'

module.exports = function(grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', 'assemble']});

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
    watch: {
      assemble: {
        files: ['<%= app.src %>/{content,data,templates}/**/*.{md,hbs,yml}', '<%= app.src %>/../../docs/**/*.{md,hbs,yml}'],
        tasks: ['assemble']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '{.tmp,<%= app.src %>}/**/*.html',
          '.tmp/assets/{,*/}*.css',
          '<%= app.dist %>/{,*/}*.html',
          '{.tmp,<%= app.src %>}/scripts/**/*.js',
          '<%= app.src %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, appConfig.src)
            ];
          }
        },
        dist: {
          options: {
            middleware: function (connect) {
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
            'scripts/data/{,*/}*.json',
            'images/{,*/}*.{webp,gif}',
            'assets/css/fonts/{,*/}*.*'
          ]
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
        expand: true,
        cwd: '<%= app.src %>/assets/css',
        dest: '.tmp/assets/css/',
        src: '{,*/}*.css'
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

    useminPrepare: {
      html: '<%= app.src %>/index.html',
      options: {
        dest: '<%= app.dist %>'
      }
    },
    usemin: {
      html: ['<%= app.dist %>/**/*.html'],
      css: ['<%= app.dist %>/assets/css/{,*/}*.css'],
      options: {
        dirs: ['<%= app.dist %>']
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
    cssmin: {
    },
    assemble: {
      pages: {
        options: {
          flatten: true,
          assets: '<%= app.dist %>/assets',
          layout: '<%= app.src %>/templates/layouts/default.hbs',
          data: '<%= app.src %>/data/*.{json,yml}',
          partials: '<%= app.src %>/templates/partials/*.hbs',
          plugins: ['assemble-contrib-permalinks', 'assemble-contrib-sitemap']
        },
        files: {
          '<%= app.dist %>/': ['<%= app.src %>/templates/pages/*.hbs'],
          '<%= app.dist %>/charts/column/': ['<%= app.src %>/content/charts/column/*.hbs'],
          '<%= app.dist %>/charts/grouped-column/': ['<%= app.src %>/content/charts/grouped-column/*.hbs'],
          '<%= app.dist %>/charts/line/': ['<%= app.src %>/content/charts/line/*.hbs'],
          '<%= app.dist %>/charts/row/': ['<%= app.src %>/content/charts/row/*.hbs'],
          '<%= app.dist %>/charts/scatter/': ['<%= app.src %>/content/charts/scatter/*.hbs'],
          '<%= app.dist %>/charts/stacked-column/': ['<%= app.src %>/content/charts/stacked-column/*.hbs'],
          '<%= app.dist %>/charts/waterfall/': ['<%= app.src %>/content/charts/waterfall/*.hbs']
        }
      }
    },
  });
  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'assemble',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'assemble',
    'useminPrepare',
    'copy:dist',
    'usemin',
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

};
