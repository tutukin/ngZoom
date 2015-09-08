module.exports = function (grunt) {
    var gtx = require('gruntfile-gtx').wrap(grunt);
    
    gtx.loadAuto();
    
    var gruntConfig = require('./grunt');
    gruntConfig.package = require('./package.json');
    
    gtx.config(gruntConfig);
    
    gtx.alias('build', ['clean:build', 'html2js:templates', 'concat:build']);
    
    gtx.finalise();
};