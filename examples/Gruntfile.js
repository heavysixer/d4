/*
 * Generated on 2014-02-14
 * generator-assemble v0.4.9
 * https://github.com/assemble/generator-assemble
 *
 * Copyright (c) 2014 Hariadi Hinta
 * Licensed under the MIT license.
 */

'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// '<%= config.src %>/templates/pages/{,*/}*.hbs'
// use this if you want to match all subfolders:
// '<%= config.src %>/templates/pages/**/*.hbs'

module.exports = function(grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', 'assemble']});

  // Project configuration.
  grunt.initConfig({

    config: {
      src: 'src',
      dist: 'dist'
    },

    watch: {
      assemble: {
        files: ['<%= config.src %>/{content,data,templates}/**/*.{md,hbs,yml}', '<%= config.src %>/../../docs/**/*.{md,hbs,yml}'],
        tasks: ['assemble']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.dist %>/{,*/}*.html',
          '<%= config.dist %>/assets/{,*/}*.css',
          '<%= config.dist %>/assets/{,*/}*.js',
          '<%= config.dist %>/assets/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
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
            '<%= config.dist %>'
          ]
        }
      }
    },

    useminPrepare: {
      html: '<%= config.dist %>/index.html',
      options: {
        dest: '<%= config.dist %>'
      }
    },
    usemin: {
      html: ['<%= config.dist %>/**/*.html'],
      css: ['<%= config.dist %>/assets/css/{,*/}*.css'],
      options: {
        dirs: ['<%= config.dist %>']
      }
    },



    assemble: {
      pages: {
        options: {
          flatten: true,
          assets: '<%= config.dist %>/assets',
          layout: '<%= config.src %>/templates/layouts/default.hbs',
          data: '<%= config.src %>/data/*.{json,yml}',
          partials: '<%= config.src %>/templates/partials/*.hbs',
          plugins: ['assemble-contrib-permalinks', 'assemble-contrib-sitemap']
        },
        files: {
          '<%= config.dist %>/': ['<%= config.src %>/templates/pages/*.hbs'],
          '<%= config.dist %>/charts/column/': ['<%= config.src %>/content/charts/column/*.hbs'],
          '<%= config.dist %>/charts/grouped-column/': ['<%= config.src %>/content/charts/grouped-column/*.hbs'],
          '<%= config.dist %>/charts/line/': ['<%= config.src %>/content/charts/line/*.hbs'],
          '<%= config.dist %>/charts/row/': ['<%= config.src %>/content/charts/row/*.hbs'],
          '<%= config.dist %>/charts/scatter/': ['<%= config.src %>/content/charts/scatter/*.hbs'],
          '<%= config.dist %>/charts/stacked-column/': ['<%= config.src %>/content/charts/stacked-column/*.hbs'],
          '<%= config.dist %>/charts/waterfall/': ['<%= config.src %>/content/charts/waterfall/*.hbs']
        }
      }
    },

    // Before generating any new files,
    // remove any previously-created files.
    clean: ['<%= config.dist %>/**/*.{html,xml}']

  });

  // grunt.loadNpmTasks('assemble');
  // grunt.loadNpmTasks('grunt-contrib-clean');
  // grunt.loadNpmTasks('grunt-usemin');
  // grunt.loadNpmTasks('grunt-contrib-connect');
  // grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('server', [
    'clean',
    'assemble',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean',
    'assemble',
    'useminPrepare',
    'concat',
    'usemin',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

};
