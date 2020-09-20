var boom_flag=0;
$('#top_icon_2').on('click',function(){
    move_flag==0?showOrHideMark(1,'Markup Layer'):'';
    boom_flag=1;
  
})
$('#top_icon_2_xs').on('click',function(){
    move_flag==0?showOrHideMark(1,'Markup Layer'):'';
    boom_flag=1;
  
})
$('#top_icon_1').on('click',function(){
   console.log(1)
    showOrHideMark(1,'Markup Layer')
    boom_flag=0;nodeColor=[1,1,1,0.5,1,1];  
    $.each($("#menu-item-box1>.menu-item>input"),function(i,item){   
        $(item).parent().removeClass("active")
           })
   
    move_flag = 0;
    ivSetEditMode("select");
    
})
$('#top_icon_1_xs').on('click',function(){
    showOrHideMark(1,'Markup Layer')
    boom_flag=0;nodeColor=[1,1,1,0.5,1,1]; 
    $.each($("#menu-item-box1>.menu-item>input"),function(i,item){   
        $(item).parent().removeClass("active")
           }) 
   
    move_flag = 0;
    ivSetEditMode("select");
})

$(".qrcode").qrcode({
    render : "canvas",
    text : document.location.href,
    width:"150",
    height:'150',
    background:'#ffffff',
    foreground:"#000000"
});  
$("#boomlicon5").hover(function(){
    $(".qr-container").toggle()
})    

