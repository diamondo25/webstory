module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    uglify : {
      options : {
        banner : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build : {
        src : 'public/js/*.js',
        dest : 'public/js/dist/all.min.js'
      }
    },
    concat : {
      javascript : {
        src : 'scripts/**/*.js',
        dest : 'public/js/webstory.js'
      },
      phaser : {
        src : 'node_modules/phaser/dist/phaser.js',
        dest : 'public/js/phaser.js'
      },
      phasermap : {
        src : 'node_modules/phaser/dist/phaser.map',
        dest : 'public/js/phaser.map'
      }
    },
    watch : {
      scripts : {
        files : [ 'scripts/**/*.js' ],
        tasks : [ 'run' ],
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
  grunt.registerTask('run', [ 'concat', 'uglify' ]);
  grunt.registerTask('default', [ 'run', 'watch' ]);

};
