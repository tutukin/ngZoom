module.exports = {
    build: {
        options: {
            sourceMap: false
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