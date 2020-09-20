function click_component()//点击事件
  {
    window.document.body.addEventListener('touchmove', function (e) { //阻止微信下拉和其他浏览器下拉
      e.preventDefault(); 
    }, {passive: false}); 
		view3d.addRefTarget(
			 function(event)
				 {   
					switch(event.code)
				    {
                    
					case "selection":{
                        console.log(event.node)
                      if(move_flag==1)       //控制选中node的颜色，拖拽视图
                        { 
                            nodeColor=[1,0,0,0.5,1,1];
                            change_node_name(event.node);
                        }
                        else{
                            if(	boom_flag==1){            //如果当前是爆炸视图
                                if(event.node==null){ nodeColor=[1,1,1,0.5,1,1];return;}
                                if(marks.indexOf(event.node.name)!=-1){    //如果是点的话 设置选中的颜色为本来的颜色
                                    for(var i=0;i<marks.length;i++){
                                    if(marks[i]==event.node.name){
                                        nodeColor=[1,0.51220,0.51220,0.5,1,1];
                                        return;
                                      }
                                    }
                                }else{
                                    nodeColor=[1,0,0,0.5,1,1];    //如果是node，则设置颜色为红色
                                    change_node_name(event.node);
                                    return;
                                } 
                            }
                            if(event.node==null){ nodeColor=[1,1,1,0.5,1,1];return;}
                            if(marks.indexOf(event.node.name)!=-1){    //如果是点的话 设置选中的颜色为本来的颜色，原始视图
                                for(var i=0;i<marks.length;i++){
                                  if(marks[i]==event.node.name){
                                    nodeColor=[1,0.51220,0.51220,0.5,1,1];
                                    break;
                                  }
                                }
                              }else{
                                nodeColor=[event.node.material.diffuse[0].color[0],event.node.material.diffuse[0].color[1],event.node.material.diffuse[0].color[2],0.5,1,1]    //如果不是点，则设置颜色为材质颜色
                              }
                            
                        }
                    }break;
					case "mousehover":{ if(browserType== 'pc'){hoverNode(event.x,event.y);};break;}
					case 'mousedown':{
                       if(boom_flag!=0){
                            if(event.node==null){ nodeColor=[1,0,0,0.5,1,1];}
                            else{nodeColor=[1,0.51220,0.51220,0.5,1,1];}
                        }
                        if(browserType== 'mobile'){hitNode(event.x,event.y,event.node)}
                    };break;
                    case 'dataReady':{
                       setTimeout(function(){
                             for(var i=0;i<hideNodeList.length;i++){
                                showOrHideNode(0,hideNodeList[i],false)
                            }
                       },300)
                    };break;
					
                    }
                 
				})  
    }  
    var browserType =''
    function getBrowserType(){
        var mobileAgent = ['iphone','ipod','ipad','android','mobile','blackberry','webos','incognito','webmate','bada','nokia','lg','ucweb','skyfire'];
        var browser = window.navigator.userAgent.toLowerCase();
        for(var i=0;i<mobileAgent.length;i++ ){
            if(browser.indexOf(mobileAgent[i])!=-1){
                browserType='mobile';
                break;
            }else{
                browserType='pc'
            }
        }
       
    }
    getBrowserType();    

    function hitNode(x,y,node){
        if(browserType=='pc'){return true}
        if(node==null){hideInfo(); return false;}
        if(marks.indexOf(node.name)!=-1){
          for(var i=0;i<marks.length;i++){
            if(marks[i]==node.name){
                var html = "<div class='toast-title'>"+langJson[node.name+'.title']+"</div><p class='toast-main'>"+langJson[node.name]+"</p>"
                $('.toastText').html(html)
                $('#toastModal').modal('show')
            }
          }
        }
        
    }    
 