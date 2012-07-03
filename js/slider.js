var Slider = function (args) {
    this.current = args.current || 0;
    this.before = 0;
    this.length = 0;
    this.elements = {
        slides: $('.slides'),
        pagination: $('.pagination'),
        next: $('.next'),
        previous: $('.previous')
    };
    this.shift = args.shift || undefined;

    // css class used for the current page
    this.active = args.active || 'active';
    this.duration = args.duration || 450;
    this.timeoutDuration = args.timeoutDuration || 1000;
    this.auto = args.auto || false;

    // callback functions
    this.onNext = args.onNext;
    this.onBeforeNext = args.onBeforeNext;
    this.onPrevious = args.onPrevious;
    this.onBeforePrevious = args.onBeforePrevious;
    this.onMove = args.onMove;
    this.onBeforeMove = args.onBeforeMove;
    this.onAnimate = args.onAnimate;
    this.onAfterAnimate = args.onAfterAnimate;

    this.property = args.property || "width";
    this.computeProperty = {
        width: "outerWidth",
        height: "outerHeight"
    };
    this.animateProperty = {
        width: "marginLeft",
        height: "marginTop"
    };

    // Keyboard shortcuts
    this.key = {
        enable: args.key.enable,
        previous: args.key.previous,
        next: args.key.next
    };

    // Hide next/previous buttons
    this.hide = args.hide || true;

    // Core
    var that = this;

    this.updateCss();

    if (args.container !== undefined) {
        args.container.css('overflow', 'hidden');
        this.elements.slides = $('.slides', args.container);
        this.elements.next = $('.next', args.container);
        this.elements.previous = $('.previous', args.container);
        this.elements.pagination = args.pagination || $(".pagination");
    }

    this.parse();

    this.elements.slides.find(".slide").show();

    // positionate the slider to a certain slide
    this.place(this.current);
    this.animate(false);

    // Previous / Next buttons
    this.elements.next.click(function () {
        return that.move("next");
    });
    this.elements.previous.click(function () {
        return that.move("previous");
    });

    if (this.key.enable) {
        $(document).unbind().bind("keydown", $.proxy(this, "keys"));
        $("input, textarea").focus(function() { $(document).unbind("keydown"); });
        $("input, textarea").blur(function() { $(document).unbind().bind("keydown", $.proxy(this, "keys")); });
    }

    // Pagination
    this.elements.pagination.children().each(function (i) {
        $(this).click(function () {
            that.current = that.place(i);
            that.animate(); 
            return false;
        });
    });
    
    // Auto advance
    this.loop();
};
Slider.prototype.updateCss = function () {
    if (this.property === "width") {
        this.elements.slides.find('.slide').css("float", "left");
    } else {
    }
};
Slider.prototype.parse = function () {
    var that = this,
        size = 0;
    // TODO find only the children > .slide
    this[this.property] = 0;
    this.positions = [];
    this.slides = [];

    this.elements.slides.find('.slide').each(function (i) {
        that.slides[i] = this;
        that.positions[i] = that[that.property];

        if (that.shift) {
            that[that.property] += that.shift;
            size += $(this)[that.computeProperty[that.property]]();
        } else {
            that[that.property] += $(this)[that.computeProperty[that.property]]();
        }
    });
    this.elements.slides[this.property](size);

    // Number of slides
    this.length = this.positions.length;
};
Slider.prototype.remove = function (i) {
    var removed;
    if (typeof i === "undefined") {
        i = this.current;
    }
    removed = $(this.elements.slides.find(".slide")[i]).remove();
    this.parse();
    this.current = this.place(0);
    this.animate(false);
};
Slider.prototype.move = function (name) {
    var run = true;
    clearInterval(this.timeout);
    this.loop();

    this.before = this.current;
    run = this.onBeforeMove && this.onBeforeMove.call(this);
    if (run !== false) {
        this[name]();
        if (this.before !== this.current) {
            this.onMove && this.onMove.call(this);
        }
    }

    return false;
};
Slider.prototype.keys = function (e) {
    if (this.key.previous && this.key.previous.indexOf(e.keyCode) !== -1) {
        this.move('previous');
    }
    if (this.key.next && this.key.next.indexOf(e.keyCode) !== -1) {
        this.move('next');
    }
};
Slider.prototype.place = function (i) {
    if (i > this.length - 1) {
        current = this.length - 1;
    } else if (i < 0) {
        current = 0;
    } else {
        current = i;
        if (this.hide) {
            this.elements.next.show();
            this.elements.previous.show();
        }
    }

    if (i >= this.length - 1 && this.hide) {
        this.elements.next.hide();
    }
    if (i <= 0 && this.hide) {
        this.elements.previous.hide();
    }
    if (this.elements.pagination.length !== 0) {
        this.elements.pagination.children().removeClass(this.active);
        $(this.elements.pagination.children()[current]).addClass(this.active);
    }
    return current;
};
Slider.prototype.loop = function () {
    if (this.auto) {
        var that = this;
        this.timeout = setTimeout(function () {
            that.current = (that.current == that.length-1) ? -1: that.current;
            that.next();
            that.loop();
        }, this.timeoutDuration);
    }
};
Slider.prototype.next = function (animate) {
    // onBefore returns false, stop the execution of the move
    var run = this.onBeforeNext && this.onBeforeNext.call(this);
    if (run === false) {
        return false;
    }

    var next = this.place(this.current + 1);

    if (next !== this.current) {
        this.current = next;
        this.onNext && this.onNext.call(this);
        this.animate.call(this, animate);
    } 
};
Slider.prototype.previous = function (animate) {
    var run = this.onBeforePrevious && this.onBeforePrevious.call(this);
    if (run === false) {
        return false;
    }

    var previous = this.place(this.current - 1);

    if (previous !== this.current) {
        this.current = previous;
        this.onPrevious && this.onPrevious.call(this);
        this.animate.call(this, animate);
    } else {
        this.elements.previous.hide();
    }
};
Slider.prototype.animate = function (animate) {
    var key = this.animateProperty[this.property];
    var args = {};
    args[key] = -this.positions[this.current];

    if (typeof animate === "undefined" || animate === true) {
        var that = this;
        this.elements.slides.stop().animate(args, {
                duration: this.duration,
                complete: function () {
                    that.onAfterAnimate && that.onAfterAnimate.call(that);
                }
        });
    } else {
        this.elements.slides.css(args);
    }
    this.onAnimate && this.onAnimate.call(this);
};

if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj) {
        var i = 0;
        for (i; i < this.length; i += 1) {
            if (this[i] == obj) {
                return i;
            }
        }
        return -1;
    };
}
