(function() {
    // 定义变量
    var cheerio = require('cheerio');
    var qs = require('querystring');
    var http = require('http');
    var url = require('url');

    http.createServer(function(request, response) {
        var visitObject = {
            // 根据 url，获取 html
            url: function(visitUrl) {
                var that = this;
                http.get(visitUrl, function(res) {
                    var resData = '';
                    res.on('data', function(data) {
                        resData += data; //拼接响应报文
                    });
                    res.on('end', function() {
                        // 响应结束
                        if (that.tag == '__all__') {
                            var obj = JSON.parse(resData);
                            that.jsonHtml(obj.html);
                        } else if (that.tag == 'video') {

                        } else {
                            var headers = res.rawHeaders;
                            var redirecUrl = headers[11] || '';
                            if (redirecUrl.indexOf('http') == 0) {
                                that.url(redirecUrl);
                                return;
                            } else {
                                that.detailHtml(resData);
                            }
                        }
                    });
                });
            },
            jsonHtml: function(resHtml) {
                var that = this;
                // cheerio的load方法返回的对象，拥有与jQuery相似的API
                var $ = cheerio.load(resHtml);
                var postList = [];
                // 查询符合条件的a标签
                $('a[href^="/"]').each(function(index, item) {
                    var href = $(item).attr('href');
                    if (href.indexOf('/item/') >= 0) {
                        href = 'i' + href.replace('/item/', '').replace('/', '');
                    }
                    var title = $('.desc>h3', item).text();
                    var itemInfo = $('.desc .item_info', item);

                    var hot_label = $('.hot_label', itemInfo).text();
                    var src = $('.src', itemInfo).text();
                    var cmt = $('.cmt', itemInfo).text();
                    var time = $('.time', itemInfo).text();
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
                that.postList(postList);
            },
            detailHtml: function(text) {
                var that = this;
                var $ = cheerio.load(text);
                var postList = [];
                var header = $('header');
                var title = $('h1', header).text();
                var time = $('time', header).text();
                var cmt = $('#source', header).text();

                var content = $('article');
                var imgUrl = $('img', content).attr('alt_src');
                var src = '';
                $('p:not(:first-child)', content).each(function(index, item) {
                    src += '<p>' + $(item).text() + '</p>';
                });
                postList.push({
                    url: '',
                    imgUrl: imgUrl,
                    title: title,
                    src: src,
                    cmt: cmt,
                    time: time
                });
                that.postList(postList);
            },
            postList: function(resList) {
                response.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' });
                response.end(JSON.stringify(resList));
            }
        };

        visitObject.visitUrl = 'http://m.toutiao.com';
        if (request.url == '/favicon.ico') {
            response.end();
        } else if (request.url.indexOf('tag=') >= 0) {
            visitObject.visitUrl = 'http://m.toutiao.com/list' + request.url;
        } else {
            visitObject.visitUrl += request.url;
        }
        var query = url.parse(visitObject.visitUrl).query;
        visitObject.tag = qs.parse(query).tag || '';
        visitObject.url(visitObject.visitUrl);
    }).listen(8888);
    console.log('server start');
})();
