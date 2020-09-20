const title={
    cn:'计算产品3D展示',
    en:'Computing Interactive Product Display'
}
var stories={
                cn:'https://e.huawei.com/cn/case-studies?product=servers',
                en:'https://e.huawei.com/en/case-studies?product=servers'
            };

$(document).ready(function() {
    /*默认语言*/
    // $("#langList").css({display:'none'})
        var state = {
            title:document.title,
            url:document.location.href,
            otherkey:null
        }
        var langIndex = window.location.href.indexOf('?lang')
        function initHref(){
            if(langIndex!=-1){
                defaultLang = window.location.href.substr(langIndex+6,2)
                $(".moreHref").attr('href',moreHref[defaultLang]);
            }else{
                history.replaceState(state,document.title,document.location.href+'?lang='+defaultLang)  //初始化地址栏
            }
        }
        function preventBlank(choose){
            if($(choose).attr('href')=="#"){
                $(choose).attr('target','_self');
            }
        }
       function check(){
            $("[i18n]").i18n({
                defaultLang: defaultLang,
                filePath: "./res/i18n/",
                filePrefix: "i18n_",
                fileSuffix: "",
                forever: false,
                callback: function() {
                    
                    }
                });
            var URL = './res/i18n/i18n_'+defaultLang+'.json?v='+new Date().getTime()    //完成tip的国际化
             $.ajax({
                type:'GET',
                url:URL,
                success:function(e){
                    langJson = e;
                    $.each($(".i18n"),function(i,item){ 
                        var key =$(item).attr("i18nkey"); 
                        $(item).attr('data-original-title', e[key]);
                     })	
                    history.replaceState(state,document.title,state.url.substring(langIndex,0)+'?lang='+defaultLang)  //改变化地址栏
                    $('title').html(title[defaultLang]) 
                    $(".moreHref").attr('href',moreHref[defaultLang]);
                    preventBlank(".moreHref");

                    $(".tools").attr('href',tools[defaultLang]);
                    preventBlank(".tools");

                    $(".userguide").attr('href',userguide[defaultLang]);
                    preventBlank(".userguide");


                    $(".software").attr('href',software[defaultLang]);
                    preventBlank(".software");              

                    $("#top_icon_4").attr('href',Specifications[defaultLang]);
                    preventBlank("#top_icon_4");

                    $(".stories").attr('href',stories[defaultLang]);
                    preventBlank(".stories");

                    $(".qrcode").qrcode({
                        render : "canvas",
                        text : document.location.href,
                        width:"150",
                        height:'150',
                        background:'#ffffff',
                        foreground:"#000000"
                    }); 
                    $('.qrcode canvas').css({display:'none'})        
                    $('.qrcode canvas:last-child').css({display:'inline-block'})    //隐藏前面的二维码，只显示当前的（也就是最后一个）
                }
            })	
        }
        initHref();
        check();
       
        $("#langList").on('click',function(e){
            defaultLang = $(e.target).attr('data-lang');
            check();
        })
        $("#top_icon_8").on('click',function(e){
            var hasDetaiList = ['taishan2280','taishan5280']
            e.preventDefault();
            var url=''
            var backDetail = false
            for(var i=0;i<hasDetaiList.length;i++){
                if( window.location.href.indexOf(hasDetaiList[i])>-1){
                    sessionStorage.setItem('whitchDetail',hasDetaiList[i])
                    backDetail = hasDetaiList[i];break;
                }
            }
            if(backDetail){     //如果该机型有详情页
                if(defaultLang=='cn'){url='../../../detail/detail'+'_zh.html' }
                if(defaultLang=='en'){url='../../../detail/detail'+'_en.html' }
            }else{
                if(defaultLang=='cn'){url='../../../index'+'_zh.html' }
                if(defaultLang=='en'){url='../../../index'+'_en.html' }
            }
            window.location=url
        })
    });

   