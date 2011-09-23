$.ajaxSetup ({
    cache: false
});

function load_json(language) {
    $.getJSON('json/'+language+'/data.json', function(data) {
        console.log(data);
        $('#name').html(data.name);
        $('#title > h3').html(data.title);

        var personal_mustache = ich.personal_mustache({personal:data.personal});
        $('#personal').html(personal_mustache);

        var category_mustache = ich.category_mustache(data);
        $('#category').html(category_mustache);

        $('.language .title').removeClass('fluo');
        $('#'+language+' .title').addClass('fluo');

        $('#extendable').click(function() {
            $('.extend').toggleClass('extendable');
            return false;
        });

        $('.hidden').hide();
        $('.extend').hover(function() {
            $(this).find('.hidden').show();
        }, function() {
            $(this).find('.hidden').hide();
        });

        $('#opacity, #close').click(function() {
            $('#opacity, #close, #more').hide();
        });
        $('.extend').click(function() {
            $('.extend').removeClass('extendable');
            $(this).addClass('extendable');
            var key = $(this).attr('id');
            // special Key
            if (key === 'french' || key === 'english' || key === 'german') {
                load_json(key);
            }
            else {
                $.ajax({
                    method: 'get',
                    url:'json/'+language+'/'+key+'.json',
                    dataType: 'json',
                    success: function(data) {
                        var more_mustache = ich.more_mustache(data);
                        $('#opacity, #more, #close').show();
                        $('#content').html(more_mustache);
                    },
                    error: function(err) {
                        if (err.status == '404') {
                            $('#content').html('Not Found - ' + key);
                        }
                    }
                });
            }
            
        });
    });
}


// Main
load_json('english');
