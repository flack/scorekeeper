/**
 * Loads the app into the global scope the way the browser does (as classic
 * scripts, using the file lists from build.config.js). Runs before every spec file.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { globSync } from 'tinyglobby';

const require = createRequire( import.meta.url );
const config = require( '../build.config.js' );

function loadScript( file ) {
    // Indirect eval runs the code as a sloppy-mode global script, like a <script> tag
    ( 0, eval )( readFileSync( file, 'utf8' ) + '\n//# sourceURL=' + file );
}

config.vendor_files.js.forEach( loadScript );

// angular-mocks only sets up module()/inject() when it detects jasmine or mocha,
// and needs a `this` in its hooks to store the per-test injector on.
const { beforeEach, afterEach } = globalThis;
const spec = {};
const withSpec = ( hook ) => ( fn ) => hook( () => fn.call( spec ) );
Object.assign( globalThis, { mocha: {}, beforeEach: withSpec( beforeEach ), afterEach: withSpec( afterEach ) } );
config.test_files.js.forEach( loadScript );
Object.assign( globalThis, { mocha: undefined, beforeEach, afterEach } );

// Stands in for html2js' templates-app module; no test renders templates
angular.module( 'templates-app', [] );

globSync( config.app_files.js ).sort().forEach( loadScript );
