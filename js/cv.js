function load_json(language) {
    $.getJSON('json/' + language + '/data.json', function (data) {

        var templateHeader = new Barbe.View('template-social', {data:
            {
                name: data.name,
                title: data.job
            }
        }).grow();

        var templatePersonal = new Barbe.View(
            "template-personal",
            {
                data:
                {
                    personal: data.personal,
                    social: data.social
                }
        }).grow();

        var templateCategory = new Barbe.View("template-category", {data: data}).grow(function () {
            $('#' + language).find('.title').addClass('fluo');
        });

    });
}

$(document).on('click', '.language li', function (e) {
    e.preventDefault();
    var language = $(this).attr('id');
    if (language) {
        load_json(language);
    }
    return false;
});


// Main
load_json('english');
