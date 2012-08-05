var _ = require("underscore");
var fs = require("fs");
var path = require("path");

module.exports = {

	readConfig: function(config_path, callback) {
		var self = this;

		fs.stat(config_path, function(err, stat) {
			if (err) {
				return callback(err, null);	
			}

			if (stat.isDirectory()) {
				return self.readConfigDir(config_path, callback);			
			}	else {
				return self.readConfigFile(config_path, callback);			
			}
		});
	},

	readConfigFile: function(config_path, callback) {
		var self = this;	

		fs.readFile(config_path, function(err, output) {
			if (err) {
				return callback(err, null);	
			}

			try {
				return callback(null, JSON.parse(output));	
			} catch(e) {
				return callback(e, null);	
			}
		});
	},

	readConfigDir: function(config_path, callback) {
		var self = this;
		var combined_config = {};

		fs.readdir(config_path, function(err, files){
			if(err) {
				return callback(err, null);		
			}

			var isConfigFile = function(file){
				return path.extname(file) === ".json";	
			};

			var readNextFileInDir = function(file, next) {
				if (isConfigFile(file)) {
					self.readConfigFile(file, function(err, parsed_output){
						if(!err) {
							var section_config = {};
							section_config[path.basename(file, ".json")] = parsed_output;

							_.extend(combined_config, section_config);	
						}

						return next();	
					});	
				} else {
					return next();	
				}
			};			

			var readNexFileInDirCallback = function() {
				if (files.length) {
					return readNextFileInDir(files.pop(), readNexFileInDirCallback);
				} else {
					return callback(null, combined_config);	
				}
			};

			return readNexFileInDirCallback();
		});
	}
	
	// extend the default config, with given config
	// extend exisiting array and object values correctly
	// only override the existing array and object values if "propertyOverride" is defined
}