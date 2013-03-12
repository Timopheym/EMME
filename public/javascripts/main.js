
/**
 * Created with JetBrains PhpStorm.
 * User: timopheym
 * Date: 11.05.12
 * Time: 1:58
 * To change this template use File | Settings | File Templates.
 */
$(document).ready(function(){
    "use strict";
    $(function ($, _, Backbone, io) {
        var socket =  io.connect(),  App;

        $.fn.serializeObject = function(){
            var o = {};
            var a = this.serializeArray();
            $.each(a, function() {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };
        var expTpl = '<div id="dialog"> ' +
            '<select>' +
            '<option>Графическое представление</option>' +
            '<option>Графики</option>' +
            '<option>Данные</option>' +
            '</select>' +
            '<fieldset style="width: 150px; height: 100px;"> </fieldset>'+
            '<input id="toExport" type="button" value="Экспортировать">' +
            '</div>';
        var tabTpl = '<fieldset>' +
            '<div title="С" class="control-group smallVals"><label for="start">Отрезок &nbsp;&nbsp;&nbsp;С </label><input class="start_val" type="number" value="<%=start%>" name="c0start"></div>' +
            '<div title="До" class="control-group smallVals"><label for="end">До </label><input class="end_val" type="number" value="<%=end%>" name="end"></div>' +
            '<i class="icon-cancel-circle" id="duch-<%=id%>"></i>' +
            '<table><tbody>' +
            '<tr><th>Стратегия</th><td><input type="button" value="сохр.стр.как"></td><td></td></tr>' +
            '<tr>' +
            '<th><select id="#strategy_val" name="strategy">' +
            '<option value="growth">развития</option><option value="save">сохранения</option><option value="decline">упадка</option>' +
            '</select></th>' +
            '<th>Зароботная плата</th><th>Деньги на развитие</th>' +
            '</tr>' +
            '<tr><th>Пользователи</th><td><input class="XQ_val" type="text" value="<%=XQ%>" name="XQ"></td>' +
            '<td><input class="EQ_val" type="text" value="<%=EQ%>" name="EQ"></td></tr>' +
            '<tr><th>Распорядители</th><td><input class="XR_val" type="text" value="<%=XR%>" name="XR"></td>' +
            '<td><input class="ER_val" type="text" value="<%=ER%>" name="ER"></td></tr>' +
            '<tr><th>ВладетелиВедатели</th><td><input class="XS_val" type="text" value="<%=XS%>" name="XS"></td>' +
            '<td><input class="ES_val" type="text" value="<%=ES%>" name="ES"></td></tr>' +
            '<tr><th colspan="2">Внетрудовое присв. влад.вед.</th><td><input class="XSS_val" type="text" value="<%=XSS%>" name="XSS"></td>' +
            '</tr>' +
            '</tbody></table>'+
            '</fieldset>';
        var Artel, ArtelsList, Artels;
        Artel = Backbone.Model.extend({

            // MongoDB uses _id as default primary key
            idAttribute: "_id",

            noIoBind: false,

            socket: socket,

            url: function () {
                return "/artel" + ((this.id) ? '/' + this.id : '');
            },

            defaults: function () {
                return {
                    title: "empty todo...",
                    order: Artels.nextOrder(),
                    done: false
                };
            },

            initialize: function () {
                if (!this.get("title")) {
                    this.set({"title": this.defaults.title});
                }
                this.on('serverChange', this.serverChange, this);
                this.on('serverDelete', this.serverDelete, this);
                this.on('modelCleanup', this.modelCleanup, this);
                if (!this.noIoBind) {
                    this.ioBind('update', this.serverChange, this);
                    this.ioBind('delete', this.serverDelete, this);
                    this.ioBind('lock', this.serverLock, this);
                    this.ioBind('unlock', this.serverUnlock, this);
                }
            },

            toggle: function () {
                this.save({done: !this.get("done")});
            },

            clear: function (options) {
                this.destroy(options);
                this.modelCleanup();
            },

            serverChange: function (data) {
                data.fromServer = true;
                this.set(data);
            },

            serverDelete: function (data) {
                if (typeof this.collection === 'object') {
                    this.collection.remove(this);
                } else {
                    this.trigger('remove', this);
                }
            },

            serverLock: function (success) {
                if (success) {
                    this.locked = true;
                    //this.trigger('lock', this);
                }
            },

            serverUnlock: function (success) {
                if (success) {
                    this.locked = false;
                }
            },

            modelCleanup: function () {
                this.ioUnbindAll();
                return this;
            },

            locked: false,

            lock: function (options) {
                if (!this._locked) {
                    options = options ? _.clone(options) : {};
                    var model = this
                        , success = options.success;
                    options.success = function (resp, status, xhr) {
                        model.locked = true;
                        if (success) {
                            success(model, resp);
                        } else {
                            model.trigger('lock', model, resp, options);
                        }
                    };
                    options.error = Backbone.wrapError(options.error, model, options);
                    return (this.sync || Backbone.sync).call(this, 'lock', this, options);
                }
            },

            unlock: function (options) {
                if (this.locked) {
                    options = options ? _.clone(options) : {};
                    var model = this
                        , success = options.success;
                    options.success = function (resp, status, xhr) {
                        model._locked = false;
                        if (success) {
                            success(model, resp);
                        } else {
                            model.trigger('unlock', model, resp, options);
                        }
                    };
                    options.error = Backbone.wrapError(options.error, model, options);
                    return (this.sync || Backbone.sync).call(this, 'unlock', this, options);
                }
            }
        });

        ArtelsList = Backbone.Collection.extend({

            // Reference to this collection's model.
            model: Artel,

            socket: socket,

            // Returns the relative URL where the model's resource would be
            // located on the server. If your models are located somewhere else,
            // override this method with the correct logic. Generates URLs of the
            // form: "/[collection.url]/[id]", falling back to "/[urlRoot]/id" if
            // the model is not part of a collection.
            // Note that url may also be defined as a function.
            url: function () {
                return "/artel" + ((this.id) ? '/' + this.id : '');
            },

            initialize: function () {
                this.on('collectionCleanup', this.collectionCleanup, this);
                socket.on('/artel:create', this.serverCreate, this);
            },

            serverCreate: function (data) {
                if (data) {
                    // make sure no duplicates, just in case
                    var artel = Artels.get(data._id);
                    if (typeof artel === 'undefined') {
                        Artels.add(data);
                    } else {
                        data.fromServer = true;
                        artel.set(data);
                    }
                }
            },

            collectionCleanup: function (callback) {
                this.ioUnbindAll();
                this.each(function (model) {
                    model.modelCleanup();
                });
                return this;
            },

            done: function () {
                return this.filter(function (todo) { return todo.get('done'); });
            },

            remaining: function () {
                return this.without.apply(this, this.done());
            },

            // We keep the Todos in sequential order, despite being saved by unordered
            // GUID in the database. This generates the next order number for new items.
            nextOrder: function () {
                if (!this.length) { return 1; }
                return this.last().get('order') + 1;
            },

            comparator: function (todo) {
                return todo.get('order');
            }

        });

        Artels = new ArtelsList();

        var User = Backbone.Model.extend({
            // MongoDB uses _id as default primary key
            idAttribute: "_id",
            noIoBind: false,
            socket: socket,
            url: function () {
                return "/user" + ((this.id) ? '/' + this.id : '');
            },
            defaults: function () {
                return {
                    name: "Вася Пупкин"
                };
            }
        });
        var user = new User();
        var AppView = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: $("#app"),

            // Our template for the line of statistics at the bottom of the app.
            // Delegated events for creating new items, and clearing completed ones.
            events: {
                //     'mousedown .menu-link-model' : 'renameArtel',
                'click .menu-link-model'    : 'clickArtelMenu',
                'click #plusArtel'          : 'plusArtel',
                'click #calculate'          : 'calculate',
                'click #reset'              : 'reset',
                'click #save'               : 'save',
                'click #todefaut'           : 'toDefault',
                'click #export'             : 'export',
                'change #attrs input'       : 'unsave'
            },
            unsave : function(){
                $('#save').removeAttr('disabled');
            },
            clickArtelMenu : function(e){
                var link = $(e.currentTarget);
                $('#artels-menu .ui-tabs-selected').removeClass('ui-tabs-selected');
                $('#artels-menu .ui-state-active').removeClass('ui-state-active');
                //link.addClass('selected');
                link.parent().addClass('ui-tabs-selected');
                link.parent().addClass('ui-state-active');
                var id = $(link).attr('id').replace('artel-link-','');
                this.openArtel(Artels.get(id));
            },
            renameArtel : function(e){
                if (e.which === 3) {
                    /* Right Mousebutton was clicked! */
                    $('<div id="dialog"> <input type="text" id="artelName" name="name">' +
                        '<input id="addArtel" type="button" value="Переименовать">' +
                        '</div>' ).dialog({
                            title: "Переименовать артель"
                        });
                    var link = $(e.currentTarget);
                    var id = $(link).attr('id').replace('artel-link-','');
                    var artel = Artels.get(id);
                }
                e.preventDefault();
                return false;
            },
            export : function(){
                $(_.template(expTpl,{})).dialog({
                    title: "Экспорт"
                });
            },
            plusArtel : function(){
                $('<div id="dialog"> <input type="text" id="artelName" name="name">' +
                    '<input id="addArtel" type="button" value="Добавить">' +
                    '</div>' ).dialog({
                        title: "Добавить артель"
                    });
            },
            addArtel : function(that){
                $('#dialog').dialog("close");
                var name = $('#artelName').val();
                var artel = new Artel({name: name});
                $('.menu-link-model').bind('contextmenu', function(e){
                    e.preventDefault();
                    return false;
                });
                artel.save();
            },
            save : function(){
                var data = $('#attrsForm').serializeObject();
                this.model.get('attrs').K = 1;
                console.log(this.model.get('name'));
                this.model.attributes.name = 123;
                console.log(this.model.get('name'));
                this.model.set({name: 123});
                console.log(this.model.get('name'));
                this.model.save({name: 123});
                console.log(this.model.get('name'));
                this.model.attributes.name = 123;
                console.log(this.model.get('name'));
                this.model.save({name: 123});
                console.log(this.model);
                $('#save').attr('disabled',"disabled");
            },
            toDefault : function(){
                alert('toDefault');
            },
            reset : function(){
                alert('reset');
            },
            openArtel : function(artel){
                this.model = artel;
                AppView.model = artel;
                var attrs = artel.get('attrs');
                for (var p in attrs){
                    if (p != 'intervals')
                    {
                        $('#'+p+'_val').val(attrs[p]);
                    }
                    else {
                        $('#timingAttrs li').each(function(){
                            if (!$(this).hasClass('plus')) $(this).remove();

                        });
                        $('#timingAttrs .uch').remove();
                        for (var i in attrs.intervals){
                            this.addInterval(attrs.intervals[i]);
                        }
                    }
                }
            },
            calculate : function(){
                socket.emit('calculate',{id: this.model.id});
                $.blockUI.defaults.message = "Идут расчеты...";
                $.blockUI({ css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff'
                } });
                socket.on('calculate',function(data){               //Посчитали
                    if (data == null || data == undefined) {
                        console.error('Wrong calculate data', data);
                        return;
                    }
                    $('#K_table').html('');$('#Q_table').html('');$('#R_table').html('');$('#S_table').html('');
                    for (var i in data.K){
                        $('#K_table').append(data.K[i]+"<br>");
                        $('#Q_table').append(data.Q[i]+"<br>");
                        $('#R_table').append(data.R[i]+"<br>");
                        $('#S_table').append(data.S[i]+"<br>");
                    }
                    $.unblockUI();
                    AppView.model.result = data;
                    if ($("#pages").tabs( "option" , "selected") == 1){
                        graphs.showGraphs();
                    }
                });
                this.save();
            },
            // At initialization we bind to the relevant events on the `Todos`
            // collection, when items are added or changed. Kick things off by
            // loading any preexisting todos.
            initialize: function (initalData) {
                var that = this;
                this.model = new appModel();
                $('#artels-menu li').each(function(){
                    $(this).click(function(){
                        if(!$(this).hasClass('plus')){
                            $('#artels-menu li.ui-tabs-selected').removeClass('ui-tabs-selected');
                            $('#artels-menu li.ui-tabs-selected').removeClass('ui-state-active');
                            $(this).addClass('ui-tabs-selected');
                            $(this).addClass('ui-state-active');
                        }
                    })
                });

                $('#addArtel').live('click',function(){
                    that.addArtel(that);
                });
                //this.render();
                Artels.on('add', this.addOne, this);
                Artels.on('reset', this.addAll, this);
                Artels.on('all', this.render, this);
                Artels.fetch({
                    success: function (artels, models) {
                        var data = initalData.todo
                            , locks = ((data && data.locks) ? data.locks : [])
                            , model;
                        _.each(locks, function (lock) {
                            model = artels.get(lock);
                            if (model) {
                                model.lock();
                            }
                        });
                        $('#artels-menu .menu-link-model').first().click();
                    }
                });
                //artels.fetch();
            },
            addOne: function (artel) {
                $('#artels-menu .plus').before('<li class="ui-state-default ui-corner-top"><a id="artel-link-'+artel.id+'" class="menu-link-model">'+artel.get('name')+'</a></li>');
            },

            // Add all items in the **Todos** collection at once.
            addAll: function () {
                Artels.each(this.addOne);
            },
            addInterval : function(interval){
                var intervals = this.model.get('attrs').intervals;
                var index = 0;
                for (var i in intervals){
                    if (interval.id == intervals[i].id) break;
                    index++;
                }
                var count = intervals.length;
                var tab_title = "Уч. " + (index+1);
                var $timesTabs = $("#timingAttrs");
                $timesTabs.tabs( "add", "#uch-" + index, tab_title );
                $( "li", $timesTabs).each(function(){
                    $timesTabs.tabs("enable", $( "li", $timesTabs).index(this));
                });
                $('#plusUch').parent('li').appendTo('#timingAttrs ul');
                interval.id = index;
                $('#uch-'+index).append(_.template(tabTpl,interval));
            },
            removeInterval : function(index){
                var intervals = this.model.get('intervals');
                // this.model.set({intervals: intervals});
                var count = intervals.length;
                var $timesTabs = $("#timingAttrs");
                $timesTabs.tabs("remove",index-1);
                var i = 1;
                $( "li", $timesTabs).each(function(){
                    if (!$(this).hasClass('plus'))
                    {
                        var id = $($(this).children('a')[0]).attr('href').replace('#uch-','');
                        $('#uch-'+id).attr('id','uch-'+i);
                        $($('#uch-'+id).children('i')[0]).attr('id','duch-'+i);
                        $($(this).children('a')[0]).attr('href','#uch-'+i).html('Уч. '+i);
                        i++
                    }
                });
                count--;

            },
            // Re-rendering the App just means refreshing the statistics -- the rest
            // of the app doesn't change.
            render: function () {
                var that = this;
                /*GENERAL MENU*/
                $('#pages').tabs();

                /*ATTRS ACCORDION*/
                $('#acc').accordion({autoHeight:false});
                //$acc.accordion('disable').accordion('enable').accordion('activate',0);
                //Tabs
                $("#timingAttrs").tabs({
                    tabTemplate: "<li><a href='#{href}'>#{label}</a></li>", //<span class='ui-icon ui-icon-close'></span>
                    panelTemplate: "<div class='uch'></div>"
                });
                //Add Tab (plus click)
                $('#plusUch').bind('click',function(){
                    that.addInterval({})
                });
                $('.icon-cancel-circle').live('click',function(){
                    that.removeInterval($(this).attr('id').replace('duch-',''));
                });
            }
        });
        var graphsModel = Backbone.Model.extend({
            initialize: function (){
            },
            showGraphs: function(){
                if (AppView.model.result == undefined) return;
                var data = {
                    Q: AppView.model.result.Q,
                    R: AppView.model.result.R,
                    S: AppView.model.result.S,
                    K: AppView.model.result.K
                };
                var n = 0,
                    D={},
                    options = {
                        lines: { show: true }
                    };
                for (var i in data){
                    n++;
                    D[i]  = [];
                    for (var k = 0; k < data[i].length; k++){
                        D[i].push([k,data[i][k]/1])
                    }
                }
                var options = {
                        lines: { show: true }
                    },
                    g1 = $("#gK .data"),
                    g2 = $("#gQ .data"),
                    g3 = $("#gR .data"),
                    g4 = $("#gS .data");
                var labels = {marks: { show: true }, data: [], markdata: []};
                $('.start_val').each(function(){
                    var val = $(this).val();
                    labels.markdata.push({label: val, position: val, row: 0});
                });
                var plots = [];
                plots['K'] = $.plot(g1, [ /*{data:*//*,label: 'ha'}*/D['K'],labels], options);
                plots['Q'] = $.plot(g2, [ D['Q'], labels], options);
                plots['R'] = $.plot(g3, [D['R'],labels], options);
                plots['S'] = $.plot(g4, [ D['S'],labels], options);
                for (var i in plots){
                    plots[i].resize();
                    plots[i].setupGrid();
                    plots[i].draw();
                }
                $('.graph').append('<i class="icon-zoom-in"></i>');
                //Показать\УБрать Лупу
                $('.graph').hover(function(){
                    $($(this).children('.icon-zoom-in')[0]).css({display: 'block'});
                });
                $('.graph').mouseleave(function(){
                    $($(this).children('.icon-zoom-in')[0]).css({display: 'none'});
                });
                //Настроийки большого графика
                var placeholder = $('#bigGraph');
                placeholder.hover(function(){
                    $($(this).children('.icon-zoom-out')[0]).css({display: 'block'});
                });
                placeholder.mouseleave(function(){
                    $($(this).children('.icon-zoom-out')[0]).css({display: 'none'});
                });
                var bigPlot = $.plot(placeholder,[], {
                    zoom: {
                        interactive: true
                    },
                    pan: {
                        interactive: true
                    }
                });
                placeholder.append('<i class="icon-zoom-out"></i>');
                $('<div class="button" style="right: 365px;top:5px">zoom in</div>').appendTo(placeholder).click(function (e) {
                    e.preventDefault();
                    bigPlot.zoom();
                });
                $('<div class="button" style="right: 365px;top:20px">zoom out</div>').appendTo(placeholder).click(function (e) {
                    e.preventDefault();
                    bigPlot.zoomOut();
                });
                //Увеличение графика
                $('#bigGraph .icon-zoom-out').click(function(){
                    $('.graph').show();
                    $('#bigGraph').hide();
                });
                $('.graph .icon-zoom-in').click(function(){
                    $('.graph').hide();
                    placeholder.show();
                    var that = $(this).parent();
                    var data = plots[$(that).attr('id').replace('g','')].getData();
                    bigPlot.setData(data);
                    bigPlot.zoomOut();
                });
                //Соединение графиков
                $('#graphs.page .icon-resize-full-alt,#graphs.page .icon-resize-small-alt,').click(function(){
                    $(this).toggleClass('icon-resize-full-alt');
                    $(this).toggleClass('icon-resize-small-alt');
                    if($(this).hasClass('icon-resize-full-alt')){
                        var data = [],src;
                        for (var i in plots){
                            src = t[i].getData()
                            for (var k in src){
                                data.push(src[k]);
                            }
                        }
                        bigPlot.setData(data);
                        $('.graph').hide();
                        placeholder.show();
                        bigPlot.zoomOut();
                    }
                    else if($(this).hasClass('icon-resize-small-alt')){
                        $('.graph').show();
                        $('#bigGraph').hide();
                    }
                });
            }});
        var appModel = Backbone.Model.extend({
            initialize: function (){
            }
        });
        var graphs = new graphsModel();
        var graphsView = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: $("#graphs"),
            initialize: function (){
                this.render();
                $("#pages").bind('tabsshow', function(event, ui) {
                    if (ui.index == 1) {   // second tab
                        graphs.showGraphs();
                        //this.render();
                    }
                });
            },
            render: function (){}
        });
        var phiView = Backbone.View.extend({
            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: $("#graphPhi"),
            initialize: function (){
                this.render();
            },
            render: function (){
                var options = {
                    lines: { show: true }
                };
                //Настроийки большого графика
                var placeholder = $("#phiContent");
                var plot = $.plot(placeholder,[[[0, 12], [7, 12], [8, 5], [7, 2.5], [12, 2.5]]], {
                    zoom: {
                        interactive: true
                    },
                    pan: {
                        interactive: true
                    }
                });
                $('<div class="button" style="right: 365px;top: -490px;position: relative;">zoom in</div>').appendTo(placeholder).click(function (e) {
                    e.preventDefault();
                    plot.zoom();
                });
                $('<div class="button" style="right: 365px;top: -490px;position: relative;">zoom out</div>').appendTo(placeholder).click(function (e) {
                    e.preventDefault();
                    plot.zoomOut();
                });
            }
        });
        var helpView = Backbone.View.extend({

            // Instead of generating a new element, bind to the existing skeleton of
            // the App already present in the HTML.
            el: $("#help"),
            initialize: function (){
                this.render();
            },
            render: function (){
            }
        });

        new graphsView({model:graphs});
        // new phiView();
        socket.emit('connect', ['artel'], function (err, data) {
            if (err) {
                console.log('Unable to connect.');
            } else {
                App = new AppView(data);
            }
        });
        ///////////////////////////////---------------------------------------------------------------------------------------------------------------------------------

    }(jQuery, _, Backbone, io));
});
