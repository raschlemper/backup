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

    var createComponentField = function(registers, component) {
        if(!component.data.fields) return;
        var groupers = groupRegister(registers, component.data.fields);
        var values = createRowField(groupers);
        return formatFields(values, component.data.fields);
    }

    var createComponentGroup = function(registers, component) {
        if(!component.data.groups) return;
        _.map(component.data.groups, function(group) {
            var groupers = groupRegister(registers, group.groups);
            var values = createRowGroup(group, groupers);
            return formatGroups(values, group);            
        });
    }

    var componentFactory = function(registers, component) {
        if(!component.data) return;
        if(component.data.groups) {
            return createComponentGroup(registers, component);  
        } else if(component.data.fields) {
            return createComponentField(registers, component);    
        }
        return createComponentWithoutField(component);    
    }

    var create = function(page, component) {
        page = PageService.page(page);
        component.data = componentFactory(page.page, component);
        return component;
    }

    return {
        create: create
    }

});