/* 
* barbe.js – 
*/
(function () {
    "Barbe:nomunge";
    var Barbe = {
        html: {},
        templating: {
            funct: Mustache.to_html,
            type: ['text/html'],
        },

        add: function (name, str_template) {
            if (Barbe.html.hasOwnProperty(name)) {
                throw "You've already got a template by the name: \"" + name + "\"";
            }
            else {
                Barbe.html[name] = str_template;
                Barbe[name] = function (data) {
                    data = data || {};
                    return Barbe.templating.funct(Barbe.html[name], data, Barbe.html);
                };
            }
        },
        grab: function () {
            scripts = document.scripts || document.getElementsByTagName('script');
            for(var i=0, len=scripts.length; i<len; i++) {
                var s = scripts[i];
                if (Barbe.templating.type.indexOf(s.type) !== -1) {
                    Barbe.add(s.id, s.innerHTML);
                }
            }
        }
    };

    window.Barbe = Barbe;
    Barbe.grab();
})();
