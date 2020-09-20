iv.markupInitTraverse=function(n,name,info)
{
    var a=n.search(name);
    if(a){
        var d={node:a};
        if(a.tm)
        {
            d.tm=mat4.create(a.tm);
        }else d.tm=null;
        info[name]=d;
    }
}

iv.markupRestoreMatrix=function(t)
{
if(t)
    {
        var _tm=t.node.enableTM();
        if(t.tm)mat4.copy(t.tm,_tm);
        else 
        mat4.identity(_tm);
    }
}

iv.markupFlipMatrix=function(t)
{
if(t && t.node.tm)
        t.node.tm[12]*=-1;
}

vec3.distance2d=function(a,b){var c=b[0]-a[0],e=b[1]-a[1];return Math.sqrt(c*c+e*e);}

iv.node.prototype.traverseMarkupLeader4=function(ctx,ptm,astate,opacity) {
    var m=this.markup;
    var t=m.tempInfo;
    m=m.markup;

    if(this.object) {
        var obj=this.object;
        if(obj.boxMin) {
            //var w=param.window;
            if(ptm) {
                mat4.mulPoint(ptm,obj.boxMin,t.w1);
                mat4.mulPoint(ptm,obj.boxMax,t.w2);
            } else {
                vec3.cpy(t.w1,obj.boxMin);
                vec3.cpy(t.w2,obj.boxMax);
            }
            ctx.worldToView(t.w1,t.v1);
            ctx.worldToView(t.w2,t.v2);

            if(t.leader&&t.leader.object) {

                var d0=vec3.distance2d(t.v0,t.v1);
                var d1=vec3.distance2d(t.v0,t.v2);
                var flip=d0>d1;

                m.vflip=flip;
                var v=t.line.node.object.points;
                if(!v) v=new Float32Array(6);
                var _v=flip?t.w2:t.w1;
                if(!vec3.compare(_v,t._w,1e-9)) {
                    vec3.cpy(t._w,_v);
                    for(var i=0;i<3;i++) {
                        v[i]=m.pin0[i];
                        v[i+3]=_v[i];
                    }
                }
                t.leader.object.setPoints(v,true);
            }
        }
    }
    return iv.node.prototype.traverse.call(this,ctx,ptm,astate,opacity);
}

iv.node.prototype.traverseMarkup = function(ctx,ptm,astate,opacity)
{
   if(this.state&3)
   {
       var m=this.markup;
       if(m.type>1)
       {
       if(!this.tempInfo)
       {
            this.tempInfo={v0:[],v1:[],flip:false};
            var t=this.tempInfo;
            var n=this.search("label");
             if(n)
             {
                iv.markupInitTraverse(n,"A",t);
                iv.markupInitTraverse(n,"B",t);
                iv.markupInitTraverse(n,"line",t);
             }
           if(m.type==4)
           {
                t.leader=this.search("leader");
                if(t.line && t.line.node){
                    t.line.node.traverse=this.traverseMarkupLeader4;
                    t.line.node.markup=this;
                    t.v2=[];
                    t.w1=[];
                    t.w2=[];
                    t._w=[];
                }
           }
       }

       var t=this.tempInfo;       
       var w=ctx.window;
       ctx.worldToView(m.pin0,t.v0);
       ctx.worldToView(m.label,t.v1);
       
       var flip=t.v0[0]>t.v1[0];

       if(flip!=t.flip)
       {
        t.flip=flip;
        if(flip)
        {
        switch(m.type)
        {
            case 4:{
             iv.markupFlipMatrix(t.A);
             iv.markupFlipMatrix(t.B);
            }break;
            default:{
             iv.markupFlipMatrix(t.A);
             iv.markupFlipMatrix(t.B);
             var l=t.line;
            if(l)
            {
                var neg=mat4.create();
                mat4.identity(neg);
                //mat4.setScale(neg,[-1,0,0]);
                neg[0]=-1;
                var _tm=l.node.enableTM();
                mat4.m(neg,_tm,_tm);
            }}break;
        }}else
        {
            iv.markupRestoreMatrix(t.A);
            iv.markupRestoreMatrix(t.B);
            iv.markupRestoreMatrix(t.line);
        }
       }}}
   return iv.node.prototype.traverse.call(this,ctx,ptm,astate,opacity);
}


iv.initHotspots=function(wnd,onHover)
{

wnd.defSelection=true;
if(onHover)wnd.hotspotsonhover=onHover;

 wnd.addRefTarget(function(a){
	switch(a.code)
	{
	case "dataReady":if(a.wnd.space)a.wnd.hideAllHotSpots();a.wnd.lastHotSpot=null;
                        break;
    case "mousemove":
	{
	  if(a.wnd.lastHotSpotActivation!==undefined)
	 {
	   var d=a.wnd.getTickCount()-a.wnd.lastHotSpotActivation;
	   if(d<400)// prevent transition termination
		a.doDef=false;
	}
	}break;
    case "mousedown":{
                if(a.hit===undefined)a.hit=a.wnd.hitTest(a.x,a.y);
                var type;
            if(a.hit && a.hit.node && (type=a.wnd.isMarkup(a.hit.node)))
                {
                a.wnd.hlMarkup(a.hit.node);
                if(type>1 || a.wnd.hotspotsonhover)a.wnd.activateHotSpotDelay(a.hit.node);
                }else {a.wnd.hlMarkup(null);
                        a.wnd.resetHotSpotDelay();
            }
            }break;
    case "mouseup":{
                if(wnd.deselectHotSpotOnUp)wnd.hideAllHotSpots();
                    }break;
	case "mousehover":{
	          if(a.hit===undefined)a.hit=a.wnd.hitTest(a.x,a.y);
                var type;
			  if(a.hit && a.hit.node && (type=a.wnd.isMarkup(a.hit.node)))
				{
				 a.wnd.hlMarkup(a.hit.node);
                 if(type>1 || a.wnd.hotspotsonhover)a.wnd.activateHotSpotDelay(a.hit.node);
				}else {a.wnd.hlMarkup(null);
                        a.wnd.resetHotSpotDelay();
              }
			  }break;
	}
	}); 

    wnd.hlMarkupImp=function(n,k)
	{
	   var h=n.search("hotspot");
	   if(h && h.tm)mat4.setScale(h.tm,k);
	}
    wnd.hlMarkup=function(n)
	{
	  if(n===this.lastHotSpot)return;
	  if(this.lastHotSpot)  
	{
	    this.hlMarkupImp(this.lastHotSpot,1.0);
	}
	this.lastHotSpot=n;
	if(n)
	{
	this.hlMarkupImp(n,1.2);
	}
	this.invalidate(iv.INV_VERSION);
	}
    wnd.isMarkup=function(n)
    {
      var a=false,b=false;
      while(n)
      {
       if(n.name=="Markup Layer")a=true;
       if(n.hotspot)b=n.hotspot;
       n=n.parent;
      }
     if(a)return b;
    }

wnd.openHotSpotURL=function(n)
{
   if(n.url)
   {
      var _n=n.search("label");
      if(_n && (_n.state&3))
	{
	window.open(n.url,"_self");
	return true;
	};
    }
   return false;
}
wnd.activateHotSpot=function(n)
{
    this.hideAllHotSpots();
    var _n=n.search("label");
    if(_n)_n.state|=3;
    _n=n.search("leader");
    if(_n)_n.state|=3;
    if(n.markup && n.markup.camera){
	this.setView(n.markup.camera,iv.VIEW_TRANSITION|iv.VIEW_ANIM_SET|iv.VIEW_ANIM_PLAY);
	this.lastHotSpotActivation=this.getTickCount();
	}
    else  this.invalidate();
}
wnd.resetHotSpotDelay=function()
{
    if(this.delayedHS)
    {
        clearInterval(this.delayedHS.timer);
        this.delayedHS=null;
    }
}
wnd.checkHotSpotToActivate=function()
{
    if(this.delayedHS)
    {
        this.delayedHS.count++;
        if(this.delayedHS.count>7)
        {
            this.activateHotSpot(this.delayedHS.node);
            this.resetHotSpotDelay();
        }
    }
}
wnd.activateHotSpotDelay=function(n)
{
    if(!this.delayedHS)
    {
        var wnd=this;
        this.delayedHS={node:n,timer:setInterval(function(){wnd.checkHotSpotToActivate();},50),count:0 };
    }else
    {
        if(this.delayedHS.node!=n)
        {
            this.delayedHS.node=n;
            this.delayedHS.count=0;
        }
    }
}

wnd.hideAllHotSpots=function()
{
  var n=this.space.root.search("Markup Layer");
  if(n)n=n.firstChild;
  while(n)
  {
     if(n.hotspot)
     {
     var _n=n.search("label");
     if(_n)_n.state&=~3;
     _n=n.search("leader");
     if(_n)_n.state&=~3; 
      }
     n=n.next;
  }
  this.invalidate();
};
}

