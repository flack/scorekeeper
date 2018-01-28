/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
  /**
   * The `build_dir` folder is where our projects are compiled during
   * development and the `compile_dir` folder is where our app resides once it's
   * completely built.
   */
  build_dir: 'build',
  compile_dir: 'bin',

  /**
   * This is a collection of file patterns that refer to our app code (the
   * stuff in `src/`). These file paths are used in the configuration of
   * build tasks. `js` is all project javascript, less tests. `atpl` contains
   * our app's components' template HTML files. `html` is just our
   * main HTML file, `scss` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js' ],
    jsunit: [ 'src/**/*.spec.js' ],

    atpl: [ 'src/app/**/*.tpl.html' ],

    html: [ 'src/index.html' ],
    scss: 'src/sass/main.scss'
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'node_modules/@bower_components/angular-mocks/angular-mocks.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`node_modules/@bower_components/`) that we need to place into the build
   * process somewhere. While the `app_files` property ensures all
   * standardized files are collected for compilation, it is the user's job
   * to ensure non-standardized (i.e. vendor-related) files are handled
   * appropriately in `vendor_files.js`.
   *
   * The `vendor_files.js` property holds files to be automatically
   * concatenated and minified with our project source files.
   *
   * The `vendor_files.css` property holds any CSS files to be automatically
   * included in our app.
   *
   * The `vendor_files.assets` property holds any assets to be copied along
   * with our app's assets. This structure is flattened, so it is not
   * recommended that you use wildcards.
   */
  vendor_files: {
    js: [
        'node_modules/@bower_components/jquery/dist/jquery.min.js',
        'node_modules/@bower_components/angular/angular.js',
        'node_modules/@bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'node_modules/@bower_components/angular-ui-router/release/angular-ui-router.js',
        'node_modules/@bower_components/angular-ui-utils/modules/route/route.js',
        'node_modules/@bower_components/jquery-ui/jquery-ui.min.js',
        'node_modules/@bower_components/angular-ui-sortable/sortable.min.js',
        'node_modules/@bower_components/moment/min/moment-with-locales.min.js',
        'node_modules/@bower_components/angular-moment/angular-moment.min.js',
        'node_modules/@bower_components/angular-animate/angular-animate.min.js',
        'node_modules/@bower_components/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js',
        'node_modules/@bower_components/ngstorage/ngStorage.min.js'
    ],
    css: [
    ],
    assets: [
    ],
    fonts: [
        'node_modules/@bower_components/font-awesome/fonts/*'
    ]
  },

    appcache_literals: [
        'fonts/fontawesome-webfont.eot?v=4.7.0',
        'fonts/fontawesome-webfont.eot?#iefix&v=4.7.0',
        'fonts/fontawesome-webfont.woff?v=4.7.0',
        'fonts/fontawesome-webfont.woff2?v=4.7.0',
        'fonts/fontawesome-webfont.ttf?v=4.7.0',
        'fonts/fontawesome-webfont.svg?v=4.7.0#fontawesomeregular'
    ]
};
