module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  // Add in time grunt
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        src: [
          'app/scripts/controllers/<%= names.file %>.controller.js'
        ],
        dest: 'dist/js/<%= names.file %>.js',
        nonull: true
      }
    },

    less: {
      dist: {
        options: {
          paths: ["app/styles"],
        },
        files: {
          'dist/css/<%= names.file %>.css': 'app/styles/<%= names.file %>.less',
        }
      }
    },

    watch: {
      less: {
        files: ['app/styles/**/*.less'],
        tasks: ['less:dist'],
        options: {
          spawn: false
        }
      },

      js: {
        files: ['app/scripts/**/*.js'],
        tasks: ['concat:dist'],
        options: {
          spawn: false
        }
      },

      html: {
        files: ['app/views/**/*.html'],
        tasks: ['copy:views'],
        options: {
          spawn: false
        }
      }
    },

    copy: {
      config: {
        src: 'config/package.manifest',
        dest: 'dist/package.manifest',
      },

      deploy: {
        files: [
          {
            expand: true,
            src: ['**/*'], 
            dest: '<%= grunt.option("target") %>\\App_Plugins\\warren', 
            flatten: false
          }
        ]
      },

      views: {
        expand: true,
        cwd: 'app/views/',
        src: '**',
        dest: 'dist/views/'
      },

      nuget: {
        expand: true,
        cwd: 'dist/',
        src: '**',
        dest: 'tmp/nuget/content/App_Plugins/<%= names.alias %>/'
      },

      umbraco: {
        expand: true,
        cwd: 'dist/',
        src: '**',
        dest: 'tmp/umbraco/App_Plugins/<%%= pkg.name %>/'
      }
    },

    template: {
      nuspec: {
        options: {
          data: {
            name:        '<%%= pkg.name %>',
            version:     '<%%= pkg.version %>',
            author:      '<%%= pkg.author.name %>',
            description: '<%%= pkg.description %>'
          }
        },
        files: {
          'tmp/nuget/<%%= pkg.name %>.nuspec': 'config/package.nuspec'
        }
      }
    },

    mkdir: {
      pkg: {
        options: {
          create: ['pkg/nuget', 'pkg/umbraco']
        },
      },
    },

    nugetpack: {
      dist: {
        src: 'tmp/nuget/<%%= pkg.name %>.nuspec',
        dest: 'pkg/nuget/'
      }
    },

    umbracoPackage: {
      options: {
        name:        '<%%= pkg.name %>',
        version:     '<%%= pkg.version %>',
        url:         '<%%= pkg.url %>',
        license:     '<%%= pkg.license %>',
        licenseUrl:  '<%%= pkg.licenseUrl %>',
        author:      '<%%= pkg.author %>',
        authorUrl:   '<%%= pkg.authorUrl %>',
        manifest:    'config/package.xml',
        readme:      'config/readme.txt',
        sourceDir:   'tmp/umbraco',
        outputDir:   'pkg/umbraco',
      }
    },

    clean: {
      dist: 'dist'
    }
  });

  grunt.registerTask('default', ['concat', 'less', 'copy:config', 'copy:views']);
  grunt.registerTask('nuget', ['clean', 'default', 'copy:nuget', 'template:nuspec', 'mkdir:pkg', 'nugetpack']);
  grunt.registerTask('umbraco', ['clean', 'default', 'copy:umbraco', 'mkdir:pkg', 'umbracoPackage']);

  //Deploy (copy) task
  //http://gruntjs.com/api/grunt.option
  grunt.registerTask('deploy', 'Copy & deploy files to our Umbraco website', function(){
    
    //Get the --target=c:/my-path/etc/umbraco/
    var target = grunt.option('target');

    //Check we have a target option
    if(!target){
      //Error message & stop processing task
      grunt.fail.warn('No target has been specified.');
    }

    //Debug
    grunt.log.oklns('Target is: ' + target);
    

    //Can we use grunt.file API to verify that var is definately valid path/folder?!
    //http://gruntjs.com/api/grunt.file
    if(!grunt.file.isDir(target)){
      //Error message & stop processing task
      grunt.fail.warn('The target passed in is not a folder path.');
    }

    //Run copy with deploy subtask (that uses the target option)
    grunt.task.run(['copy:deploy']);


  });

};

