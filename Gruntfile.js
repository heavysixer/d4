var mountFolder;

mountFolder = function(connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
  var yeomanConfig;
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  yeomanConfig = {
    src: 'src',
    dist: 'dist'
  };
  return grunt.initConfig({
    yeoman: yeomanConfig,
    uglify: {
      build: {
        src: '<%=yeoman.dist %>/d4.js',
        dest: '<%=yeoman.dist %>/d4.min.js'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    }
  }, grunt.registerTask('default', ['mochaTest', 'uglify']));
};
