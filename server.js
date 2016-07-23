(function () {
    // 定义变量
    var cheerio = require('cheerio');
    var qs = require('querystring');
    var http = require('http');
    var url = require('url');

    http.createServer(function (request, response) {
        var visitObject = {
            // 根据 url，获取 html
            url: function (visitUrl) {
                var that = this;
                http.get(visitUrl, function (res) {
                    console.log(visitUrl);
                    var resData = '';
                    res.on('data', function (data) {
                        resData += data; //拼接响应报文
                    });
                    res.on('end', function () {
                        // 响应结束
                        if (that.tag == '__all__') {
                            var obj = JSON.parse(resData);
                            that.jsonHtml(obj.html);
                        } else if (that.tag == 'video') {

                        } else {
                            var headers = res.rawHeaders;
                            var redirecUrl = headers[11] || '';
                            if (/^http:.*/.test(redirecUrl) || /^https:.*/.test(redirecUrl)) {
                                that.url(redirecUrl);
                                return;
                            } else {
                                that.detailHtml(resData);
                            }
                        }
                    });
                });
            },
            // 解析返回的 json 字符串中的 HTML
            jsonHtml: function (resHtml) {
                var that = this;
                // cheerio的load方法返回的对象，拥有与jQuery相似的API
                var $ = cheerio.load(resHtml);
                var postList = [];
                // 查询符合条件的a标签
                $('a[href^="/"]').each(function (index, item) {
                    var href = $(item).attr('href');
                    if (href.indexOf('/item/') >= 0) {
                        href = 'i' + href.replace('/item/', '').replace(/[/]/g, '');
                    } else {
                        href = href.replace(/[/]/g, '');
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
                that.responseList(postList);
            },
            // 解析返回的详情页的 HTML
            detailHtml: function (resHtml) {
                var that = this;
                var $ = cheerio.load(resHtml);
                var postList = [];
                if ($('body header').length > 0) {
                    postList = that.parseOne($);
                } else if ($('body article').length > 0) {
                    console.log('第二种方式');
                    var hidValue = $('body>div>input[name="csrfmiddlewaretoken"]');
                    if (hidValue) {
                        that.url(that.visitUrl + 'info/?csrfmiddlewaretoken=' + hidValue.val());
                    }
                    return;
                } else if ($('body>div#wrapper>div#container').length > 0) {
                    postList = that.parseThree($);
                } else if ($('body>div#gallery').length > 0) {
                    postList = that.parseFour($);
                }
                that.responseList(postList);
            },
            // 返回响应报文
            responseList: function (resList) {
                response.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' });
                response.end(JSON.stringify(resList));
            },
            // 解析第一种情况的 HTML
            parseOne: function ($) {
                console.log('第一种方式');
                var postList = [];
                var header = $('body header');
                var title = $('h1', header).text();
                var time = $('time', header).text();
                var cmt = $('#source', header).text();

                var content = $('article');
                var imgUrl = $('img', content).attr('alt_src');
                var src = '';
                $('p:not(:first-child)', content).each(function (index, item) {
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
                return postList;
            },
            // 解析第二种情况的 HTML
            parseTwo: function ($) {

            },
            // 解析第三种情况的 HTML
            parseThree: function ($) {
                console.log('第三种方式');
                var article = $('body>div#wrapper>div#container>div>div#pagelet-article');
                var header = $('div.article-header', article);
                var title = $('h1', header).text();
                var cmt = $('div>.src', header).text();
                var time = $('div>.time', header).text();
                var content = $('div.article-content', article);
                var imgUrl = $('img', content).attr('src');
                var src = '';
                $('p', content).each(function (index, item) {
                    src += '<p>' + $(item).text() + '</p>';
                });
                var postList = [];
                postList.push({
                    title: title,
                    cmt: cmt,
                    src: src,
                    imgUrl: imgUrl,
                    time: time
                });
                return postList;
            },
            // 解析第四种情况的 HTML
            parseFour: function ($) {
                console.log('第四种方式');
                var postList = [];
                var header = $('body>div#gallery>header');
                var title = $('h1', header).text();
                var cmt = $('div.subtitle>a#source', header).text();
                var time = $('div.subtitle>time', header).text();

                var content = $('body>div#gallery>figure');
                var src = $('figcaption', content).text();
                var imgUrl = $('img', content).text();

                postList.push({
                    title: title,
                    cmt: cmt,
                    time: time,
                    imgUrl: imgUrl,
                    src: src
                });
                return postList;
                //$('figure').each(function (index, item) {
                //    var src = $('figcaption', item).text();
                //    var imgUrl = $('img', item).text();
                //});
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
        if (visitObject.visitUrl.substring(visitObject.visitUrl.length - 1) !== '/') {
            visitObject.visitUrl += '/';
        }
        var query = url.parse(visitObject.visitUrl).query;
        visitObject.tag = qs.parse(query).tag || '';
        visitObject.url(visitObject.visitUrl);
    }).listen(8888);
    console.log('server start');
})();
