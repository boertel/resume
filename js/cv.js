function load_json() {
    language = document.location.hash.replace('#', '') || 'english';

    var file = language + '.json';
    $.getJSON('data/' + file, function (data) {
        var templateHeader = new Barbe.View('template-title', {data: data}).grow();

        var templatePersonal = new Barbe.View("template-personal", {data: data}).grow();

        var templateCategory = new Barbe.View("template-category", {data: data}).grow(function () {
            $('#' + language).find('.title').addClass('fluo');
        });

    });
}

window.addEventListener('hashchange', load_json);

load_json();
