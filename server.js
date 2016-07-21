(function() {
    // 定义变量
    var superagent = require('superagent');
    var observe = require('observe.js');
    var cheerio = require('cheerio');
    var url = require('url');
    var http = require('http');
    // 创建单例
    var reptile = observe({});

    function htmlEncode(html) {
        var s = '';
        if (html.length == 0) return "";
        s = html.replace(/&amp;/g, "&");
        s = s.replace(/&lt;/g, "<");
        s = s.replace(/&gt;/g, ">");
        s = s.replace(/&nbsp;/g, " ");
        s = s.replace(/&#39;/g, "\'");
        s = s.replace(/&quot;/g, "\"");
        return s;
    }
    // 侦听属性
    reptile.on({
        // 根据 url，获取text
        url: function(url) {
            var that = this;
            // get方法发出请求，query方法为url添加query字段（url问号背后的）
            // end 方法接受回调参数，html一般在res.text中
            superagent.get(url).query(this.query).end(function(err, res) {
                if (err) {
                    console.log('返回数据出错：' + err);
                    return;
                }
                if (res.ok) {
                    if (that.query.indexOf('tag=') >= 0) {
                        that.text = res.text;
                    } else {
                        that.allHtml = res.text;
                    }
                }
            });
        },
        // 触发的回调函数在这里
        text: function(text) {
            var that = this;
            var resHtml = JSON.parse(text).html;
            // cheerio的load方法返回的对象，拥有与jQuery相似的API
            var $ = cheerio.load(resHtml);
            var postList = [];
            // 查询符合条件的a标签
            $('a[href^="/"]').each(function(index, item) {
                var href = $(item).attr('href');
                var title = $('.desc>h3', item).text();
                var hot_label = $('.desc .item_info .hot_label', item).text();
                var src = $('.desc .item_info .src', item).text();
                var cmt = $('.desc .item_info .cmt', item).text();
                var time = $('.desc .item_info .time', item).text();
                var imgUrl = $('.list_img_holder>img', item).attr('src');
                if (!title) {
                    return;
                }
                postList.push({
                    url: href,
                    imgUrl: imgUrl,
                    title: title,
                    hot_label: hot_label,
                    src: src,
                    cmt: cmt,
                    time: time
                });
            });
            // 赋值就触发回调
            that.postList = postList;
        },
        allHtml: function(text) {
            var that = this;
            console.log(text);
            var $ = cheerio.load(text);
            var container = $('#wrapper #container');
            var title = $('.article-header .title', container).text();
            var time = $('.article-header .time', container).text();
            var imgUrl = $('.article-content img', container).attr('src');
            var src = $('.article-content span', container).text();
            that.postList.push({
                imgUrl: imgUrl,
                title: title,
                src: src,
                time: time
            });
        }
    });
    http.createServer(function(request, response) {
        console.log(request.url);
        reptile.url = 'http://m.toutiao.com';
        if (request.url == '/favicon.ico') {
            response.end();
        } else if (request.url.indexOf('tag=') >= 0) {
            reptile.url = 'http://m.toutiao.com/list';
            reptile.query = request.url.substring(2);
        } else {
            reptile.url += request.url;
            reptile.query = '';
            console.log(reptile.url);
        }
        response.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
        response.end(JSON.stringify(reptile.postList));
    }).listen(8888);
    console.log('server start');
})();
