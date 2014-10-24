function load_json(language) {
    $.getJSON('json/' + language + '/data.json', function (data) {

        $('#title > h3').html(data.job);

        var templateHeader = new Barbe.View('template-social', {data:
            {
                name: data.name,
                social: data.social
            }
        }).grow();

        var templatePersonal = new Barbe.View("template-personal", {data:
            {personal:data.personal}
        }).grow();

        var templateCategory = new Barbe.View("template-category", {data: data}).grow(function () {
            $('.language .title').removeClass('fluo');
            $('#'+language+' .title').addClass('fluo');
        });

        $(".extend").click(function () {
            var key = $(this).attr("id");
            // special Key
            if (key === 'french' || key === 'english' || key === 'german') {
                load_json(key);
                return;
            }

            var that = $(this);

            var templateExtend = new Barbe.View("template-more", {
                data: {r: Math.random()},
                url: 'json/' + language + '/' + key + '.json',
                error: function () {
                    return false;
                }
            }).grow()
        });
    });
}


// Main
load_json('english');
