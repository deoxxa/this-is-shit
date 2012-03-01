var Context = function() {
    var module = {};
    function Q(done) {
        this.jobs = [];
        this.j = this.jobs;
        this.result = "";
        this.done = done;
    }
    Q.prototype.run = function() {
        var self = this;
        if (this.jobs.length == 0) {
            return this.done(null, this.result);
        }
        var job = this.jobs.shift();
        if (typeof job === "number") {
            job = job.toString();
        }
        if (typeof job === "string") {
            this.result += job;
            this.run();
        } else if (typeof job == "function") {
            job(function(err, data) {
                if (typeof data === "number") {
                    data = data.toString();
                }
                if (typeof data === "string") {
                    self.result += data;
                }
                self.run();
            });
        } else {
            this.run();
        }
    };
    Q.prototype.push = function(e) {
        this.jobs.push(e);
    };
    module.exports = Context;
    function Context(vars, parent) {
        this.vars = vars || {};
        this.functions = {};
        this.templates = {};
        this.blocks = {};
        this.parent = parent;
    }
    Context.prototype.create_queue = function(done) {
        return new Q(done);
    };
    Context.prototype.create_child = function(vars) {
        var tmp = new Context(vars, this);
        return tmp;
    };
    Context.prototype.chain = function() {
        return this.parent ? this.parent.chain().concat([ this ]) : [ this ];
    };
    Context.prototype.add_function = function(name, fn) {
        this.functions[name] = fn;
        return this;
    };
    Context.prototype.remove_function = function(name) {
        this.functions[name] && delete this.functions[name];
        return this;
    };
    Context.prototype.call_function = function(name, input, args) {
        if (typeof this.functions[name] !== "undefined") {
            return this.functions[name](input, args);
        } else if (this.parent) {
            return this.parent.call_function(name, input, args);
        } else {
            return null;
        }
    };
    Context.prototype.add_template = function(name, fun) {
        this.templates[name] = fun;
        return this;
    };
    Context.prototype.get_template = function(name, cb) {
        if (typeof this.templates[name] !== "undefined") {
            return cb(null, this.templates[name]);
        } else if (typeof this.on_not_found == "function") {
            return this.on_not_found(name, cb);
        } else if (this.parent) {
            return this.parent.get_template(name, cb);
        } else {
            return cb(Error("Couldn't load template"));
        }
    };
    Context.prototype.add_block = function(name, fun) {
        this.blocks[name] = fun;
        return this;
    };
    Context.prototype.get_block = function(name) {
        if (typeof this.blocks[name] !== "undefined") {
            return this.blocks[name];
        } else if (this.parent) {
            return this.parent.get_block(name);
        } else {
            return null;
        }
    };
    Context.prototype.call_block = function(name, cb) {
        var block = null, current = this, chain = [];
        while (current.parent) {
            chain.unshift(current);
            current = current.parent;
        }
        while (block === null && chain.length) {
            block = chain[0].get_block(name);
            chain.shift();
        }
        if (block) {
            return block(this, cb);
        } else {
            return cb(Error("Couldn't find block: " + name));
        }
    };
    Context.prototype.render = function(name, cb) {
        var self = this;
        this.get_template(name, function(err, fn) {
            if (err) {
                return cb(err);
            }
            fn(self, cb);
        });
    };
    Context.prototype.get_value = function(path) {
        var res = this.vars;
        for (var i in path) {
            var segment = path[i];
            if (typeof res === "object" && typeof res[segment] !== "undefined") {
                res = res[segment];
            } else if (this.parent) {
                return this.parent.get_value(path);
            } else {
                return null;
            }
        }
        return res;
    };
    return module.exports;
}();

var ctx = new Context;

module.exports = ctx;

ctx.add_template("index.html", function(ctx, cb) {
    var ctx_0 = ctx.create_child(), q = ctx_0.create_queue(cb);
    q.push('<html>\n    <head>\n        <title>This is SHIT info</title>\n        <link rel="stylesheet" href="/shit.css" />\n    </head>\n\n    <body>\n        <h1>This is SHIT info</h1>\n        <div id="content">\n            <img class="steamer" src="/turd2.png">\n            <h2>What is this SHIT?</h2>\n            <img id="scrot" src="/screenshot.jpg" />\n            <p>Essentialy, its a communal way to keep track of pages that are not worth your time.</p>\n            <p>This is SHIT info is a extension for the Chrome Browser.</p>\n            <p>It adds a button to your toolbar so that you can flag the current page you are on as SHIT.</p>\n            <p>It also lets you know if a page you visit is thought to be SHIT by other users.</p>\n            <div id="install"><a href="/this-is-shit.crx"><h3>Install this SHIT</h3></a></div>\n            <h2>Top 10 SHIT pages</h2>\n            <h4>What\'s the Number 1 Number 2?</h4>\n            <ul>\n                ')
    var _tmp_key_1 = "", _tmp_obj_2 = ctx_0.get_value([ "shits" ]);
    for (_tmp_key_1 in _tmp_obj_2) {
        (function() {
            var ctx_3 = ctx_0.create_child({
                shit: _tmp_obj_2[_tmp_key_1],
                i: _tmp_key_1
            });
            q.push('\n                    <li><span class="count">')
            q.push(ctx_3.get_value([ "shit", "count" ]))
            q.push('</span><a href="')
            q.push(ctx_3.call_function("e", ctx_3.get_value([ "shit", "url" ]), []))
            q.push('">')
            q.push(ctx_3.call_function("e", ctx_3.call_function("short", ctx_3.get_value([ "shit", "url" ]), []), []))
            q.push("</a></li>\n                ")
        })();
    }
    q.push("\n            </ul>\n            <div class=\"info\">\n                <p>rapid development in an afternoon by <a href=\"https://github.com/deoxxa\">deoxxa</a> and <a href=\"https://github.com/dnoiz1\">dnz</a>.<br />\n                special thanks to <a href=\"http://twitter.com/marxamus\">Mark</a> for his shit design tips.<br />inspired by shitheads who write terrible articles and tweets \n            </div>\n        </div>\n        <script>\nvar _gaq = _gaq || [];\n_gaq.push(['_setAccount', 'UA-29610379-1']);\n_gaq.push(['_trackPageview']);\n\n(function() {\n  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;\n  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';\n  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);\n})();\n        </script>\n    </body>\n</html>\n")
    q.run()
})