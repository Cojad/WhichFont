function _whatFont() {
    'use strict';
    var $,
        css,
        toolbar,
        panel,
        ctrl,
        fs,
        _wf,
        TestCanvas,
        TypeInfo,
        Tip,
        tip,
        defaultFont,
        typeInfoCache = [];
    TestCanvas = function (typeInfo, text, canvas_options) {
        if (!TestCanvas.isSupported) {
            this.data = [];
            return;
        }
        this.typeInfo = typeInfo;
        this.text = text || 'abcdefghijklmnopqrstuvwxyz';
        this.canvas_options = $.extend(this.canvas_options, canvas_options || {});
        this.canvas = $('<canvas>')[0];
        this.draw();
    };
    TestCanvas.isSupported = !! document.createElement("canvas").getContext;
    TestCanvas.prototype = {
        canvas_options: {
            fillStyle: 'rgb(0,0,0)',
            height: 50,
            size: '40px',
            textBaseline: 'top',
            width: 600
        },
        getFontOption: function () {
            return this.typeInfo.style + ' ' + this.typeInfo.weight + ' ' + this.canvas_options.size + ' ' + this.typeInfo.fonts;
        },
        draw: function () {
            // draw the alphabet on canvas
            var ctx = this.canvas.getContext('2d');
            $.each(this.canvas_options, function (opt, val) {
                ctx[opt] = val;
            });
            ctx.font = this.getFontOption();
            ctx.fillText(this.text, 0, 0);
            return (this.data = ctx.getImageData(0, 0, this.canvas_options.width, this.canvas_options.height).data);
        },
        isEqual: function (otherCanvas) {
            // compare if two pixel arrays are identical
            var len = this.canvas_options.width * this.canvas_options.height * 4,
                i, data1 = this.data,
                data2 = otherCanvas.data; // each pixel is 4 bytes (RGBA)
            for (i = 0; i < len; i += 1) {
                if (data1[i] !== data2[i]) {
                    return false;
                }
            }
            return true;
        }
    };
    TypeInfo = function (element) {
        this.element = $(element);
        this.detect();
        this.testCanvas = new TestCanvas(this);
        this.current = this._current();
    };
    TypeInfo.prototype = {
        detect: function () {
            this.fonts = this.element.css('font-family');
            this.weight = this.element.css('font-weight');
            this.style = this.element.css('font-style');
            this.size = this.element.css('font-size');
            this.lineHeight = this.element.css('line-height');
            this.color = this.element.css('color');
            this.variant = this._variant();
            this.stack = this.fonts.split(/,\s*/);
        },
        getFullCSS: function () {
            var props = ['font-family', 'font-weight', 'font-style'],
                css = {}, p;
            for (p = 0; p < props.length; p++) {
                css[props[p]] = this.element.css(props[p]);
            }
            return css;
        },
        _variant: function () {
            if (this.weight === 'normal' && this.style === 'normal') {
                return 'regular';
            }
            if (this.weight === 'normal') {
                return this.style;
            }
            if (this.style === 'normal') {
                return this.weight;
            }
            return this.weight + ' ' + this.style;
        },
        _current: function () {
            // To find out which font is being used, 
            // we go throught the the whole stack.
            //
            // For each font F, first we test if it exist
            // by create two canvas, one with F and sans-serif
            // the other with F and serif. By comparing 
            // the result, we know F exist if we get the
            // same result from both canvas.
            //
            // If the F exist, then we compare the result of F
            // to the result of the original font stack.
            //
            var stack = this.stack.slice(0),
                f,
                typeInfoSerif, typeInfoSansSerif,
                canvasSerif, canvasSansSerif,
                typeInfoDefault, canvasDefault;
            for (f = 0; f < this.stack.length; f++) {
                typeInfoSerif = $.extend({}, this, {
                    fonts: stack[f] + ' ,serif',
                    stack: [stack[f], 'serif']
                });
                typeInfoSansSerif = $.extend({}, this, {
                    fonts: stack[f] + ', sans-serif',
                    stack: [stack[f], 'sans-serif']
                });
                canvasSerif = new TestCanvas(typeInfoSerif);
                canvasSansSerif = new TestCanvas(typeInfoSansSerif);
                if (canvasSerif.isEqual(canvasSansSerif) && this.testCanvas.isEqual(canvasSerif)) {
                    return stack[f];
                }
            }
            // Cannot find any perfect matching font, so we 
            // have to guess.
            //
            // Two possiblities: 1. the browser fallback to 
            // the default sans-serif or serif. It's impossible
            // to know what is the actual font, but we can guess
            // whether it is sans-serif or serif.
            //
            // 2. We can't find the font due to subsetting
            // (eg H&FJ webfont). In this case, we compare the 
            // default font to the original result, if it doesn't 
            // match, we blindly guess it is the first font in 
            // the font stack is being used.
            //
            if (defaultFont) {
                typeInfoDefault = $.extend({}, this, {
                    fonts: defaultFont,
                    stack: [defaultFont]
                });
                canvasDefault = new TestCanvas(typeInfoDefault);
                // make sure it is not because of sub setting
                if (this.testCanvas.isEqual(canvasDefault)) {
                    return defaultFont;
                }
            }
            return stack[0]; // Can't detected, guess
        }
    };
    css = {
        STYLE_PRE: '__whatfont_',
        STYLE: null,
        init: function () {
            var cssContent = '@-webkit-keyframes slideDown{from{max-height:0}to{max-height:250px}}@-webkit-keyframes fadeIn{from{opacity:0}to{opacity:1}}*{cursor:default!important}.__whatfont_basic{background:transparent;border:0 solid black;border-bottom:0 solid black;border-left:0 solid black;border-right:0 solid black;border-top:0 solid black;border-radius:none;-moz-border-radius:none;-webkit-border-radius:none;bottom:auto;box-shadow:none;-moz-border-radius:none;-webkit-box-shadow:none;clear:none;color:inherit;cursor:auto;float:none;font:inherit;height:auto;left:auto;list-style:none;margin:0;max-height:none;max-width:none;min-height:none;min-width:none;overflow:visible;padding:0;position:static;right:auto;text-align:inherit;text-decoration:none;text-indent:0;text-shadow:inherit;text-transform:none;top:auto;visibility:visible;width:auto;z-index:auto;zoom:1;-webkit-font-smoothing:antialiased}.__whatfont_basic *{color:inherit}.__whatfont_basic a,.__whatfont_basic a:visited .__whatfont_basic a:hover,.__whatfont_basic a:active{color:inherit;cursor:pointer!important;text-decoration:none}.__whatfont_elem{background:rgba(0,0,0,0.9);background:-moz-linear-gradient(top,rgba(30,30,30,0.95),rgba(0,0,0,0.9));background:-webkit-gradient(linear,0 0,0 100%,from(rgba(30,30,30,0.95)),to(rgba(0,0,0,0.9)));border:1px solid black;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;box-shadow:inset 0 0 1px #555,0 0 5px #000;-moz-box-shadow:inset 0 1px 0 #555,0 0 5px #000;-webkit-box-shadow:inset 0 1px 0 #555,0 0 5px #000;color:#fff;font-family:"Helvetica Neue",sans-serif;font-size:14px;line-height:1.286;padding:0;text-shadow:0 -1px 0 #111;z-index:2147483647}.__whatfont_button{background:#333;background:-webkit-gradient(linear,0 0,0 100%,from(#555),color-stop(0.5,#333),color-stop(0.51,#333),to(#222));background:-moz-linear-graident(top,#555 50%,#333 1%,#222);border:1px solid #000;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;box-shadow:inset 0 0 1px #aaa,0 1px 0 #111;-moz-box-shadow:inset 0 0 1px #aaa,0 1px 0 #111;-webkit-box-shadow:inset 0 0 1px #aaa,0 1px 0 #111;font-weight:500;padding:3px 6px;text-shadow:0 1px 0 #000;text-align:center}.__whatfont_tip{display:none;font-weight:500;line-height:1;opacity:.9;padding:4px 5px 6px 5px;position:absolute;z-index:2147483647}.__whatfont_control{box-shadow:inset 0 0 1px #555,0 0 2px #000;-moz-box-shadow:inset 0 1px 0 #555,0 0 2px #000;-webkit-box-shadow:inset 0 1px 0 #555,0 0 2px #000;padding:4px 8px;position:fixed;right:10px;top:10px}.__whatfont_exit{cursor:pointer;font-weight:500}.__whatfont_help{color:#eee;font-size:12px}.__whatfont_help strong{font-weight:500}.__whatfont_panel{padding:0;position:absolute;width:260px;z-index:214748364}.__whatfont_panel_title{background:-webkit-gradient(linear,0 0,0 100%,from(rgba(255,255,255,0.3)),color-stop(0.6,rgba(255,255,255,0.1)),to(rgba(255,255,255,0)));background:-moz-linear-gradient(top,rgba(255,255,255,0.2),rgba(255,255,255,0));color:#fff;font-size:1.1em;font-weight:bold;padding:4px 16px 4px 10px;position:relative;text-align:center;text-transform:capitalize}.__whatfont_panel_title:before,.__whatfont_panel_title:after{border-style:solid;content:".";display:block;height:0;position:absolute;text-indent:-30000px;width:0}.__whatfont_panel_title:before{border-color:black transparent;border-width:0 7px 7px 7px;left:7px;top:-8px}.__whatfont_panel_title:after{border-color:#666 transparent;border-width:0 6px 7px 6px;left:8px;top:-6px}.__whatfont_close_button{font-size:18px;bottom:0;cursor:pointer;display:inline-block;line-height:22px;margin:0;height:22px;padding:1px;position:absolute;right:7px;top:0;vertical-align:middle}.__whatfont_close_button:hover{color:#aaa}.__whatfont_panel_content{overflow:hidden;padding-bottom:10px;-webkit-animation:slideDown .4s 0 1 ease-in-out}.__whatfont_clearfix:after{content:".";display:block;height:0;clear:both;visibility:hidden}.__whatfont_panel_content .__whatfont_panel_label,.__whatfont_panel_content div.__whatfont_panel_label,.__whatfont_panel_content dt.__whatfont_panel_label{color:#aaa;font-size:12px;font-weight:bold;line-height:1.5;text-shadow:0 -1px 0 black}.__whatfont_panel_content ul.__whatfont_panel_properties>li{border-bottom:1px solid #000;border-top:1px solid #4a4a4a;margin:0 6px;padding:5px 4px}.__whatfont_panel_content ul.__whatfont_panel_properties>li:first-child{border-top:0;margin-top:0;padding-top:0}.__whatfont_panel_content ul.__whatfont_panel_properties>li:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}.__whatfont_panel_content .__whatfont_panel_value,.__whatfont_panel_content div.__whatfont_panel_value,.__whatfont_panel_content dt.__whatfont_panel_value{font-weight:500;text-shadow:0 1px 0 black}.__whatfont_panel_content .__whatfont_fniu{text-decoration:line-through}.__whatfont_panel_content .__whatfont_fiu{font-style:italic}.__whatfont_panel_content .__whatfont_size{float:left;width:48.6%;zoom:1}.__whatfont_panel_content .__whatfont_line_height{margin-left:50%;width:48.6%;zoom:1}.__whatfont_highlighted{cursor:default!important}.__whatfont_panel dt.__whatfont_typeface{color:white;font-size:16px}.__whatfont_type_preview{background:#444;box-shadow:0 0 2px #555,inset 0 0 2px #111;-moz-box-shadow:0 0 2px #555,inset 0 0 2px #111;-webkit-box-shadow:0 0 2px #555,inset 0 0 2px #111;border:1px solid #111;color:#eee;font-size:1.25em;margin:.25em 0;overflow:hidden;padding:5px 10px;text-shadow:none;-webkit-font-smoothing:subpixel-antialiased}.__whatfont_panel_content .__whatfont_font_services{line-height:1;text-align:right}ul.__whatfont_font_service{display:inline-block;list-style-type:none;margin:0;padding:0}ul.__whatfont_font_service li{display:inline-block;margin:0;padding:0}.__whatfont_service_icon{color:white;display:inline-block;-webkit-mask-image:-webkit-gradient(linear,0 0,0 100%,from(rgba(255,255,255,1)),to(rgba(255,255,255,0.6)))}.__whatfont_service_icon:hover{cursor:pointer}.__whatfont_panel_content .__whatfont_panel_tools{color:#eee;font:bold 11px "Lucida Grande","Lucida Sans Unicode",verdana,sans-serif;line-height:12px;margin:12px 6px 0;padding:0 4px}.__whatfont_panel_content .__whatfont_panel_tools .__whatfont_panel_tools_left{float:left;width:49.5%}.__whatfont_panel_content .__whatfont_panel_tools .__whatfont_panel_tools_right{margin-left:50%;text-align:right}.__whatfont_panel_content .__whatfont_color_info_sample{border:1px solid #666;display:inline-block;height:12px;margin-right:6px;width:12px;-webkit-transition:border-color .2s;-moz-user-select:none;-webkit-user-select:none}.__whatfont_panel_content .__whatfont_color_info_sample:hover{border-color:#bbb}.__whatfont_panel_content .__whatfont_panel_tools no-repeat left top;display:inline-block;margin:0;opacity:.7;padding-left:22px;-webkit-transition:opacity .3s}.__whatfont_panel_content .__whatfont_panel_tools .__whatfont_tweet_icon:hover{opacity:1}';
            css.STYLE = $("<style>" + cssContent + "</style>").appendTo("head");
        },
        restore: function () {
            //Remove stylesheet
            $(css.STYLE).remove();
        },
        getClassName: function (name) {
            // Generate class name with prefix
            // Multiple names
            name = (typeof name === 'string') ? [name] : name;
            return css.STYLE_PRE + name.join(" " + css.STYLE_PRE);
        }
    };
    /* Font Services */
    fs = {
        CSS_NAME_TO_SLUG: {},
        // Translate CSS font name to slug
        FONT_DATA: {},
        // Font data for different services 
        SERVICES: {},
        // Raw data from font services
        init: function () {
            fs.typekit();
            fs.google();
            fs.fontdeck();
        },
        typekit: function () {
            // Code for typekit, based on 
            // https://github.com/typekit/typekit-api-examples/blob/master/bookmarklet/bookmarklet.js
            function findKitId() {
                // Find Typekit ID
                var kitId = null;
                $('script').each(function (index) {
                    var m = this.src.match(/use\.typekit\.com\/(.+)\.js/);
                    if (m) {
                        kitId = m[1];
                        return false;
                    }
                });
                return kitId;
            }
            var kitId = findKitId();
            if (kitId) {
                // Get Font data
                $.getJSON("https://typekit.com/api/v1/json/kits/" + kitId + "/published?callback=?", function (data) {
                    if (!data.errors) {
                        fs.SERVICES.typekit = data.kit;
                        $.each(data.kit.families, function (i, family) {
                            $.each(family.css_names, function (i, css) {
                                fs.CSS_NAME_TO_SLUG[css.toLowerCase()] = family.slug;
                            });
                            fs.FONT_DATA[family.slug] = fs.FONT_DATA[family.slug] || {
                                name: family.name,
                                services: {}
                            };
                            fs.FONT_DATA[family.slug].services.Typekit = {
                                id: family.id,
                                url: 'http://typekit.com/fonts/' + family.slug
                            };
                        });
                    }
                });
            }
        },
        google: function () {
            // Google Font API
            $("link").each(function (i, l) {
                var url = $(l).attr("href"),
                    fstr;
                if (url.indexOf("fonts.googleapis.com/css?") >= 0) {
                    fstr = url.match(/\?family=([^&]*)/)[1].split('|'); // Font names
                    $.each(fstr, function (i, s) {
                        var str = s.split(":")[0],
                            fontName = str.replace(/\+/g, ' '),
                            slug = fontName.replace(/ /g, '-').toLowerCase();
                        fs.CSS_NAME_TO_SLUG[fontName] = slug;
                        fs.FONT_DATA[slug] = fs.FONT_DATA[slug] || {
                            name: fontName,
                            services: {}
                        };
                        fs.FONT_DATA[slug].services.Google = {
                            url: 'http://www.google.com/webfonts/family?family=' + str
                        };
                    });
                }
            });
        },
        fontdeck: function () {
            // Fontdeck fonts
            var projectIds = [],
                domain = location.hostname;
            $("link").each(function (i, l) {
                // when loaded directly with stylesheet
                var url = $(l).attr("href");
                if (url.indexOf("fontdeck.com") >= 0) {
                    var pId = url.match(/^.*\/(\d+)\.css$/);
                    if (pId) {
                        projectIds.push(pId[1]);
                    }
                }
            });
            $("script").each(function (i, l) {
                // when loaded with Google font loader
                var url = $(l).attr("src");
                if (typeof url !== 'undefined' && url.indexOf("fontdeck.com") >= 0) {
                    var pId = url.match(/^.*\/(\d+)\.js$/);
                    if (pId) {
                        projectIds.push(pId[1]);
                    }
                }
            });
            $.each(projectIds, function (i, projectId) {
                $.getJSON("http://fontdeck.com/api/v1/project-info?project=" + projectId + "&domain=" + domain + "&callback=?", function (data) {
                    if (typeof data !== 'undefined' && typeof data.provides !== 'undefined') {
                        $.each(data.provides, function (i, font) {
                            var fontName = font.name,
                                slug = fontName.replace(/ /g, '-').toLowerCase(),
                                searchTerm = fontName.split(' ')[0],
                                fontUrl = font.url || 'http://fontdeck.com/search?q=' + searchTerm;
                            fs.CSS_NAME_TO_SLUG[fontName] = slug;
                            fs.FONT_DATA[slug] = fs.FONT_DATA[slug] || {
                                name: fontName,
                                services: {}
                            };
                            fs.FONT_DATA[slug].services.Fontdeck = {
                                url: fontUrl
                            };
                        });
                    }
                });
            });
        },
        getFontDataByCSSName: function (cssName) {
            var name = cssName.replace(/^"|'/, '').replace(/"|'$/, ''),
                // No quotes
                slug = fs.CSS_NAME_TO_SLUG[name];
            return ((slug && fs.FONT_DATA[slug]) ? fs.FONT_DATA[slug] : null);
        },
        getFontNameByCSSName: function (cssName) {
            var name = cssName.replace(/^"|'/, '').replace(/"|'$/, ''),
                // No quotes
                slug = fs.CSS_NAME_TO_SLUG[name];
            return ((slug && fs.FONT_DATA[slug]) ? fs.FONT_DATA[slug].name : null);
        }
    };
    Tip = function () {
        this.currentCacheId = -1;
        this.el = $.createElem('div', ['tip', 'elem'], '');
        this.$el = $(this.el);
        this.init();
    };
    Tip.prototype = {
        init: function () {
            var that = this;
            this.$el.appendTo('body');
            $('body :visible').on('mousemove.wf', function (e) {
                that.update($(this), e);
                that.show();
                e.stopPropagation();
            });
            $('body').on('mouseout.wf', function (e) {
                that.hide();
            });
        },
        hide: function () {
            this.$el.hide();
        },
        show: function () {
            this.$el.show();
        },
        update: function (newElement, event) {
            var cacheId = newElement.data('wfCacheId');
            this.updatePosition(event.pageY, event.pageX);
            if (this.element === newElement) {
                return;
            }
            if (!cacheId) {
                cacheId = typeInfoCache.length;
                typeInfoCache.push(undefined);
            }
            this.element = newElement;
            this.element.data('wfCacheId', cacheId);
            typeInfoCache[cacheId] = this.typeInfo = typeInfoCache[cacheId] || new TypeInfo(newElement);
            this.updateText(this.typeInfo.current);
        },
        updatePosition: function (top, left) {
            this.$el.css({
                top: top + 12,
                left: left + 12
            });
        },
        updateText: function (text) {
            this.$el.text(text).css('display', 'inline-block');
        },
        remove: function () {
            this.$el.remove();
            $('body :visible').off('mousemove.wf');
            $('body').off('mouseout.wf');
        }
    };
    /* Panel */
    panel = {
        PANELS: [],
        FONT_SERVICE_ICON: {},
        init_tmpl: function () {
            panel.tmpl = (function () {
                var tmpl = $('<div class="elem panel">' + '<div class="panel_title">' + '<span class="title_text"></span>' + '<a class="close_button" title="Close">&times;</a>' + '</div>' +
                    '<div class="panel_content">' + '<ul class="panel_properties">' + '<li>' + '<dl class="font_family">' + '<dt class="panel_label">Font Family</dt>' + '<dd class="panel_value"></dd>' + '</dl>' + '</li>' +
                    '<li>' + '<div class="size_line_height clearfix">' + '<dl class="size section">' + '<dt class="panel_label">Font Size</dt>' + '<dd class="panel_value"></dd>' + '</dl>' + '<dl class="line_height">' + '<dt class="panel_label">Line Height</dt>' + '<dd class="panel_value"></dd>' + '</dl>' + '</div>' + '</li>' +
                    '<li class="panel_no_border_bottom">' + '<dl class="type_info clearfix">' + '<dt class="panel_label"></dt>' + '<dd class="type_preview">' + "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz" + '</dd>' + '</dl>' +
                    '<div class="font_services panel_label" style="display:none;">' + 'Font Served by ' + '</div>' + '</li>' + '</ul>' +
                    '<div class="panel_tools clearfix">' + '<div class="panel_tools_left">' + '<div class="color_info">' + '<a title="Click to change color format" class="color_info_sample">&nbsp;</a>' + '<span class="color_info_value"></span>' + '</div>' + '</div>' + '<div class="panel_tools_right">' + '<a href="https://twitter.com/share" class="tweet_icon" target="_blank">Tweet</a>' + '</div>' + '</div>' + '</div>' + '</div>');
                return (function () {
                    return tmpl.clone();
                });
            }());
        },
        init: function () {
            $("body :visible").click(panel.pin);
            panel.init_tmpl();
            panel.FONT_SERVICE_ICON.Typekit = $("<span>").addClass("service_icon service_icon_typekit").text('Typekit');
            panel.FONT_SERVICE_ICON.Google = $("<span>").addClass("service_icon service_icon_google").text('Google Web Fonts');
            panel.FONT_SERVICE_ICON.Fontdeck = $("<span>").addClass("service_icon service_icon_fontdeck").text('Fontdeck');
        },
        restore: function () {
            $("body :visible").unbind("click", panel.pin);
            $.each(panel.PANELS, function (i, p) {
                $(p).remove();
            });
        },
        convertClassName: function (newPanel) {
            newPanel.find('*').add(newPanel).each(function (i, elem) {
                var className = $(elem).attr('class');
                className = (className === "" ? "basic" : (className + " basic"));
                if (className) {
                    className = className.split(' ');
                    $(elem).attr('class', css.getClassName(className));
                }
            });
            return newPanel;
        },
        typePreview: function (typeInfo, newPanel) {
            var canv = $(newPanel).find('.type_preview');
            canv.css(typeInfo.getFullCSS());
            return newPanel;
        },
        fontService: function (typeInfo, newPanel) {
            // Font Service section
            var fiu = typeInfo.current,
                fontData = fs.getFontDataByCSSName(fiu),
                fontServices,
                fontName;
            fontServices = $("<ul>").addClass('font_service');
            if (fontData) {
                $.each(fontData.services, function (name, srv) {
                    $("<li>").append(
                        $("<a>").append($(panel.FONT_SERVICE_ICON[name]).clone()).attr("href", srv.url).attr("target", "_blank")).appendTo(fontServices);
                });
                $(newPanel).find(".font_services").append(fontServices).show();
            } else {
                $(newPanel).find(".font_services").hide();
            }
            return newPanel;
        },
        fontFam: function (typeInfo, newPanel) {
            // Font Family section
            var fontStack = typeInfo.fonts.replace(/;/, '').split(/,\s*/),
                fontInUse = typeInfo.current,
                fontInUseFound = false,
                font,
                fHTML,
                ff,
                fiu,
                fiuFound;
            ff = typeInfo.fonts;
            fiu = typeInfo.current; // cssName Font in use
            ff = ff.replace(/;/, '').split(/,\s*/);
            fiuFound = false;
            // Font stack
            for (font = 0; font < fontStack.length; font += 1) {
                if (fontStack[font] !== fontInUse) {
                    fontStack[font] = "<span class='" + "fniu" + "'>" + fontStack[font] + "</span>";
                } else {
                    fontStack[font] = "<span class='" + "fiu" + "'>" + fontStack[font] + "</span>";
                    fontInUseFound = true;
                    break;
                }
            }
            fHTML = fontStack.join(", ") + ";";
            if (!fontInUseFound) {
                fHTML += " <span class='" + ".fiu" + "'>" + fontInUse + "</span>";
            }
            fHTML = "<div class=" + css.getClassName('fontfamily_list') + ">" + fHTML + "</div>";
            $(newPanel).find(".font_family>dd").html(fHTML);
            return newPanel;
        },
        sizeLineHeight: function (typeInfo, newPanel) {
            var size = typeInfo.size,
                lh = typeInfo.lineHeight;
            $(newPanel).find(".size>dd").text(size);
            $(newPanel).find(".line_height>dd").text(lh);
            return newPanel;
        },
        color: function (typeInfo, newPanel) {
            var rgb_color = typeInfo.color,
                sample = $(newPanel).find(".color_info_sample"),
                value = $(newPanel).find(".color_info_value"),
                re,
                match,
                r,
                g,
                b,
                hex_color,
                colors,
                color_type;
            if (rgb_color.indexOf('rgba') !== -1) {
                // don't display rgba color (not accurate)
                $(newPanel).find(".color_info").hide();
                return;
            }
            re = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
            match = rgb_color.match(re);
            r = parseInt(match[1], 10).toString(16);
            g = parseInt(match[2], 10).toString(16);
            b = parseInt(match[3], 10).toString(16);
            r = (r.length === 1) ? '0' + r : r;
            g = (g.length === 1) ? '0' + g : g;
            b = (b.length === 1) ? '0' + b : b;
            hex_color = '#' + r + g + b;
            colors = [rgb_color, hex_color];
            color_type = 0;
            sample.css("background-color", rgb_color).click((function (colors, color_type, value) {
                return function (e) {
                    color_type = (color_type + 1) % colors.length;
                    value.text(colors[color_type]);
                    e.preventDefault();
                    return false;
                };
            }(colors, color_type, value))).click();
        },
        tweet: function (typeInfo, newPanel) {
            var tweet_icon = $(newPanel).find(".tweet_icon"),
                url = tweet_icon.attr("href"),
                cssName = typeInfo.current,
                typeName = fs.getFontNameByCSSName(cssName) || cssName;
            url += '?text=' + encodeURIComponent('I like this typography design with ' + typeName + '.') + '&via=What_Font';
            tweet_icon.attr("href", url);
        },
        panelContent: function (typeInfo, newPanel) {
            $(['typePreview', 'fontService', 'fontFam', 'sizeLineHeight', 'color', 'tweet']).each(function (i, prop) {
                panel[prop](typeInfo, newPanel);
            });
        },
        panelTitle: function (typeInfo, newPanel) {
            // Panel title
            var cssName = typeInfo.current,
                typeName = fs.getFontNameByCSSName(cssName) || cssName,
                title_text = typeName + ' - ' + typeInfo.variant;
            $(newPanel).find(".title_text").html(title_text).css(typeInfo.getFullCSS());
            (function (newPanel) {
                $(newPanel).find(".close_button").click(function (e) {
                    $(newPanel).remove();
                    e.stopPropagation();
                    return false;
                });
            }(newPanel));
            return newPanel;
        },
        get: function (elem) {
            // Create panel
            var p = panel.tmpl(),
                typeInfo = new TypeInfo(elem);
            panel.panelTitle(typeInfo, p);
            panel.panelContent(typeInfo, p);
            panel.convertClassName(p);
            $(p).click(function (e) {
                $(this).find('*').css('-webkit-animation', 'none');
                $(this).detach();
                $(this).appendTo('body');
            });
            return p;
        },
        pin: function (e) {
            // Add a panel according to event e
            // (Event handler)
            var p;
            tip.hide();
            p = panel.get(this);
            //setEventPosOffset(panel, e, -13, 12);
            $(p).css({
                'top': e.pageY + 12,
                'left': e.pageX - 13
            }).appendTo("body");
            panel.PANELS.push(p);
            e.stopPropagation();
            e.preventDefault();
        }
    };
    /* Toolbar */
    toolbar = {
        TOOLBAR: null,
        init: function () {
            var exit = $.createElem('div', "exit", "Exit WhatFont"),
                help = $.createElem('div', "help", "<strong>Hover</strong> to identify<br /><strong>Click</strong> to pin a detail panel");
            toolbar.TOOLBAR = $("<div>").addClass(css.getClassName(["elem", "control"])).append(exit).appendTo('body');
            $(exit).click(function () {
                ctrl.restore();
            });
        },
        restore: function () {
            $(toolbar.TOOLBAR).remove();
        }
    };
    function getDefaultFont() {
        var random = $('<p>').css('font-family', 'S0m3F0n7'),
            serif = $('<p>').css('font-family', 'serif'),
            sansSerif = $('<p>').css('font-family', 'sans-serif'),
            testCanvasRandom = new TestCanvas(new TypeInfo(random)),
            testCanvasSerif = new TestCanvas(new TypeInfo(serif)),
            testCanvasSansSerif = new TestCanvas(new TypeInfo(sansSerif));
        if (testCanvasRandom.isEqual(testCanvasSerif)) {
            defaultFont = 'serif';
        } else {
            defaultFont = 'sans-serif';
        }
    }
    /* Controller */
    ctrl = {
        shortcut: function (e) {
            var key = e.keyCode || e.which;
            if (key === 27) {
                ctrl.restore();
                e.stopPropagation();
            }
        },
        restore: function (e) {
            $("body :visible").unbind('mousemove', ctrl.updateTip);
            $("body :visible").unbind('click', ctrl.pinPanel);
            toolbar.restore();
            tip.remove();
            panel.restore();
            css.restore();
            $("body").unbind("keydown", ctrl.shortcut);
            window._WHATFONT = false;
        },
        init: function () {
            var loaded;
            if (!$ && jQuery) {
                $ = jQuery;
            }
            loaded = (typeof window._WHATFONT !== 'undefined') && window._WHATFONT;
            if (loaded || !$) {
                return false;
            }
            window._WHATFONT = true;
            $.createElem = function (tag, className, content, attr) {
                // Shortcut for generating DOM element
                var e = $("<" + tag + ">"),
                    c;
                className = className || [];
                content = content || '';
                className = (typeof className === 'string') ? [className] : className;
                className.push('basic');
                e.addClass(css.getClassName(className));
                if (typeof content === 'string') {
                    e.html(content);
                } else if (content.constructor === Array) {
                    $.map(content, function (n, i) {
                        return e.append(n);
                    });
                } else {
                    e.append(content);
                }
                if (typeof attr !== 'undefined') {
                    e.attr(attr);
                }
                return e[0];
            };
            getDefaultFont();
            css.init();
            tip = new Tip();
            panel.init();
            toolbar.init();
            fs.init();
            $("body").keydown(ctrl.shortcut);
        }
    };
    _wf = {
        init: function () {
            ctrl.init();
        },
        restore: function () {
            ctrl.restore();
        }
    };
    return _wf;
}
if (typeof jQuery !== 'function') {
    var jQuery = document.createElement("script");
    jQuery.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js';
    jQuery.onload = function () {
        _whatFont().init();
    };
    document.getElementsByTagName("head")[0].appendChild(jQuery);
} else {
    _whatFont().init();
}