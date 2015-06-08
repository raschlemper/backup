app.factory("ReportNewService", function(DataGrouperService, ComponentService, LinkService, PageService, 
    FormatterService,
    ReportPageService, ReportComponentService, ReportFormatterService) {

    var report = {};
    var link = {
        selected: [],
        values: [],
        lists: [],
        links: []
    };

    /* **************************************************************************** */

    /* TODO: Colocar esta método no momento em que o layout esta sendo criado. */

    var xt = {};

    xt.orderBy = function(fields) {
        return _.sortBy(fields, function(item) {
            return item.order;
        })
    }

    xt.createComponents = function(container) {
        var components = [];
        _.map(container.components, function(component) {
            if (!component.data) {
                component.data = {};
            }
            components.push({
                'containerType': container.type,
                'code': component._id,
                'type': component.type,
                'data': component.data
            });
        });
        return components;
    }

    xt.getComponents = function(layout) {
        var componentsList = [];
        _.map(layout.containers, function(container) {
            var components = xt.createComponents(container);
            componentsList = _.union(componentsList, components);
        })
        return componentsList;
    }

    xt.getReportFilter = function(layout) {
        var components = xt.getComponents(layout);
        var headerComponents = _.where(components, {
            'containerType': 'header'
        });
        var filters = _.reduce(headerComponents, function(memo, component) {
            if (component.data) {
                return _.union(memo, component.data.fields);
            }
        }, []);
        return xt.orderBy(filters);
    }

    /* **************************************************************************** */
    

    var getValueFields = function(filters) {
        var values = _.pluck(filters, 'value');
        var keys = _.pluck(filters, 'key');
        return _.map(keys, function(key, index) {
            var valueField = _.pluck(values[index], 'field');
            var keyField = _.pluck(key, 'field');
            return _.union(valueField, keyField);
        }, []);
    }

    var getValueField = function(field) {
        var values = field.value;
        return _.map(values, function(value) {
            return value.field;
        }, []);
    }

    var link = function(value, index) {
        return LinkService.link(value, index);
    }

    var links = function(registers, visio) {
        var filters = xt.getReportFilter(visio.layout);
        var fields = getValueFields(filters);
        return LinkService.links(registers, filters, fields);
    }


    /* *************************** ALTERAR **************************** */

    var findComponentByCode = function(code) {
        var comp = _.find(report.components, function(component){ 
            return _.isEqual(component.code, code);
        });
        return comp;
    }

    var setComponent = function(layout, indexContainer, indexComponent, componentReport) {
        if(!componentReport.rows) return;
        layout.containers[indexContainer].components[indexComponent].data = componentReport.rows;
    }

    var bindComponents = function(layout) {
        _.map(layout.containers, function(container, indexContainer) {
            _.map(container.components, function(component, indexComponent) {               
                componentReport = findComponentByCode(component._id);
                setComponent(layout, indexContainer, indexComponent, componentReport);
            });
        });
    }

    var createComponentWithoutField = function(registers, component) {
        component['values'] = ReportComponentService.createComponentWithoutField(registers, component);
        component['rows'] = ReportFormatterService.formatWithoutFields(component);
        return component;
    }

    var createComponentField = function(registers, component) {
        component['values'] = ReportComponentService.createComponentField(registers, component);
        component['rows'] = ReportFormatterService.formatFields(component);
        return component;
    }

    var createComponentGroup = function(registers, component) {
        component['values'] = ReportComponentService.createComponentGroup(registers, component);
        component['rows'] = ReportFormatterService.formatGroups(component);
        return component;
    }

    var componentFactory = function(registers, component) {
        if (!component.data) {
            return;
        }
        if (component.data.groups) {
            return createComponentGroup(registers, component);
        }
        if (component.data.fields) {
            return createComponentField(registers, component);
        }
        return createComponentWithoutField(registers, component);
    }

    var createComponent = function(registers, components) {
        return _.map(components, function(component) {
            return componentFactory(registers, component);
        });
    }






    var formatComponents = function(containers, page) {
        return _.map(containers, function(container) {                
            return { "components" : _.map(container.components, function(component) {
                    return ComponentService.create(page, component);
                })
            }
        });
    }

    var page = function(visio, page) {
        visio.layout.containers = formatComponents(visio.layout.containers, page);
        return visio;
    }

    var pages = function(registers, visio, selected) {
        return PageService.pages(selected, registers);
        // formatPageField(visio.layout.containers);
        // var filters = getReportFilter(visio.layout);
        // report.components = createComponent(filters, components);
        // bindComponents(visio.layout);
    }

    return {
        links: links,
        link: link,
        pages: pages,
        page: page
    }
});