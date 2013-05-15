function register() {
    var user = {};
    user.username = $('#regusername').val();
    user.password = $('#inputregPassword').val();
    user.repassword = $('#inputregrePassword').val();
    $.post('/reg/', user, function(data) {
        console.log(data);
        if (typeof data === "string") {
            data = JSON.parse(data);
        }
        console.log(typeof data);
        if (data.stat) {
            console.log(data);
            $('#Regisger').modal('hide');
        } else {
            console.log(data.err);
            $("#remsg").html(data.err).show()
        }
    });
}