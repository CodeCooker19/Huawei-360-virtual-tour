var nodeList = [];  //存储部件菜单中选中的radio


    var nodeLength = $("#menu-item-box1>.menu-item>input").length;
for(let i=0;i<nodeLength;i++){
    nodeList.push($("#menu-item-box1>.menu-item>input")[i].value)
}
$(".menu-icon").click(function(){
    $('.left-menu-container').animate({
        right:'0px',
    },300,'linear')
    $(".menu-icon").css({display:'none'})
})
$("#closeMenu").click(function(){
    $('.left-menu-container').animate({
        right:'-196px',
    },300,'linear')
    setTimeout(function(){
        $(".menu-icon").css({display:'inline-block'})
    },350)
})
var meinu1_height=$("#menu-item-box1").height()
var meinu2_height=$("#menu-item-box2").height()
$("#menu-node1").click(function(){
    if($("#menu-item-box1").hasClass("active")){
        $("#node-icon1").attr('src','../common/images/jia.png?v=1554363265726')
        $('.menu-item>label').css({display:'none'})
        $("#menu-item-box1").animate({
            height:'0',
        },200,function(){
            $("#menu-item-box1").css({display:'none'})
           
          }
        ).removeClass("active")
    }else{
        $("#node-icon1").attr('src','../common/images/jian.png?v=1554363265726')
        $("#menu-item-box1").css({display:'block'}).animate({
            height:meinu1_height+'px',
        
        },200,function(){
            $('.menu-item>label').css({display:'block'})
        }).addClass("active")
    }
})
$("#menu-node2").click(function(){
    if($("#menu-item-box2").hasClass("active")){
        $("#node-icon2").attr('src','../common/images/jia.png?v=1554363265726')
        $("#menu-item-box2").animate({
            height:'0'
        },300,function(){
            $("#menu-item-box2").css({display:'none'})}).removeClass("active")
        $(".left-menu").css({
            borderBottom:'none'
        })
    }else{
        $("#node-icon2").attr('src','../common/images/jian.png?v=1554363265726')
        $("#menu-item-box2").css({display:'block'}).animate({
            height:meinu2_height+'px',
        },300
        ).addClass("active")
        // $(".left-menu").css({
        //     borderBottom:'1px solid #666666'
        // })
    }
})

$("#menu-item-box1>.menu-item>input").on('click',function(e){   //监听radio，实现radio的选中与取消
    
    if($(e.target).attr('checked') == 'checked'){   //如果之前状态为已选中，则取消选中，并且删除nodeList中对应的存储的值，
        $(e.target).attr('checked',false).prop('checked',false)
        nodeList.forEach(function(val,index){    //取消选中时删除对应的值
            if($(e.target).val() == val){
                nodeList.splice(index,1)
            }
        })
        showOrHideMark(0,$(e.target).val())
        showOrHideNode(0,$(e.target).val())
    }else{
        $(e.target).attr('checked',true).prop('checked',true)
        nodeList.push($(e.target).val())
        showOrHideMark(1,$(e.target).val())
        showOrHideNode(1,$(e.target).val())
    }
    if(nodeList.length ==  nodeLength){            //判断是否全选
        showOrHideMark(1,'Markup Layer')
        $("#show").prop('checked',true).attr('checked',true)
    }else{
        
        $("#show").prop('checked',false).attr('checked',false)
    }
})
$("#show").on('click',function(e){
    if($(e.target).attr('checked') != 'checked'){   //如果之前状态为已选中，则取消选中，并且删除nodeList中对应的存储的值，
        nodeList=[];
        $(e.target).attr('checked',true).prop('checked',true)
        $("#menu-item-box1>.menu-item>input").each(function(){      //实现全选
            $(this).prop('checked',true).attr("checked",true)
            nodeList.push($(this).val())
            showOrHideMark(1,'Markup Layer')
        })
        nodeList.forEach(function(val,index){
            showOrHideNode(1,val);
        })
    }else{
        $(e.target).attr('checked',false).prop('checked',false)
        nodeList.forEach(function(val,index){
            showOrHideNode(0,val);
        })
        nodeList=[]
        $("#menu-item-box1>.menu-item>input").each(function(){      
            $(this).prop('checked',true).attr("checked",false)
            showOrHideMark(0,'Markup Layer')
        })
    
    }
})
function originView(){
   view3d.setDefView(iv.VIEW_TRANSITION);view3d.playAnimation({speed:1,type:1,from:1,to:0});
    setTimeout(function(){
        if($("#show").prop('checked') != true){
            nodeList = []
            $("#menu-item-box1>.menu-item>input").each(function(){      //实现全选
                $(this).prop('checked',true).attr("checked",true)
                nodeList.push($(this).val())
                showOrHideMark(1,'Markup Layer')
                showOrHideNode(1,$(this).val());
            })
            $("#show").prop('checked',true).attr('checked',true)
        }
    },100)
    if(browserType=='mobile'){$("[i18n='main.text']").css({display:'-webkit-box'})}
}
function boomView(){
    view3d.setDefView(iv.VIEW_TRANSITION);view3d.playAnimation();
    setTimeout(function(){
        if($("#show").prop('checked') != true){
            nodeList = []
            $("#menu-item-box1>.menu-item>input").each(function(){      //实现全选
                $(this).prop('checked',true).attr("checked",true)
                nodeList.push($(this).val())
                showOrHideMark(1,'Markup Layer')
                showOrHideNode(1,$(this).val());
            })
            $("#show").prop('checked',true).attr('checked',true)
         }
    
    },100)
    move_flag = 0
    ivSetEditMode("select");
   if(browserType=='mobile'){$("[i18n='main.text']").css({display:'none'})}
}

$('#top_icon>li').on('click',function(){
    
  
    if($(this).children()[0].id=='top_icon_3'){
            if(move_flag == 0){
                showOrHideMark(0,'Markup Layer');
                nodeColor=[1,0,0,0.5,1,1];     //修改玩vmtld源码，传入nodeColor以改变选中时的颜色
                $($('#top_icon>li')[2]).addClass('active')
                $(this).addClass('active')
                ivSetEditMode("move");
                move_flag = 1;
            }
            else{
                showOrHideMark(1,'Markup Layer')
                ivSetEditMode("select");
                $($('#top_icon>li')[2]).removeClass('active')
                move_flag = 0;
            }
           
            
    }else{
        $('#top_icon>li').removeClass('active')
        $(this).addClass('active')
    }
    
})

$('#top_icon_xs>div').on('click',function(){
    $('#top_icon_xs>div').removeClass('active')
    $(this).addClass('active')
    if(this.id=='top_icon_3_xs'){
        ivSetEditMode("move");
            if(move_flag == 0){
                showOrHideMark(0,'Markup Layer');
                nodeColor=[1,0,0,0.5,1,1];     //修改玩vmtld源码，传入nodeColor以改变选中时的颜色
                $('#top_icon_xs>div').removeClass('active')
                $(this).addClass('active')
                move_flag = 1;
            }
            else{
                showOrHideMark(1,'Markup Layer')
                ivSetEditMode("select");
                $('#top_icon_xs>div').removeClass('active')
   
                move_flag = 0;
            }
            
    }
})

$($('#top_icon>li')[0]).addClass('active')
if(document.body.offsetWidth<=512 ){
    $('#top_tips').css({
    width:$('body').width()*0.96+'px',
    left:$('body').width()*0.02+'px'
    })
    $('[i18n="main.title"]').css({
        textAlign:'center',
        fontSize:'6vw'
    })
     $('[i18n="main.text"]').css({
        fontSize:'4.1vw'
    })
}

