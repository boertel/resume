/* 
 * @author: Benjamin Oertel (https://github.com/boertel)
 * @date: 01/01/2012
 * 
*/
(function (window, undefined) {
    "Barbe:nomunge";

    /**
     * Constructor: 
     *
     * @param anchor {Node} Element where the loader is added
     */
    var Loader = function (anchor) {
        this.anchor = anchor;
        this.div = document.createElement("div");
        this.div.className = Loader.className;
        // Clean up the anchor
        while (this.anchor.hasChildNodes()) {
            this.anchor.removeChild(this.anchor.lastChild);
        }
        this.anchor.appendChild(this.div);
    };
    Loader.className = "barbe-loader";

    /**
     * Remove the loader from the anchor
     */
    Loader.prototype.remove = function () {
        this.anchor.removeChild(this.div);
    };


    var Barbe = {
        version: "0.0.2",
        html: {},
        templates: {},
        settings: {
            template: {
                render: function (self, context, partials) {
                    return self.render(context, partials);
                },
                compile: function (str) {
                    return Hogan.compile(str);
                },
                type: ['text/html']
            },
            removeScripts: true,
            autoLoad: false,
            ajax: $.ajax,
            growCallback: function () {
            },
            Loader: Loader
        },

        /**
         * Initalize template in a dictionary: add the render function to create the final result.
         *
         * @param name         {string} name of the template
         * @param str_template {string} template itself
         * @param [anchor]     {string} id of the anchor
         */
        add: function (name, str_template, anchor) {
            if (Barbe.html.hasOwnProperty(name)) {
                throw "[Barbe] You've already got a template by the name: \"" + name + "\"";
            }
            else {
                if (Barbe.settings.template.compile !== undefined) {
                    Barbe.html[name] = Barbe.settings.template.compile(str_template, name);
                } else {
                    Barbe.html[name] = str_template;
                }
                Barbe.templates[name] = {};

                if (typeof anchor !== "undefined") {
                    var element = document.getElementById(anchor);
                    if (element !== null) {
                        Barbe.templates[name].anchor = element;
                    }
                }
                Barbe.templates[name].render = function (data, anchor) {
                    data = data || {};
                    anchor = anchor || Barbe.templates[name].anchor;
                    var html = Barbe.settings.template.render(Barbe.html[name], data, Barbe.html);
                    if (anchor !== undefined) {
                        anchor.innerHTML = html;
                    }
                    return html;
                };
            }
        },

        /**
         * Parse the html to collect templates defined by
         * <script type="<Barbe.settings.template.type>" id="" [data-anchor=""]></script>
         * or grab a specific template
         *
         * @params [id] {string} grab a specific template
         */
        grab: function (id) {
            var s, scripts = [];

            if (id === undefined) {
                scripts = document.scripts || document.getElementsByTagName('script');
            } else {
                scripts.push(document.getElementById(id));
            }

            for(var i = 0, len = scripts.length; i < len; i++) {
                s = scripts[i];

                if (s !== undefined && s !== null && Barbe.settings.template.type.indexOf(s.type) !== -1) {
                    Barbe.add(s.id, s.innerHTML, s.getAttribute("data-anchor"));
                    if (Barbe.settings.removeScripts !== false) {
                        s.parentNode.removeChild(s);
                    }
                }
            }
        }
    };


    /**
     * Constructor
     *
     * @param template                  {string}    template name
     * @param provider.data             {object}    data that populates the template
     * @param provider.url              {string}    url of the api
     * @param provider.*                {*}         ajax function parameters
     * @param [options.anchor]          {string}    id of the anchor (overwrite the one defined on the template script tag)
     * @param [options.loader=true]     {boolean}   show/hide the loader
     */
    Barbe.View = function (template, provider, options) {
        if (template !== undefined && Barbe.templates[template] === undefined) {
            Barbe.grab(template);
        }
        if (template === undefined || Barbe.templates[template] === undefined) {
            throw "[Barbe] template #" + template + " not found.";
        }
        this.template = template;
        this.anchor = Barbe.templates[template].anchor;

        this.options = {};

        // Define default options
        this.options.Loader = Barbe.settings.Loader;

        var anchor;
        
        if (typeof options === "string") {
            anchor = options;
        } else if (typeof options !== "undefined") {
            anchor = options.anchor;
            delete options.anchor;
            this.options = options;
            this.options.Loader = (options.Loader === true || options.Loader === undefined) ?
                Barbe.settings.Loader : options.Loader;
        }

        // Is the Loader a valid object?
        if (this.options.Loader !== false && 
                (typeof this.options.Loader !== "function" || this.options.Loader.prototype.remove === undefined)) {
            throw "[Barbe] Invalid Loader";
        }

        if (anchor !== undefined) {
            this.anchor = document.getElementById(anchor);
            if (this.anchor === null) {
                throw "[Barbe] anchor #" + anchor + " not found.";
            }
        }

        this.provider = provider || {};
    };

    /**
     * Populate the template with the data. Create a dumb object {array: data} if data is an array
     *
     * @param response {object} data that populates the template
     */
    Barbe.View.prototype.render = function (response) {
        /* Mustache doesn't like array as data, so we have to create 
        a dumb object named "array" that contained the array */
        if (typeof response === "undefined") {
            response = this.provider.data;
        }
        if (this.provider.url === undefined && this.provider.success !== undefined) {
            response = this.provider.success(response);
        }

        if (Object.prototype.toString.call(response) === '[object Array]') {
            response = {
                array: response
            };
        }

        this.view = Barbe.templates[this.template].render(response, this.anchor);
        return this.view;
    };

    /**
     *  Render the template with the response and attach it to the anchor
     *
     *  @params response {object}       api response or data for the template
     *  @params callback {castAnchor}   function called after
     */
    Barbe.View.prototype.castAnchor = function (response, callback) {
        // TODO move this to the render function
        this.loader && this.loader.remove();
        var rendered = this.render(response);
        callback && callback.call(this, rendered);
        Barbe.settings.growCallback && Barbe.settings.growCallback(rendered);
    };


    /**
     * Process the ajax call 
     *
     * @param callback {function} function executed when the ajax call successed and the template has been populated
     */
    Barbe.View.prototype.ajax = function (callback) {
        var that = this;
        if (typeof this.provider === "function") {
            // Specific asynchronous function for this View
            var monkeyProvider = function (response) {
                that.castAnchor.call(that, response, callback);
            };
            this.provider.call(this, monkeyProvider);
        } else {
            // Use the global ajax function
            var providerSuccess = this.provider.success;
            var monkeySuccess = function (response) {
                if (providerSuccess !== undefined) {
                    response = providerSuccess.call(that, response) || response;
                }
                that.castAnchor.call(that, response, callback);
            };

            var providerError = this.provider.error;
            var monkeyError = function (response) {
                if (providerError !== undefined) {
                    response = providerError.call(that, response);
                    if (response === false) {
                        return false;
                    }
                }
                that.castAnchor.call(that, response, callback);
            };

            that.ajaxParams = this.provider;
            that.ajaxParams.success = monkeySuccess;
            that.ajaxParams.error = monkeyError;

            Barbe.settings.ajax(that.ajaxParams);
        }
    };

    /**
     * Run Barbe to populate the template and attach it the anchor
     *
     * @param callback {function} function executed when the ajax call successed and the template has been populated
     */
    Barbe.View.prototype.grow = function (callback) {
        if (typeof this.provider === "function" || this.provider.url !== undefined) {
            if (this.options.Loader) {
                this.loader = new this.options.Loader(this.anchor);
            }
            this.ajax.call(this, callback);
        } else {
            this.castAnchor(this.provider.data, callback);
        }
    };


    /**
     * Initialize settings before grabbing templates
     *
     * @param settings  {object}    see Barbe.settings
     */
    Barbe.init = function (settings) {
        for (var key in settings) {
            value = settings[key];
            if (Barbe.settings[key] !== undefined) {
                Barbe.settings[key] = value;
            }
        }

        if (Barbe.settings.autoLoad) {
            Barbe.grab();
        }
    };

    window.Barbe = Barbe;
    
})(window);
