function register() {
    var user = {};
    user.username = $('#regusername').val();
    user.password = $('#inputregPassword').val();
    user.repassword = $('inputregrePassword').val();
    $.post('/reg', user, function(data) {
        if (data.ok) {
            $('#Regisger').modal('hide');
        }
    });
}