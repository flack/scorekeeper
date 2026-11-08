/**
 * Loads the app into the global scope the way the browser does (as classic
 * scripts, using the file lists from build.config.js). Runs before every spec file.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInThisContext } from 'node:vm';
import { createRequire } from 'node:module';
import { globSync } from 'tinyglobby';

const require = createRequire( import.meta.url );
const config = require( '../build.config.js' );

function loadScript( file ) {
    // Runs the code as a sloppy-mode global script, like a <script> tag. Naming it
    // by its file URL lets V8 attribute it to the file, for coverage reports.
    runInThisContext( readFileSync( file, 'utf8' ), { filename: pathToFileURL( resolve( file ) ).href } );
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
