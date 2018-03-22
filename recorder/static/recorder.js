$(document).ready(function() {
    getRoasts();
});

function makeTD(id, cellclass, contents) {
    td = $("<td>");
    s = $("<span>");
    s.attr("class", cellclass);
    s.data('id', id);
    td.append(s);
    s.append(contents);
    return td;
}

function getRoasts() {
    $.getJSON("/recorder/api/all_roasts", function(data) {
        $("#roasts").html("");
        button = $("<span class=button id=new_roast>Add New Roast</span>");
        $("#roasts").append(button);
        t = $("<table>");
        color = 'white';
        data.roasts.map(function(roast) {
            tr = $("<tr>");
            tr.attr("class", "roast_row");
            tr.attr("id", roast.id);
            tr.append(makeTD(roast.id, 'roast', roast.timestamp));
            tr.append(makeTD(roast.id, 'roast', roast.coffee_type));
            tr.append(makeTD(roast.id, 'roast', roast.roast_type));
            tr.append(makeTD(roast.id, 'roast', roast.weight + " lb"));
            tr.append(makeTD(roast.id, 'compare', "compare"));
            tr.append(makeTD(roast.id, 'delete', "delete"));
            t.append(tr);
        });
        $("#roasts").append(t);
        $(".roast").click(clickRoast);
        $(".delete").click(clickDelete);
        $(".delete").css('color', 'red');
        $(".compare").click(clickCompare);
        $(".compare").css('color', 'lightblue');
        button.click(addRoast);
    });
}

function drawGraph() {
    var roast = $(document).data('roast');
    var compare = $(document).data('compare');
    var bt = [];
    var et = [];
    var cbt = [];
    var cet = [];
    $(".roast_row").css("background-color", "white");
    if (roast) {
        roast.element.css("background-color", "#aaffaa");
        roast.data_points.map(function(dp) {
            if (dp.bean_temp > 0) {
                bt.push([dp.timestamp, dp.bean_temp]);
            }
            if (dp.element_temp > 0) {
                et.push([dp.timestamp, dp.element_temp]);
            }
        });
    }
    if (compare) {
        compare.element.css("background-color", "#eeffee");
        compare.data_points.map(function(dp) {
            if (dp.bean_temp > 0) {
                cbt.push([dp.timestamp, dp.bean_temp]);
            }
            if (dp.element_temp > 0) {
                cet.push([dp.timestamp, dp.element_temp]);
            }
        });
    }
    $.plot("#graph", [
        {'label': 'Prev Bean Temp', 'data': cbt, 'color': 'lightgreen'},
        {'label': 'Prev Element Temp', 'data': cet, 'color': 'pink'},
        {'label': 'Bean Temp', 'data': bt, 'color': 'green'},
        {'label': 'Element Temp', 'data': et, 'color': 'red'},
    ]);
}

function addRoast() {
    $("#input").html("");
    t = $("<table>");
    t.append("<tr><td>Bean:</td><td><input type=text id=bean></td></tr>");
    t.append("<tr><td>Roast:</td><td><input type=text id=roast></td></tr>");
    t.append("<tr><td>Weight:</td><td><input type=text id=weight></td></tr>");
    t.append("<tr><td></td><td><input type=submit id=save_roast value=Save></td></tr>");
    $("#input").append(t);
    $("#bean").focus();
    $("#save_roast").click(saveRoast);
}

function saveRoast() {
    obj = {
            "coffee_type": $("#bean").val(),
            "roast_type": $("#roast").val(),
            "weight": $("#weight").val()
    };
    $.post("/recorder/api/create_roast", obj, function() {
        $("#input").html("");
        getRoasts();
        drawGraph();
    });
}

function clickDelete(e) {
    var id = $(e.target).data('id');
    if (!confirm("Delete Roast " + id + ": Are you sure?")) {
        return;
    }
    $.getJSON("/recorder/api/delete_roast?roast_id=" + id, function() {
        $("#input").html("");
        getRoasts();
        drawGraph();
    });
}

function sizeInput() {
    var maxX = 0;
    $("#input").children().each(function(index) {
        var l = $(this).offset().left;
        var w = $(this).width();
        maxX = Math.max(l+w, maxX);
    });
    console.log("maxX = " + maxX);
    $("#input").width(maxX);
    $("#graph").width($("body").width() - maxX);
}

function clickRoast(e) {
    var id = $(e.target).data('id');
    $(document).data('id', id);
    if ($("#roast").val() != id) {
        $("#input").html("");
        $("#input").append("<input type=hidden id=roast value=" + id + ">");
        var t = $("<table>");
        t.append("<tr><td>Bean Temp:</td><td><input type=text class=dp id=bean_temp></td></tr>");
        t.append("<tr><td>Heat Setting:</td><td><input type=text class=dp id=heat_setting></td></tr>");
        t.append("<tr><td>Element Temp:</td><td><input type=text class=dp id=element_temp></td></tr>");
        t.append("<tr><td>Loft Setting:</td><td><input type=text class=dp id=loft_setting></td></tr>");
        t.append("<tr><td>Event:</td><td><input type=text maxlength=100 class=dp id=event></td></tr>");
        $("#input").append(t)

        $(".dp").change(saveDP);
        sizeInput();
    }
    $.getJSON("/recorder/api/roast?roast_id=" + id, function(data) {
        data.element = $("#" + id);
        $(document).data('roast', data);
        drawGraph();
    });
}

function clickCompare(e) {
    var id = $(e.target).data('id');
    $(document).data('cid', id);
    $.getJSON("/recorder/api/roast?roast_id=" + id, function(data) {
        data.element = $("#" + id);
        $(document).data('compare', data);
        drawGraph();
    });
}

function saveDP (e) {
    var id = $(document).data('roast').roast_info.id;
    var start = $(document).data('roast').roast_info.timestamp;
    if ((Date.now()/1000 - start) > 3600) {
        alert ("Roast is completed");
        return;
    }
    var field = $(e.target).attr('id');
    var value = $(e.target).val();
    e.target.value = '';
    obj = {
            "roast": id,
    };
    obj[field] = value;
    $.post("/recorder/api/create_datapoint", obj, function() {
        $.getJSON("/recorder/api/roast?roast_id=" + id, function(data) {
            data.element = $("#" + id);
            $(document).data('roast', data);
            drawGraph();
        });
    });
}
