module.exports = {
    build: {
        options: {
            sourceMap: false,
            process: _processor
        },
        files: {
            'build/ng-zoom.js': [
                'tmp/ngZoom.Templates.js',
                'src/js/module.js',
                'src/js/services/**/*.js',
                'src/js/directives/**/*.js'
            ],
            'build/ng-zoom.css': [
                'src/css/ng-zoom.css'
            ]
        }
    }
};


function _processor (src, filepath) {
    if ( filepath.match(/module.js$/) ) return _processModuleJs(src, filepath);
    return src;
}

function _processModuleJs (src, filepath) {
    return src.replace('/*TEMPLATES*/', "'ngZoom.Templates'");
}
