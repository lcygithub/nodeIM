function find() {
    var user = {};
    user.username = $("#username").val();
    $.post('/find/', user, function(data) {
        if (!data.stat) {
            alert(data.err);
        } else {
            var name = data.name;
            var s = '<li><a href="#"><i class="icon-user"><\/i>';
            s += name;
            s += '<\/a><\/li>';
            console.log(s);
            $("#friends").append(s);
        }
    });
}
