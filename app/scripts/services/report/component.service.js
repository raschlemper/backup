app.factory("ComponentService", function(DataGrouperService, PageService, FormatterService, ReportFunctionService) {     

    // TODO: Criar um service para colocar os métodos de recuperação e tratamento de campos 
    var getFields = function(values) {
        var fields = [];
        _.map(values, function(value) {
            fields = _.union(fields, _.pluck(value, 'field'));
        });
        return fields;
    }    

    var getValues = function(field) {
        var values = {};
        values[field] = _.pluck(field.value, 'field');
        return values;
    }

    var getGroupValues = function(registers) {
        return _.pluck(registers, 'vals');
    }

    var groupRegister = function(registers, fields) {
        var fields = getFields(_.pluck(fields, 'value'));
        return DataGrouperService.group(registers, fields);
    }
    // ********************************************************************************* //


    var applyFormula = function(field, register, registers) {
        var formula = field.formula;
        return ReportFunctionService.calculate(formula, getValues(field), register.vals,
            getGroupValues(registers));
    }

    var createRow = function(register, result) {
        if (!result) {
            return register.key;
        }
        return _.extend(register.key, result);
    }

    var createRowField = function(registers) {
        var rows = [];
        _.map(registers, function(register) {
            rows.push(createRow(register, null));
        });
        return rows;
    }

    var createRowGroup = function(group, registers) {
        var rows = [];
        // _.map(data.groups, function(group) {
            _.map(registers, function(register) {
                var result = applyFormula(group.field, register, registers);
                rows.push(createRow(register, result));
            });
        // });
        return rows;
    }

    var formatWithoutFields = function(values) {   
        var rows = [];     
        rows.push(values);
        return rows;
    }

    var formatFields = function(values, fields) {
        var rows = [];
        _.map(values, function(value, index) {
            rows.push(FormatterService.formatFields(value, fields));
        });
        return rows;
    }

    var formatGroups = function(values, groups) {
        var rows = [];
        _.map(values, function(value, index) {
            var groupsRows = FormatterService.formatField(value, groups.field);
            var fieldsRows = FormatterService.formatFields(value, groups.groups);
            rows.push(_.union(groupsRows, fieldsRows));
        });
        return rows;
    }

    var createComponentWithoutField = function(component) {
        if(component.data.fields || component.data.groups) return;
        return formatWithoutFields(component.data);
    }

    var createComponentGroup = function(registers, component) {
        if(!component.data.groups) return;
        _.map(component.data.groups, function(group) {
            var groupers = groupRegister(registers, group.groups);
            var values = createRowGroup(group, groupers);
            return formatGroups(values, group);            
        });
    }



    // TODO: Criar um servico para format; verificar qual o tipo de format.
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

    var createFields = function(registers, componentFields) {
        if(!componentFields) return;
        var fields = getFields(_.pluck(componentFields, 'value'));
        return DataGrouperService.keys(registers, fields);
        // var values = createRowField(groupers);
        // return formatFields(values, fields);
    }

    var createGroups = function(registers, component) {
        if(!component.data.fields) return registers;
        var fields = getFields(_.pluck(component.data.fields, 'value'));
        return DataGrouperService.group(registers, fields);
    }

    var createComponentField = function(registers, component) {
        var groups = createGroups(registers, component);
        applyFormat(groups, component.data.format); // Deve formatar cada registro dos fields acima, conforme sua orientação. Ex. inline ou inblock
        //createFieldsFormula // Deve acrescentar a cada registro dos fields acima, o field da formula

        var fields = createFields(registers, component.data.fields); // Deve montar a lista agrupada pelos fields
        // console.log("fields", groups);
    }

    var componentFactory = function(registers, component) {
        if(!component.data) return;
        var data = createComponentField(registers, component);
        if(data) { 
            data = createComponentWithoutField(component); 
        }
        return data;
        
        // if(!component.data) return;
        // if(component.data.groups) {
        //     return createComponentGroup(registers, component);  
        // } else if(component.data.fields) {
        //     return createComponentField(registers, component);    
        // }
        // return createComponentWithoutField(component);    
    }

    var create = function(page, component) {
        // page = PageService.page(page);
        component.data = componentFactory(page, component);
        return component;
    }

    return {
        create: create
    }

});