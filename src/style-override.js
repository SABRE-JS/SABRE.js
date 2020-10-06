sabre["SSAStyleOverride"] = function(){
	var obj = {};
	return Object.create(Object,{
		toJSON:{
			value: function(){
				return "";
			},
			writable: false
		},

		clone:{
			value: function(){
				var new_override = new sabre["SSAStyleOverride"]();

				return new_override;
			},
			writable: false
		},
	});
};