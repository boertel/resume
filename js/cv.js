function load_json() {
    language = document.location.hash.replace('#', '') || 'english';

    var file = language + '.json';
    var success = function (data) {
        data.category[0].experience.forEach(function (category) {
            var date = {};
            date.start = moment(category.date.start);
            date.end = moment(category.date.end);
            var startFormat = 'MMMM YYYY';
            if (date.start.year() === date.end.year()) {
                startFormat = 'MMMM';
            }
            category.date.start = date.start.format(startFormat);
            category.date.end = category.date.end ? date.end.format('MMMM YYYY') : 'present';
            category.date.duration = date.end.from(date.start, true);
        });

        var templateHeader = new Barbe.View('template-title', {data: data}).grow();

        var templatePersonal = new Barbe.View("template-personal", {data: data}).grow();

        var templateCategory = new Barbe.View("template-category", {data: data}).grow(function () {
        });

    };

    $.ajax({
        url: 'data/' + file,
        dataType: 'json',
        success: success,
        error: function() { console.log(arguments); }
    });
}

window.addEventListener('hashchange', load_json);

load_json();
