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
   * build tasks. `js` is all project javascript, less tests. `ctpl` contains
   * our reusable components' (`src/common`) template HTML files, while
   * `atpl` contains the same, but for our app's code. `html` is just our
   * main HTML file, `less` is our main stylesheet, and `unit` contains our
   * app's unit tests.
   */
  app_files: {
    js: [ 'src/**/*.js', '!src/**/*.spec.js', '!src/assets/**/*.js' ],
    jsunit: [ 'src/**/*.spec.js' ],

    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],

    html: [ 'src/index.html' ],
    less: 'src/less/main.less'
  },

  /**
   * This is a collection of files used during testing only.
   */
  test_files: {
    js: [
      'vendor/angular-mocks/angular-mocks.js'
    ]
  },

  /**
   * This is the same as `app_files`, except it contains patterns that
   * reference vendor code (`vendor/`) that we need to place into the build
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
        'vendor/jquery/dist/jquery.min.js',
        'vendor/angular/angular.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'vendor/angular-ui-router/release/angular-ui-router.js',
        'vendor/angular-ui-utils/modules/route/route.js',
        'vendor/jquery-ui/jquery-ui.min.js',
        'vendor/angular-ui-sortable/sortable.min.js',
        'vendor/moment/min/moment-with-langs.min.js',
        'vendor/angular-moment/angular-moment.min.js',
        'vendor/angular-animate/angular-animate.min.js',
        'vendor/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js',
        'vendor/ngstorage/ngStorage.min.js'
    ],
    css: [
        'vendor/components-font-awesome/css/font-awesome.min.css'
    ],
    assets: [
    ],
    fonts: [
        'vendor/components-font-awesome/fonts/*'
    ]
  },

    appcache_literals: [
        'http://netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.css',
        'http://ghbtns.com/github-btn.html?user=flack&amp;repo=scorekeeper&amp;type=watch&amp;count=true',
        'https://platform.twitter.com/widgets/tweet_button.html?url=https%3A%2F%2Fflack.github.io%2Fscorekeeper&counturl=http%3A%2F%2Fflack.github.com%2Fscorekeeper&text=Check%20out%20%23scorekeeper%20-%20an%20awesome%20helper%20for%20board%20and%20card%20games%20%7C&hashtags=angularjs'
    ]
};
