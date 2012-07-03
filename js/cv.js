(function (window, undefined) {
})(window);

function load_json(language) {
    $.getJSON('json/' + language + '/data.json', function (data) {

        

        $('#name').html(data.name);
        $('#title > h3').html(data.job);

        var templatePersonal = new Barbe.View("template-personal", {data:
            {personal:data.personal}
        }).grow();

        var templateCategory = new Barbe.View("template-category", {data: data}).grow(function () {
            $('.language .title').removeClass('fluo');
            $('#'+language+' .title').addClass('fluo');
        });

        $("#wrapper").unbind('click').click(function () {
            slider.previous();
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
            }).grow(function () {
                $(this).addClass("extendable");
                $("#wrapper").css("opacity", 0.5);
                slider.onPrevious = function () {
                    $("#wrapper").css("opacity", 1);
                    that.removeClass('extendable');
                };
                slider.next();
                $("#previous").click(function () {
                    slider.previous();
                });
            });
        });
    });
}


// Main
load_json('english');
