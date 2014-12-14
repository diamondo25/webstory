module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    uglify : {
      options : {
        banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build : {
        src : 'src/<%= pkg.name %>.js',
        dest : 'build/<%= pkg.name %>.min.js'
      }
    },
    concat : {
      javascript : {
        src : 'scripts/**/*.js',
        dest : 'public/webstory.js'
      }
    },
    watch : {
      scripts : {
        files : [ 'scripts/**/*.js' ],
        tasks : [ 'concat' ],
        options : {
          spawn : false,
        },
      },
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', [ 'concat', 'watch' ]);

};
