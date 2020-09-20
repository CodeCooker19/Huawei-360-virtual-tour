
/* 封装ajax函数
 * @param {string}opt.type http连接的方式，包括POST和GET两种方式
 * @param {string}opt.url 发送请求的url
 * @param {boolean}opt.async 是否为异步请求，true为异步的，false为同步的
 * @param {object}opt.data 发送的参数，格式为对象类型
 * @param {function}opt.success ajax发送并接收成功调用的回调函数
 */
    function ajax(opt) {
        opt = opt || {};
        opt.method = opt.method.toUpperCase() || 'POST';
        opt.url = opt.url || '';
        opt.async = opt.async || true;
        opt.data = opt.data || null;
        opt.success = opt.success || function () {};
       
        var xhr = new XMLHttpRequest();
            if("withCredentials" in xhr){
                
            }else if(typeof XDomainRequest !="undefined"){
                
                xhr = new XDomainRequest();
               
            }else{
                //否则，CORS不被该浏览器支持
                xhr = null;
            }
        var params = [];
        for (var key in opt.data){
            params.push(key + '=' + opt.data[key]);
        }
        var postData = params.join('&');
        if (opt.method.toUpperCase() === 'POST') {
            xhr.open(opt.method, opt.url, opt.async);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
            xhr.send(postData);
        }
        else if (opt.method.toUpperCase() === 'GET') {
            xhr.open(opt.method, opt.url + '?' + postData, opt.async);
            xhr.send(null);
        } 
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                opt.success(xhr.responseText);
            }
        };
    }
  
   
    var hasAdd = false  //只有2288hv5和ch121v5的hasAdd为true.
    var proto='http://'
    if(window.location.protocol=='http:'){
        proto='http://'
    }else {
        proto='https://'
    }
    //console.log('res')
    var preUrl =proto+"support.huawei.com/onlinetoolweb/server-3D/model/server-info/server-3d/"
    //var preUrl =proto+"rnd-supportv8.huawei.com/onlinetoolsweb/server-3D/model/server-info/server-3d/"
    //var preUrl =proto+"rnd-support-it.huawei.com/server-3D/model/server-info/server-3d/"
    function init(url){
        window.document.body.addEventListener('touchmove', function (e) {
            e.preventDefault(); 
        }, {passive: false}); 
        ajax({
            method: 'get',
            url: preUrl+url,
            success: function (response) {
                var res = JSON.parse(response)
                console.log(res)
                if(window.location.protocol=='https:'){
                    // res['tree.json'] = res['tree.json'].replace('http','https')
                    // res['modelSourceURLPrefix'] = res['modelSourceURLPrefix'].replace('http','https')
                }
                iv.initEditor3d(res['tree.json'],res['modelSourceURLPrefix'].slice(0,-8))
                //iv.initEditor3d('./tree.json','./res/model/')
                click_component()
                iv.setAxis("y")
                if(hasAdd){add()}
            }
        });

        // iv.initEditor3d('tree.json')
        // click_component()
        // iv.setAxis("y")
        // if(hasAdd){add()}
    }
   
 