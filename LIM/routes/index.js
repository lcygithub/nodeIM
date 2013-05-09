
/*
 * GET home page.
 */
exports.index = function(req, res) {
    jqtpl.render("index", [{a:1},{a:2},{a:3}]);
}