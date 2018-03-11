$(document).ready(function() {
    getRoasts();
});

function makeTD(id, cellclass, contents) {
    td = $("<td>");
    s = $("<span>");
    s.attr("class", cellclass);
    s.attr("id", id);
    td.append(s);
    s.append(contents);
    return td;
}

function getRoasts() {
    $.getJSON("/recorder/api/all_roasts", function(data) {
        $("#roasts").html("");
        button = $("<span class=button id=new_roast>New Roast</span>");
        $("#roasts").append(button);
        t = $("<table>");
        color = 'white';
        data.roasts.map(function(roast) {
            tr = $("<tr>");
            tr.append(makeTD(roast.id, 'roast', roast.timestamp));
            tr.append(makeTD(roast.id, 'roast', roast.coffee_type));
            tr.append(makeTD(roast.id, 'roast', roast.roast_type));
            tr.append(makeTD(roast.id, 'roast', roast.weight + " lb"));
            tr.append(makeTD(roast.id, 'roast', roast.quality));
            tr.append(makeTD(roast.id, 'roast', "\u21d0"));
            tr.append(makeTD(roast.id, 'compare', "\u21d2"));
            tr.append(makeTD(roast.id, 'delete', "\u274c"));
            t.append(tr);
            tr.css('background-color', color);
            if (color == 'white') {
                color = '#ccccff';
            } else {
                color = 'white';
            }
        });
        $("#roasts").append(t);
        $(".roast").click(clickRoast);
        $(".delete").click(clickDelete);
        $(".compare").click(clickCompare);
        button.click(addRoast);
    });
}

function addRoast() {
    $("#content").html("");
    $("#input").html("");
    $("#input").append("Bean: <input type=text id=bean> ");
    $("#input").append("Roast: <input type=text id=roast> ");
    $("#input").append("Weight: <input type=text id=weight> ");
    $("#input").append("<span class=button id=save_roast>Save</span>");
    $("#save_roast").click(saveRoast);
}

function saveRoast() {
    obj = {
            "coffee_type": $("#bean").val(),
            "roast_type": $("#roast").val(),
            "weight": $("#weight").val()
    };
    $.post("/recorder/api/create_roast", obj, function() {
        getRoasts();
        $("#input").html("");
    });
}

function clickDelete(e) {
    if (!confirm("Delete Roast: Are you sure?")) {
        return;
    }
    var id = $(e.target).attr('id');
    $.getJSON("/recorder/api/delete_roast?roast_id=" + id, function() {
        getRoasts();
        $("#input").html("");
        $("#content").html("");
        $("#compare").html("");
    });
}

function clickRoast(e) {
    var id = $(e.target).attr('id');
    getRoastDetails(id);
    if ($("#roast").val() != id) {
        $("#input").html("");
        $("#input").append("<input type=hidden id=roast value=" + id + ">");
        $("#input").append("Bean Temp: <input type=text class=dp id=bean_temp> ");
        $("#input").append("Heat Setting: <input type=text class=dp id=heat_setting> ");
        $("#input").append("Element Temp: <input type=text class=dp id=element_temp> ");
        $("#input").append("Loft Setting: <input type=text class=dp id=loft_setting> ");
        $("#input").append("Event: <input type=text maxlength=100 class=dp id=event> ");

        $(".dp").change(saveDP);
    }
}

function clickCompare(e) {
    var id = $(e.target).attr('id');
    getRoastDetails(id, "#compare");
}

function getRoastDetails (id, target="#content") {
    $.getJSON("/recorder/api/roast?roast_id=" + id, function(data) {
        $(target).html("");
        t = $("<table>");
        t.append("<tr> <th>Elapsed</th> <th>Bean Temp</th> <th>Heat Setting</th> <th>Element Temp</th> <th>Loft Setting</th> <th>Event</th> </tr>");
        color = 'white';
        data.data_points.map(function(dp) {
            tr = $("<tr>");
            tr.append(makeTD(dp.id, 'dp', dp.timestamp));
            tr.append(makeTD(dp.id, 'dp', dp.bean_temp));
            tr.append(makeTD(dp.id, 'dp', dp.heat_setting));
            tr.append(makeTD(dp.id, 'dp', dp.element_temp));
            tr.append(makeTD(dp.id, 'dp', dp.loft_setting));
            tr.append(makeTD(dp.id, 'dp', dp.event));
            t.append(tr);
            tr.css('background-color', color);
            if (color == 'white') {
                color = '#ccffcc';
            } else {
                color = 'white';
            }
        });
        $(target).append(t);
    });
}

function saveDP (e) {
    var id = $("#roast").val();
    var field = $(e.target).attr('id');
    var value = $(e.target).val();
    obj = {
            "roast": id,
//            "bean_temp": $("#bean_temp").val(),
//            "element_temp": $("#element_temp").val(),
//            "heat_setting": $("#heat_setting").val(),
//            "loft_setting": $("#loft_setting").val(),
//            "event": $("#event").val()
    };
    obj[field] = value;
    $.post("/recorder/api/create_datapoint", obj, function() {
        getRoastDetails(id);
    });
}
