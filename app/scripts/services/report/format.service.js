app.factory("FormatService", function(DataGrouperService) {

    var applyFormat = function(groups, format) {
        if(!format) return;      
        var res = [];  
        var key = format.key;
        var fields = getFields(_.pluck(format.fields, 'value'));
        _.map(groups, function(group) {
            _.map(fields, function(field) {
                var values = _.pluck(group.vals, field);
                _.map(values, function(value) {
                    var obj = angular.copy(group.key); 
                    obj[key] = value;                   
                    res.push(obj);
                });
            });
            console.log(group, res);
        });
    }

    var apply = function() {
        
    }

    return {
        apply: aplly
    }
});