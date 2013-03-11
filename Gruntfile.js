module.exports = function(grunt){
	grunt.initConfig({
		jshint : {
			options : {
				"eqeqeq" : true,
				"bitwise" : true,
				"curly" : true,
				"sub" : true,
				"global" : {
					"jQuery" : true,
					"node" : true,
					"global" : true
				}
			},
			all_files : ['norikae-server.js', 'lib/*.js']	
		}
	});	

	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['jshint']);
}
