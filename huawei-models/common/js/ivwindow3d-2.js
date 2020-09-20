
iv.window=function (info)//canvas,file,color,path
{
    if(info.canvas){this.canvas=info.canvas;this.canvas.ivwindow=this;this.viewportWidth=this.canvas.width;this.viewportHeight=this.canvas.height;}else {this.canvas=null;this.viewportWidth=0;this.viewportHeight=0;}
    if(info.callback)this.addRefTarget(info.callback);
    this.spaceId=0;
    this.mouseCaptured=false;
    this.mouseCancelPopup=false;
    this.mouseMoved=false;
    this.view=new iv.viewInfo({from:[0,0,6],to:[0,0,0],up:[0,1,0],fov:90});
    this.LY=this.LX=0;
    this.lastTouchDistance = -1;
    this.autoRotate= 0;// &1 - auto rotation on mouse up, &2 0 
    this.orbitMode=0;
    this.cfgButtons=[1,1,0];
    this.bkColor=(info.color!==undefined)?info.color:0x7f7f7f;
    this.initHardware();
    this.vpVersion=0;
    this.cfgMinDistance=1e-6;this.cfgMaxDistance=1e8;
    this.textures=[];
    this.clrSelection=[1,0,0,0.5,1,1];    
       
    this.cfgMouseWheel=2;

    this.handler=null;
    this.m_undo=null;
    this.m_undovp=null;
    this.objEditorMode=0;
    this.objEditorAxis=1;
    this.cfgSelOnDown=true;

    iv.initHotspots(this);
    this.timer=false;
    if(this.gl)
    {
	    if(info.file)this.load(info.file,info);else this.space=null;
	    this.gl.enable(this.gl.DEPTH_TEST);
	    this.initHandlers();
	    this.initEvents();
	    this.invalidate();
    }
    if(window.performance && window.performance.now)
	    this.getTickCount= function(){return window.performance.now();};  else	this.getTickCount= function(){var d = new Date();var time = d.getTime();return time;};
    this.rcontext=new iv.rcontext(this);
    this.layer=null;
}

iv.window.prototype.setViewSize=function(w,h){
    var c=this.canvas;
    if(w&&h&&c) {
        c.height=h;c.width=w;
        if((this.viewportHeight!=h)||(this.viewportWidth!=w)) {
            this.viewportHeight=h;this.viewportWidth=w;
            this.invalidate(iv.INV_VERSION);
        }
    }
}

iv.window.prototype.initHandlers=function()
{   
    var w=this;
    var i={move:function(event) { return w._onMouseMove(event); },down:function(event) { return w.onMouseDown(event,false); },up:function(event) { return w.onMouseUp(event,false); },
    dbl:function(event) { return w._onDblClick(event); },
    touchstart:function(event) { return w.onMouseDown(event,true);},
    touchcancel:function(event) { return w.onTouchCancel(event);},
    touchend:function(event) { return w.onMouseUp(event);},
    touchmove:function(event) { return w.onTouchMove(event);},
    pointerdown:function(event) { return w.onPointerDown(event);},
    pointerup:function(event) { return w.onPointerUp(event);},
    pointermove:function(event) { return w.onPointerMove(event);},
    lostcapture :function(event) { return w.onLostCapture(event);},
    menu:function(event){return w._onContextMenu(event);},
    wheel:function(event){w.onMouseWheel(event);},
    a:function(){w.animate();}};
    this.input=i;
}
iv.window.prototype.initEvents=function()
{   
	var w=(/Firefox/i.test(navigator.userAgent))?"DOMMouseScroll":"mousewheel",c=this.canvas,i=this.input;
	this.setEvent(c,w,i.wheel);
	this.setEvent(c,"contextmenu",i.menu);	
	this.setEvent(c,"selectstart",function(){return false;});// Chrome/FF
    if (window.PointerEvent && navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && this.canvas.setPointerCapture)//>1 was here
    {
        this.pointers=[];
        this.setEvent(c,"pointerdown",i.pointerdown);
        this.setEvent(c,"pointermove",i.pointermove);
        this.setEvent(c,"pointerup",i.pointerup);
        this.setEvent(c,"lostpointercapture",i.lostcapture)
    }else
    {
	this.setEvent(c,"mousedown",i.down);
	this.setEvent(c,"mousemove",i.move);
	this.setEvent(c,"dblclick",i.dbl);	
	this.setEvent(c,"touchstart",i.touchstart);
    }
}
iv.window.prototype.releaseCapture=function()
{
	if(this.mouseCaptured)
	{
		var e=this.canvas,i=this.input;
		if(e.releaseCapture)e.releaseCapture();
		else
		{
			e=document;
			this.delEvent(e,"mousemove",i.move);
			this.delEvent(e,"contextmenu",i.menu);
		}
		this.delEvent(e,"mouseup",i.up);
		this.delEvent(e,"touchmove", i.touchmove);
		this.delEvent(e,"touchend", i.touchend);
		this.delEvent(e,"touchcancel", i.touchcancel);
		this.mouseCaptured=false;
	}
}
iv.window.prototype.setCapture=function()
{
	if(!this.mouseCaptured)
	{
		var e=this.canvas,i=this.input;
		if(e.setCapture)e.setCapture();else
		{
			e=document;
			this.setEvent(e,"mousemove",i.move);        
			this.setEvent(e,"contextmenu",i.menu);
		}
		this.setEvent(e,"mouseup",i.up);
		this.setEvent(e,"touchmove", i.touchmove);
		this.setEvent(e,"touchend", i.touchend);
		this.setEvent(e,"touchcancel", i.touchcancel);
		this.mouseCaptured=true;
	}
}
iv.window.prototype.notify=function(a,b,def)
{
    var _i=this.refTargets;
    if(_i){
    b=b||{};
    b.code=a;
    b.wnd=this;
    if(def)b.doDef=true;
    for(var i=0;i<_i.length;i++)_i[i](b);
    return !def || b.doDef;
    }
    return true;
}
iv.window.prototype.removeRefTarget=function(f)
{
    if(this.refTargets)
    {
        var i=iv.indexOf(this.refTargets,f);
        if(i>=0)
        {
            if(this.refTargets.length==1)this.refTargets=null;
            else this.refTargets.splice(i,1);
            return true;
        }
    }
    return false;
}
iv.window.prototype.addRefTarget=function(f)
{
    if(!f)return false;
    if(this.refTargets)
    {
        if(iv.indexOf(this.refTargets,f)>=0)return false;
        this.refTargets.push(f);
    }else this.refTargets=[f];
    return true;
}
iv.window.prototype.delEvent=function(d,e,f)
{
	if (d.detachEvent) //if IE (and Opera depending on user setting)
		d.detachEvent("on"+e, f);
	else if (d.removeEventListener) //WC3 browsers
		d.removeEventListener(e, f);
}

iv.window.prototype.setEvent=function(d,e,f)
{
	if (d.attachEvent) //if IE (and Opera depending on user setting)
		d.attachEvent("on"+e, f);
	else if (d.addEventListener) //WC3 browsers
		d.addEventListener(e, f);
}
iv.window.prototype.initHardware = function()
{
    var r=null;
    if(window.requestAnimationFrame)r=window.requestAnimationFrame;else
    if(window.webkitRequestAnimationFrame)r=window.webkitRequestAnimationFrame;else
    if(window.mozRequestAnimationFrame)r=window.mozRequestAnimationFrame;else
    r =function(callback) {window.setTimeout(callback,1000/60)};
    this.requestAnimFrame=r;
	var n = ["webgl","experimental-webgl","webkit-3d","moz-webgl"],cfg={alpha:false};

    if(this.bkColor===null){cfg.alpha=true;cfg.premultipliedAlpha= true};

	for (var i=0;i<n.length;i++) 
	{
		try {
			this.gl = this.canvas.getContext(n[i],cfg);
		}catch (e) {   }
		if(this.gl)break;
	}
	if (!this.gl) this.notify("error",{type:"hardware",info:"Could not initialise WebGL"});
	return this.gl!=null;
}


iv.window.prototype.undoVp =function(name)
{
  if(this.m_undovp)
 {
	 var u=this.m_undovp;
		if(u.open()){
			u.add(new iv.undo.vp(this));
			u.accept(name);
		}
 }
}


iv.viewInfo=function(v)
{
	this.from=[];
	this.to=[];
	this.up=[]; 
    this.ortho=false;
    this.scale=1;
	this.update(v);
    
}

iv.viewInfo.prototype.update=function(f,t,u) {
	if(f){
		if(t) {
			vec3.cpy(this.from,f);
			vec3.cpy(this.to,t);
			vec3.cpy(this.up,u);
		} else {
			vec3.cpy(this.from,f.from);
			vec3.cpy(this.to,f.to);
			vec3.cpy(this.up,f.up);
            if(f.ortho){this.scale=f.scale;this.ortho=true;}
            else
            if(f.fov)this.fov=f.fov;
            this.camera=f.camera||null;
		}}
}


iv.viewInfo.prototype.getUpVector=function (v)
{
	return vec3.subtract(this.up,this.from,v||[]);
}

iv.viewInfo.prototype.getViewVector=function (v){return vec3.subtract(this.to,this.from,v||[]);}
iv.viewInfo.prototype.getViewVectorN=function (v){return vec3.subtractN(this.to,this.from,v||[]);}
iv.viewInfo.prototype.compare=function (v){return (vec3.compare(this.from,v.from,1e-6)&&vec3.compare(this.to,v.to,1e-6)&&vec3.compare(this.up,v.up,1e-6));}

iv.window.prototype.getView =function(i)
{
	if(i)i.update(this.view);
	else i=new iv.viewInfo(this.view);
	return i;
}

iv.transitionView=function(wnd,view,flags)
{
    this.transition=iv.easeInOut;
    this.type="view";
    this.wnd=wnd;
    this.old=wnd.getView();    
    this.target=view;
    this.current=new iv.viewInfo(null);
    if(flags)this.flags=flags;
    this.duration=600;
    this.tm=[];
    this.prepare(view);
    this.prepare(this.old);
    this._dir=[0,0,-1];
    this._up=[0,1,0];
}

iv.transitionView.prototype.calcQ=function(a1,a0,b1,b0,up)
{   
    var _a=vec3.sub_r(a1,a0),_b=vec3.sub_r(b1,b0),la=vec3.length(_a),lb=vec3.length(_b);
    var a=vec3.scale(_a,1/la,[]),b=vec3.scale(_b,1/lb,[]),r={l0:la,l1:lb,a:a,b:b},ac=vec3.dot(a,b),d=0.9999;
    if((ac<-d) && up)
    {
        r.axis=up.slice();
        r.angle=Math.PI;
    }else{
    if((ac<d)&&(ac>-d))
	{
    	r.angle=Math.acos(ac);
	    r.axis=vec3.cross(a,b,[]);
  	}else
	{
	vec3.cpy(r.a,_a);vec3.cpy(r.b,_b);
	}
    }
    return r;
}

iv.transitionView.prototype.detach=function(wnd,f)
{
    if(f && this.flags && this.target.anim){
        f=wnd._playFavAnimation(this.target,(this.flags&(iv.VIEW_ANIM_SET|iv.VIEW_ANIM_PLAY)) );
        if(f&iv.VIEW_INVALIDATE)wnd.invalidate();
    }

}

iv.transitionView.prototype.prepare=function(v)
{
    v._dir=vec3.subtract(v.to,v.from,[]);
    v._dirLen=vec3.length(v._dir);
    v._up=vec3.subtract(v.up,v.from,[]);
    v._upLen=vec3.length(v._up);
    if(v._dirLen)vec3.scale(v._dir,1/v._dirLen);
    if(v._upLen)vec3.scale(v._up,1/v._upLen);

    var _from=[0,0,0];
    var tm=mat4.lookAt(_from,v._dir,v._up,[]);    
    mat4.invert(tm,tm);
    v._Q=quat.fromMat4([],tm);
}

iv.transitionView.prototype.animate=function(k)
{  
    var c=this.current,t=this.target,o=this.old,_k=1-k;
    if(k>0.999)
    {
        k=1;_k=0;
        vec3.cpy(c.from,t.from);
        vec3.cpy(c.to,t.to);
        vec3.cpy(c.up,t.up);
    }else{
        vec3.lerp_ip(o.to,t.to,k,c.to);
        var q=[],upL=t._upLen*k+o._upLen*_k,dirL=t._dirLen*k+o._dirLen*_k;
        quat.slerp(q,o._Q,t._Q,k);
        mat4.fromQuat(this.tm,q);
        mat4.mulVector(this.tm,this._dir,c.from);
        mat4.mulVector(this.tm,this._up,c.up);
        vec3.scale(c.from,-dirL);
        vec3.scale(c.up,upL);
        vec3.add(c.from,c.to);
        vec3.add(c.up,c.from);
    }
    this.wnd.setView(c);
    return 7;
}

iv.window.prototype.isOrtho=function()
{
    if(this.view && this.view.ortho)return true;
    return false;
}
iv.window.prototype.setOrtho=function(b)
{
    var v=this.view;
    if(v.ortho==b)return false;
    var l=vec3.distance(v.from,v.to);
    if(b){
	    v.scale= 1.0/(l*Math.tan(Math.PI*v.fov/(360)));
    }else
    {
	    l*=v.scale;
	    if(l>1e-6)
	    {
	        v.fov=Math.atan(1/l)*360/Math.PI;
	    }
    }
    v.ortho=b;
    this.invalidate(iv.INV_VERSION);
    return true;
};

iv.window.prototype._playFavAnimation =function(v,flags)
{
    if(v.anim && this.space && (flags&(iv.VIEW_ANIM_SET|iv.VIEW_ANIM_PLAY)))
    {
        var _a=v.anim,s=this.space,a=s.getAnimation(_a.id);
        if(a)
        {
            s.activateAnimation(a,true);
            if(flags&iv.VIEW_ANIM_PLAY){
                var d={from:iv.any(_a.start,a.start),to:iv.any(_a.end,a.end)};
                if(_a.delayStart)d.delayStart=_a.delayStart;
                if(_a.delayEnd)d.delayEnd=_a.delayEnd;
		if(d.from!=d.to){
                	this.addAnimation(new iv.anim.node(s,d));
			return 0;
			}else s.setTime(d.from);
            }else  s.setTime(a.start);
	   return iv.VIEW_INVALIDATE;
        }
    }
    return 0;
}

iv.window.prototype._cmpViews =function(V,v)
{
   if(v.from && v.to && v.up)
   { 
    if(V.compare(v))
	{
        if(v.fov){
			if( V.fov==v.fov && !V.ortho)return false;
		}else
    	if(v.scale)
		{
		if(V.scale==v.scale && this.ortho)return false;
		}
		else return false;
	}
   }
    return true;
}

iv.window.prototype.setView =function(V,flags)
{   
   if(!V)return;
   var v=new iv.viewInfo(V);

   if(V.anim)v.anim=V.anim;
    var _dir=[],_up=v.getUpVector();
	vec3.subtractN(v.to,v.from,_dir);
	var _dot=vec3.dot(_dir,_up);
	if(Math.abs(_dot)>1e-5)
	{
		var a2=[],a1=[];
		vec3.crossN(_dir,_up,a2);
		vec3.crossN(_dir,a2,a1);
		_dot=vec3.dot(_up,a1);
		if(_dot<0)vec3.scale(a1,-1);
		vec3.add(v.from,a1,v.up);
	}    
   if(flags===undefined)flags=0;
   V=this.view;
    if(this._cmpViews(V,v))
    {
    

    if(flags&iv.VIEW_UNDO)this.undoVp("View");


    if(flags&iv.VIEW_TRANSITION)
    {
        this.stopAR();
        this.removeAnimationType("view",true);
        this.addAnimation(new iv.transitionView(this,v,flags));
        return ;
    }
    V.update(v);
    }

    flags|=this._playFavAnimation(v,flags);

    if(flags&iv.VIEW_INVALIDATE)
            this.invalidate(iv.INV_VERSION);
}

iv.window.prototype.setDefView =function(flags)
{
	this.stopAR();
    if(flags===undefined)flags=iv.VIEW_INVALIDATE;
	this.setView(this.space.view,flags);
}


iv.window.prototype.unload=function()
{
    if(this.m_undo)this.m_undo=null;
    if(this.space)
    {
        var s=this.space,i;
        if(s.materials){
        for(i=0;i<s.materials.length;i++)s.materials[i].invalidate(); 
        s.materials=null;
        }
        if(s.root){s.root.release();s.root=null;}
        var _i=this.textures;        
        for(i=0;i<_i.length;i++)this.gl.deleteTexture(_i[i]);        
	    this.textures=[];
        this.space=null;
    }
}
iv.cloneNode=function(parent,node,params)
{
	var n=parent.newNode();
	if(node.object)
		n.setObject(node.object);		
	if(node.material)n.material=node.material		
	n.name=node.name;
	if(node.bbaxis)// billboard stuff
	{
	n.bbtm = mat4.create();
	n.bbaxis=node.bbaxis.slice();
	n.traverse=node.traverse;
	if(node.bbaxisDir)
	n.bbaxisDir=node.bbaxisDir.slice();
	}
	if(node.anim)
		n.anim=node.anim;

	if(node.tm)
		mat4.copy(node.tm,n.enableTM(true));

	n.state=node.state;
	var _n=node.firstChild;
	while(_n)
	{
		iv.cloneNode(n,_n,params);
		_n=_n.next;
	}
	return n;
}

iv.window.prototype._loadCallback=function(info,r)
{
    var s=info.space;
    if(!info.merge) {
        if(this.space) this.unload();
        this.space=s;

    }
    if(info.ext=='IV3D') s.loadBin(r.response);
    else s.load(JSON.parse(r.responseText));
    
    var notify={space:s,file: info.file};
    if(info.iid)
        notify.iid=info.iid;
    var code,g=null;
    if(info.merge) {
        g=this.space.merge(info.space);
        if(g)
            code="merged";
    } else {
        if(info.zoom)this.setDefView();
        
        code="dataReady";
    }
    
    if(info.nonotify)code=0;
    if(info.resource)
    {
        info.resource.node=g;
        g.addRef();
        g.parent.remove(g);
        if(info.parent){
            var _g=iv.cloneNode(info.parent,g);
            if(info.callback)info.callback(_g);
        }
    }  
    if(code)
    {
        if(g){
            g.file=info.file;
            notify.group=g;
        }
        this.notify(code,notify);
    }
    this.invalidate();
}


function createCORSRequest(method, url){
    var xhr = new XMLHttpRequest();
    if("withCredentials" in xhr){
        //检查XHLHttpRequest对象是否有"withCredentials"属性
        //"withCredentials"属性仅存在于XMLHttpReqeust2对象中
        xhr.open(method, url, true);
    }else if(typeof XDomainRequest !="undefined"){
        //否则，检查XDomainRequest
        //XDomainRequest仅存在IE中，且通过其发起CORS请求
        xhr = new XDomainRequest();
        xhr.open(method, url);
    }else{
        //否则，CORS不被该浏览器支持
        xhr = null;
    }
    // xhr.responseType='json'
    return xhr;
}

iv.window.prototype.load=function (file,d)
{ 
	var s=new iv.space(this,this.gl),w=this;
	if(d && d.path)s.path=d.path;
	var r = iv.createRequest(file,s.path),ext;
    if(d && d.type)ext=d.type;else ext = file.substr(file.lastIndexOf('.') + 1);
    ext=ext.toUpperCase();

    if(ext=='IV3D'){r.responseType = "arraybuffer";r.onprogress= function (e){if (e.lengthComputable)w.notify("progress",{loaded:e.loaded,total:e.total});} };

    var _info={file:file,space:s,ext:ext};//,zoom:true,merge:false
    if(d){
    _info.merge=!!d.merge;
    if(d.resource)_info.resource=d.resource;
    if(d.iid)_info.iid=d.iid;
    if(d.callback)_info.callback=d.callback;
    if(d.parent)_info.parent=d.parent;
    if(d.zoom!=undefined){_info.zoom=d.zoom;}else _info.zoom=!_info.merge;
    }else{_info.merge=false;_info.zoom=true;}
    _info.file=file;
    var v=this;
    var xhr = createCORSRequest('GET', file);
    if(!xhr){
        throw new Error('CORS not supported');    
    }
    xhr.onreadystatechange = function () {
            
            if (this.readyState == 4 && this.status==200) {
                v._loadCallback(_info,this);
            }
    }

xhr.send();
}

iv.window.prototype.getDoubleSided = function(){return this.space?this.space.cfgDbl:false;}
iv.window.prototype.setDoubleSided = function(b){if(this.space.cfgDbl!=b){var s=this.space;s.cfgDbl=b;s.invalidate();}}
iv.window.prototype.getMaterials= function(){return this.space?(this.space.cfgDefMtl==null):false;}
iv.window.prototype.setMaterials= function(b)
{
	var s=this.space;
	if(b)
	{
		if(s.cfgDefMtl){
            s.cfgDefMtl.clear();
            s.cfgDefMtl=null;this.invalidate();
        }
	}else{
		if(!s.cfgDefMtl)
		{
			var m=new iv.material(s);
			m.load({"diffuse":0xcccccc,"specular":0x808080,"ambient":0x050505,"phong":25.6});
			s.cfgDefMtl=m;
			this.invalidate();
		};
	}
};

iv.window.prototype.getTextures = function(){return this.space?this.space.cfgTextures:false;}
iv.window.prototype.setTextures = function(b){if(this.space && this.space.cfgTextures!=b){this.space.cfgTextures=b;this.invalidate();}}
iv.window.prototype.setLights=function(l)
{
    var s=this.space;
    if(!s)return false;
    if(l){
        s.lights=l;
        s.stdLights=true;
    }else
    {
        s.lights=[];
        s.stdLights=false;
    }
    this.invalidate(iv.INV_MTLS);
}

iv.window.prototype.selectObjectsImp=function(down)
{
    if(!this.space)return;
	var I=this.mouseUpInfo,n=I.node;	

        var old=this.space.selNode,doDef=true;
	if(I.shift)doDef=!this.space.selectRange(old,n);
        if(doDef){
            if(I.ctrl||n){
                var bSelect=true;
                if(I.ctrl&&n&&n.state&4) bSelect=false;
                this.space.select(n,bSelect,I.ctrl);
            }else {
		if(old){
		 if(down)
			I.deselect=true;
		else
		{
		if(I.deselect)
                 	this.space.select(null,false,false);
		}
		}
	}
        }
}

iv.window.prototype.handleObjSelect_down=function(x,y,event)
{
    this.mouseUpInfo=null;
    var h=this.hitTest(x,y);
    this.mouseMoved=false;var n=h?h.node:null;
    var bCtrl=(event.ctrlKey==1);
    var i={node:n,hitInfo:h,x:x,y:y};
    if(this.notify("mousedown",i,true))
    {
        this.mouseUpInfo={h:h,node:i.node,ctrl:bCtrl,shift:event.shiftKey};
        if(this.cfgSelOnDown)
	{
          this.selectObjectsImp(true);
	    this.mouseUpInfo.node=null;
	}else this.mouseUpInfo.deselect=true;
    }
    if(i.handler)h.handler=i.handler;
    return h;
}
iv.window.prototype.handleObjSelect_up=function(x,y)
{
    var i={x:x,y:y};
    i=this.notify("mouseup",i,true);
    if(this.mouseUpInfo && i)this.selectObjectsImp(false);   
    this.mouseUpInfo=null;
}

iv.window.prototype.handleObjSelect=function(x,y,event,bDown) {
    if(bDown)return this.handleObjSelect_down(x,y,event);
     else this.handleObjSelect_up(x,y);
    return null;
}


iv.window.prototype.onMouseUp=function(event,touch)
{	
    var ar=this.commonMouseUp1(), e=event;
	if(touch){
		if(event.touches.length)
			e=event.touches[0];
		else e=null;
	}
	var p=this.getClientPoint(e,touch);
    p.b=1;
    if(!touch && (event.button!==undefined))p.b=1<<event.button;    
    this.commonMouseUp2(p,event,ar);
	this.releaseCapture();
};
iv.window.prototype.commonMouseUp1=function() {
    var a=this.last;
    var ar=this.autoRotate;
    if(a) {
        if(ar&1) {
            var dt=this.getTickCount()-a.t;
            if(dt<200) { this.removeAnimationType("view"); this.addAnimation(new iv.anim.spin(this,dt)); ar=0; }
        }
        this.last=null;
    }
	return ar;
}

iv.window.prototype.commonMouseUp2=function(p,event,ar)
{

    var flags=3;
	if(this.handler)flags=this.handler.onMouseUp(p,event);
	if((!this.mouseMoved) && (flags&1) && p.b==1)this.handleObjSelect(this.LX,this.LY,event,false);
    this.onHandler(flags);
   
}
iv.window.prototype.getTouchDistance=function(touches)
{
	var dx=touches[0].clientX-touches[1].clientX,dy=touches[0].clientY-touches[1].clientY;
	return Math.sqrt(dx*dx+dy*dy);
}

iv.window.prototype.getClientPoint=function (e,touch)
{
	var r=this.canvas.getBoundingClientRect();
	var x,y;
	if(e){
        x = e.clientX;y = e.clientY;
		if(touch && e.touches)
        {
            var l=e.touches.length;
            if(l){
            var _e=e.touches[0];
            x = _e.clientX;y = _e.clientY;
            if(l>1)
            {
                for(var j=1;j<l;j++)
                {
                    _e=e.touches[j];
                    x+=_e.clientX;
                    y+=_e.clientY;
                }
                x/=l;
                y/=l;
            }
            }
        }   
		x -= r.left;y -= r.top;
	}else {x = this.LX;y = this.LY;}
	return {x:x,y:y,r:r}
}
iv.window.prototype.decodeButtons=function(e,bt)
{
	var btn=0;
	if(bt && e.touches!=undefined)
	{
		if(e.touches.length>=3)return 4;// pan
		return 1;
	}
	if(e.buttons===undefined)
	{
		// chrome stuff
		if(e.which==1)btn=1;
		else
		if(e.which==2)btn=4;
		else
		if(e.which==3)btn=2;
		else btn=1;// just in case
	}else btn=e.buttons;// IE and Mozila
	return btn;
}

iv.window.prototype.pd=function(e){if(e && e.preventDefault)e.preventDefault();}
iv.window.prototype._onContextMenu=function(event)
{
	this.pd(event);
	if(this.mouseCancelPopup&& this.mouseMoved)
	{   
        event.stopPropagation();
		this.mouseCancelPopup=false;return false;
	}
	if(this.onContextMenu)this.onContextMenu(event);
	return true;
}

iv.window.prototype._onDblClick=function(event) {
	if(this.onDblClick)this.onDblClick(event,false);
	this.pd(event);
	event.stopPropagation();
	return true;
}

iv.window.prototype.onTouchMove=function(event) 
{   
    var p=this.getClientPoint(event,true),t=event.touches;
	this.onMouseMove(event,p,t&&t.length>1?t:null,1);
	this.pd(event);
	return false;
}

iv.window.prototype.onTouchCancel=function (event)
{
	this.onMouseUp(event,true);
	if(event.cancelable)this.pd(event);
}

iv.window.prototype._onMouseMove=function(event) {
	if (this.mouseCaptured){
        var b=this.decodeButtons(event,false);
        if(b) {
            var p=this.getClientPoint(event,false);
            this.onMouseMove(event,p,null,b);
        }
		else this.onMouseUp(event,false);
		this.pd(event);
		event.stopPropagation();
		return true;
	}
		else  {
        var p=this.getClientPoint(event,false); p.b=0;
        this._onMouseHover(event,p);
    }
	return false;
}
iv.window.prototype._onMouseHover=function(event,p) 
{
        if(this.handler && this.handler.onMouseHover){
            if(!this.onHandler(this.handler.onMouseHover(p,event)))
                return false;
        }
        if(this.onMouseHover)this.onMouseHover(event,p);
}
iv.window.prototype.onMouseHover=function(event,p)
{
    this.notify("mousehover",p);
}

iv.window.prototype.setHandler=function(h)
{
    var flags=0;
    var a=this.handler;
    if(a && a.detach)flags|=a.detach(this);
    this.handler=h?h:null;
    return flags;
}

// pointer support


iv.window.prototype.getPointer=function(id,create)
{
    var _i=this.pointers,e,i;
    for(i=0;i<_i.length;i++)
    {
        e=_i[i];
        if(e.id==id)return e;
    }
    if(create){_i.push(e={id:id});return e;}
    return null;
}
iv.window.prototype.deletePointer=function(id)
{
    var _i=this.pointers,e,i;
    for(i=0;i<_i.length;i++)
    {
        e=_i[i];
        if(e.id==id){_i.splice(i);return true;}
    }
    return false;
}

iv.window.prototype.decodeButtonsPointer=function(event)
{
     if(event.pointerType=='mouse')
    {
        return this.decodeButtons(event,false);
    }else return 1;    
}

iv.window.prototype.onPointerDown=function(event)
{   
    var p=this.getClientPoint(event),id=event.pointerId;
    p.b=this.decodeButtonsPointer(event);
   
    
    var ptr=this.getPointer(id,true);
    ptr.clientX=p.x;ptr.clientY=p.y;
    if(this.pointers.length==1)
    {
        this.last={x:0,y:0,t:0};
	    this.lastTouchDistance=-1;
        if(this.commonMouseDown1(p,event))
        {
            this.canvas.setPointerCapture(id);
            this.commonMouseDown2(p,event);
        }
    }
}

iv.window.prototype.onPointerUp=function(event)
{
    this.pd(event);
    event.stopPropagation();
    
    if(event.pointerId){
        this.deletePointer(event.pointerId);
        this.canvas.releasePointerCapture(event.pointerId);
    }else this.pointers=[];
        
    if(!this.pointers.length)
    {
        this.commonMouseUp1();
        var p=this.getClientPoint(event);
        p.b=this.decodeButtonsPointer(event);
        this.commonMouseUp2(p,event);    
    }
}
iv.window.prototype.onLostCapture=function(event)
{
    if(event.pointerId)this.deletePointer(event.pointerId);
    var _i=this.pointers,e,i;
    for(i=0;i<_i.length;i++)
        this.canvas.releasePointerCapture(_i[i].id);
    this.pointers=[];
    this.commonMouseUp1();
    this.commonMouseUp2({x:10,y:10,b:1},event);    
}

iv.window.prototype.onPointerMove=function(event)
{
    this.pd(event);
    event.stopPropagation();    
    var p=this.getClientPoint(event);
    var ptr=this.getPointer(event.pointerId,false);
    if(ptr)
    {
        ptr.clientX=p.x;
        ptr.clientY=p.y;
    }

    if(this.pointers.length){
        var ptr=this.pointers[0];
        this.onMouseMove(event,{x:ptr.clientX,y:ptr.clientY},this.pointers.length>1?this.pointers:null,this.decodeButtonsPointer(event));
    }
    else {
        p.b=0;
        this._onMouseHover(event,p);
    }

}
iv.window.prototype.onMouseDown=function(event,touch)
{   
	this.last={x:0,y:0,t:0};
	this.lastTouchDistance=-1;
	if(touch)
	{	
		if(event.touches.length>1){
            this.setHandler(null);
			this.lastTouchDistance=this.getTouchDistance(event.touches);
        }
	}
	var p=this.getClientPoint(event,touch);
    p.b= this.decodeButtons(event,touch);

    if(this.commonMouseDown1(p,event))
    {
	    this.setCapture();
        this.commonMouseDown2(p,event);
    }
}
iv.window.prototype.commonMouseDown1=function(p,event)
{
    this.pd(event);
    event.stopPropagation();

        if(this.handler){
        if(!this.onHandler(this.handler.onMouseDown(p,event)))
            return false;
        }
    return true;
}

iv.window.prototype.commonMouseDown2=function(p,event)
{
    this.stopAR();
	this.LX=p.x;
	this.LY=p.y;
	this.mouseMoved=false;

    var handler=null;
	if(p.b&1){p.hit=this.handleObjSelect(p.x,p.y,event,true);if(p.hit && p.hit.handler)handler=p.hit.handler;}
	if(!handler && this.getHandler)handler=this.getHandler(p,event);
    this.setHandler(handler);
	if(this.handler)this.onHandler(this.handler.onMouseDown(p,event));
}


iv.window.prototype.onMouseMove=function (event,p,touches,b)
{   
    if(!this.notify("mousemove",{x:p.x,y:p.y,b:b},true))return;
    var dX=p.x-this.LX,dY=p.y-this.LY,mv=(dX!=0)|| Math.abs(dY!=0),flags=3;
    if(mv)this.removeAnimationType("view",true);
	if(touches)
	{
			var d=this.getTouchDistance(touches);
            if(!this.mouseMoved)this.undoVp("Zoom or Pan");

			if(this.lastTouchDistance!=d)
			{
				if(this.lastTouchDistance>0)
				{
					var _d=(this.lastTouchDistance-d)/2.0;
					this.doDolly(_d,_d);
					flags|=8;
				}
				this.lastTouchDistance=d;
			}
            if(mv){this.doPan(dX,dY);flags|=8;}			
	}else{
	if(this.mouseMoved||mv)
	{
		p.b=b;

		if(this.handler)flags=this.handler.onMouseMove(p,event);
		if(flags&1)
		{

         switch(b)
         {
         case 1:b=this.cfgButtons[0];break;
         case 2:b=this.cfgButtons[1];this.mouseCancelPopup=true;break;
         case 4:b=this.cfgButtons[2];break;
         default:b=0;
         }

		switch(b)
        {
        case 1:if(!this.mouseMoved)this.undoVp("Orbit");
				this.addIR(dX,dY,1);this.doOrbit(dX,dY);flags|=8;
			break;
        case 2:if(!this.mouseMoved)this.undoVp("Zoom via Dolly");
				if(!this.doDolly(dX,dY))return;
				flags|=8;
               break;
        case 3:if(!this.mouseMoved)this.undoVp("Zoom via FOV");
				if(!this.doFOV(dX,dY))return;
				flags|=8;
               break;
        case 4:if(!this.mouseMoved)this.undoVp("Pan");this.doPan(dX,dY);flags|=8;break;
        //case 5:if(this.doLook){ if(!this.mouseMoved)this.undoVp("Look");this.doLook(dX,dY);flags|=8;} 
        }
			

		}

	}
    }
	this.onHandler(flags);
	this.LX=p.x;this.LY=p.y;
	if(mv && !this.mouseMoved)this.mouseMoved=true;
}

iv.window.prototype.addIR=function(dX,dY,m)
{
    var a=this.last;if(a){a.x=dX+a.x/2;a.y=dY+a.y/2;var t=this.getTickCount();a.dt=t-a.t;a.t=t;a.mode=m;}
}

iv.window.prototype.onHandler=function(flags)
{
    var invF=0;

    if(flags&4)flags|=this.setHandler(null);

    if(flags&8){flags|=2;invF=iv.INV_VERSION;}
	if(flags&2)this.invalidate(invF);
    return (flags&1)?true:false;
}


iv.window.prototype.onMouseWheel=function(event)
{
	var d;
	if(event.wheelDelta!=undefined)d=event.wheelDelta/-10;
	else
		if(event.detail!=undefined){
			d=event.detail;
			if(d>10)d=10;else if(d<-10)d=-10;
			d*=4;
		}

	if(this.m_undovp)
	{
		var u=this.m_undovp;
		var name="Mouse Wheel";
		if(u.canRedo() || u.getLastUndoDescription()!=name && u.open())
		{
			u.add(new iv.undo.vp(this));
			u.accept(name);
		}
	}
    switch(this.cfgMouseWheel)
    {
        case 2:this.doDolly(0,d);break;
        case 3:this.doFOV(0,d);break;
    }
	

	this.invalidate(iv.INV_VERSION);
	this.pd(event);
}

iv.window.prototype.doPan=function(dX,dY)
{
    var i={type:"pan",dX:dX,dY:dY};
    if(this.notify("camera",i,true)){
	var v=this.getView();	
	var x0=this.viewportWidth/2,y0=this.viewportHeight/2;
	var r0=this.getRay(x0,y0),r1=this.getRay(x0-i.dX,y0-i.dY);
	var d=[r1[3]-r0[3],r1[4]-r0[4],r1[5]-r0[5]];
	vec3.add_ip(v.from,d);
	vec3.add_ip(v.up,d);
	vec3.add_ip(v.to,d);    
	this.setView(v);
    }
}

iv.window.prototype.doOrbit=function(dX,dY)
{
   dY = dY/3;
    var v=this.getView(),tm=[];
    var i={type:"orbit",dX:dX,dY:dY,center:v.to.slice()};
    if(this.notify("camera",i)){
        dX=i.dX;dY=i.dY;
        
        var _u=v.getUpVector();
        if(dX && this.orbitMode)
        {
            mat4.identity(tm);
            mat4.rotateAxisOrg(tm,i.center,_u,-dX/200.0);
            mat4.mulPoint(tm,v.to);
            mat4.mulPoint(tm,v.from);
            mat4.mulPoint(tm,v.up);
            dX=0;
        }
        if(dY)
        {	
            vec3.normalize(_u);
            var _d=v.getViewVectorN();
            var _axis=vec3.cross(_d,_u,[]);
            mat4.identity(tm);
            var angle=dY/200.0;
                    
            if(this.cfgMaxVAngle!=undefined){
                var viewAngle=Math.acos(Math.max(Math.min(vec3.dot(_d,[0,0,-1]),1),-1));
                var max=(90-this.cfgMinVAngle)*Math.PI/180,min=(90-this.cfgMaxVAngle)*Math.PI/180;
                if((viewAngle-angle)>max)
                    angle=viewAngle-max;
                else
                    if((viewAngle-angle)<min)
                        angle=viewAngle-min;
            }
            mat4.rotateAxisOrg(tm,i.center,_axis,-angle);
             mat4.mulPoint(tm,v.to);
             mat4.mulPoint(tm,v.from);
             mat4.mulPoint(tm,v.up);
        }
        if(dX)
        {
             _u=[1,0,0];
            mat4.identity(tm);
            mat4.rotateAxisOrg(tm,i.center,_u,-dX/200.0);
            mat4.mulPoint(tm,v.to);
            mat4.mulPoint(tm,v.from);
            mat4.mulPoint(tm,v.up);
        }
        this.setView(v);
    }
}

iv.window.prototype.doDolly=function(dX,dY)
{
    var i={type:"dolly",dX:dX,dY:dY},v=this.getView();
    if(v.ortho)
    {
        var k=1.0+(dY/100);
        if(k<1e-1000)k=1e-1000;
        i.scale=v.scale/k;
        if(!this.notify("camera",i,true))return false;
        v.scale=i.scale;
    }else{
        var dir=vec3.sub_r(v.from,v.to);
        var l=vec3.length(dir);
        i.len=Math.min(Math.max(l+l*dY/100,this.cfgMinDistance),this.cfgMaxDistance);
        if(!this.notify("camera",i,true))return false;
        vec3.scale_ip(dir,i.len/l);
        var delta=vec3.sub_r(vec3.add_r(v.to,dir),v.from);
        vec3.add_ip(v.from,delta);
        vec3.add_ip(v.up,delta);        
    }
    this.setView(v);
    return true;
}

iv.window.prototype.doFOV=function(dX,dY)
{
    var V=this.view;
    var i={type:"fov",dX:dX,dY:dY,fov:Math.min(Math.max(V.fov+dY/8,1),175)};
    if((i.fov!=V.fov)&&this.notify("camera",i,true))
    {
        V.fov=i.fov;
        return true;
    }
    return false;
}

iv.window.prototype.getRay=function(x,y,r)
{
    /* function returns two points - start, end*/
	var w=this.viewportWidth,h=this.viewportHeight;
    var v=this.view;
	var p1=v.from,p2=v.to;
	var dir=vec3.sub_r(v.to,v.from);
	var up=v.getUpVector();	
	vec3.normalize(up);
	var vx=vec3.cross_rn(dir,up),h2=h/2,w2=w/2,i;
    if(!r)r=[];
    if(v.ortho)
    {
        var dy=(h2-y)/h2,dx=(x-w2)/h2;
        var k=1/v.scale;
        vec3.scale(vx,dx*k);
        vec3.scale(up,dy*k);        
        for(i=0;i<3;i++)r[i]=p1[i]+up[i]+vx[i];
    }else{
	var k=vec3.length(dir)*Math.tan(Math.PI*v.fov/360);
	var ky=(h2-y)/h2,kx=(x-w2)/w2;
	vec3.scale(up,k*ky);
	vec3.scale(vx,k*kx*w/h);
    vec3.cpy(r,p1);
    }
    for(i=0;i<3;i++)r[i+3]=p2[i]+up[i]+vx[i];
    return r;
}
iv.context=function(wnd)
{
    if(wnd){
    this.window=wnd;    
    this.space=wnd?wnd.space:null;
    this.bbScaleFactor=0.0;
    this.screenScale=0.0;    
    this.view=new iv.viewInfo();
    this.version=-1;
    this.mvMatrix=mat4.create();
    }
}
iv.context.prototype.action=function(node,tm,state,opacity){return true;}

iv.context.prototype.update=function(utm) {
    var w=this.window;
    if(this.version!=w.vpVersion)
    {
    this.space=w.space;
    this.version=w.vpVersion;
    this.W2=w.viewportWidth/2;
	this.H2=w.viewportHeight/2;
    var v=w.view,up=v.getUpVector(),V=this.view;
    this.ortho=!!v.ortho;

    if(v.ortho)
        this.screenScale=this.bbScaleFactor=1/(this.H2*v.scale);
    else {
        this.bbScaleFactor=Math.tan((Math.PI*v.fov/180)/2)/this.H2;
        this.screenScale=1.0/Math.tan(Math.PI*v.fov/360);
        if(utm){
        this.bbScaleFactor/=utm[0];
        this.screenScale/=utm[0];
        }
    }
    this.utm=utm;
    if(utm){
        mat4.lookAt(mat4.mulPoint(utm,v.from,V.from),mat4.mulPoint(utm,v.to,V.to),mat4.mulVector(utm,up,V.up),this.mvMatrix);
        mat4.mulPoint(utm,v.up,V.up);
    }
    else
        mat4.lookAt(v.from,v.to,up,this.mvMatrix);

    if(v.camera&&(v.camera.object instanceof iv.camera)){
        var mv;
        if(utm) {
            mv=[];
            mat4.lookAt(v.from,v.to,up,mv);
        } else mv=this.mvMatrix;
        var c=v.camera,C=c.object;
        if(!c.camTM) {
            c.camTM=[];
            c.camTMi=[];
            mat4.lookAt(C.from,C.to,vec3.subtractN(C.up,C.from,[]),c.camTM);
            mat4.invert(c.camTMi,c.camTM);
        }
        var tm=c.enableTM();
        var tmi=[];
        mat4.invert(tmi,mv);
        mat4.m(c.camTM,tmi,tm);
    }    
    if(!utm) {
         vec3.cpy(V.from,v.from);
         vec3.cpy(V.to,v.to);
         vec3.cpy(V.up,v.up);
    }
    }
    return true;
}

iv.context.prototype.worldToView=function(w,v)
{
	v=mat4.mulPoint(this.mvMatrix,w,v);
	var z=v[2],W=this.W2,H=this.H2,k=this.screenScale;
	if(z)
	{	
        v[0]=-(k*v[0]/z)*H+W;
		v[1]=(k*v[1]/z)*H+H;
		return v;
	}
	return null;
}
iv.rcontext=function(wnd)
{
    iv.context.call(this,wnd);
   	this.q=[];
    for(var i=1;i<9;i++)this.q[i]=({L:0,I:[]});
    this.tmTmp=mat4.create();
}
iv.rcontext.prototype=new iv.context(null);
iv.rcontext.prototype.worldToView=function(w,v)
{
  var _w=w;
  if(this.utm)  
    _w=mat4.mulPoint(this.utm,w,[]);  
  return iv.context.prototype.worldToView.call(this,_w,v);
}
iv.rcontext.prototype.action=function(n,a,b,c)
{
    if(n.object)return n.object.preRender(this,n,a,b,c);
    return true;
}
iv.queueItem=function()
{
    this.tm=null;
    this.object=null;
    this.mtl=null;
    this.far=this.near=1.0;
    this.state=0;
    this.opacity=1.0;
}
iv.rcontext.prototype.toRenderQueue=function(atm,node,state,opacity) {
    var tm;
    if(atm) tm=mat4.m_z(atm,this.mvMatrix,this.tmTmp);
    else tm=this.mvMatrix;
    var obj=node.object,_min=obj.boxMin,_max=obj.boxMax,near= -(tm[2]*_min[0]+tm[6]*_min[1]+tm[10]*_min[2]),far=near,S=this.space;

    for(var i=1;i<8;i++) {
        var x=(i&1)?_max[0]:_min[0],y=(i&2)?_max[1]:_min[1],z=(i&4)?_max[2]:_min[2];        
        z= -(tm[2]*x+tm[6]*y+tm[10]*z);
        if(z<near) near=z; else if(z>far) far=z;
    }
    z=tm[14];
    far-=z;near-=z;
    if(far<1e-6) return;

    var rmode=S.rmodes[(state&0xff00)>>8],mtl=rmode.mtl||S.cfgDefMtl||node.material;
    var s=node.stage||((mtl.opacity!=undefined || opacity<1.0  )?4:2) , _q=this.q[s],a=_q.I[_q.L];
    
    if(!a) a=_q.I[_q.L]=new iv.queueItem();
    a.tm=atm;
    a.object=obj;
    a.mtl=mtl;
    a.near=near;
    a.far=far;
    a.state=state|(node.state&(16|32|0x70000));
    a.opacity=opacity;
    _q.L++;
};

iv.window.prototype.drawScene=function (){
	var gl=this.gl,s=this.space,bk=this.bkColor;
	gl.viewport(0,0,this.viewportWidth,this.viewportHeight);
    

    if(bk===null)
    {
        gl.clearColor(0,0,0,0);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);	
    }else

	if(!s || !s.bk || (!s.drawBk()))
	{	
		gl.clearColor(((bk>>16)&0xff)/255.0,((bk>>8)&0xff)/255.0,(bk&0xff)/255.0,1);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);	
	}
    if(s){
    this.rcontext.update(s.unitMatrix);
    s.render(this.rcontext);
    }
    s=this.layer;
    while(s){s.draw();s=s.nextLayer;}
	this.timer=false;
}

iv.window.prototype.invalidate=function(f) {
	if(f!==undefined)
	{
		if(f&iv.INV_VERSION)this.vpVersion++;
		if(f&iv.INV_MTLS && this.space)this.space.invalidateMaterials();
		
	}
	if(this.timer)return ;
	this.timer=true;
	this.requestAnimFrame.call(window,this.drawScene.bind(this));
}
iv.easeInOut=function(a){return 0.5+Math.sin((a-0.5)*Math.PI)/2;}

iv.window.prototype.animate=function()
{
	var j=0,rez=0,uFlags=0,inv=false,bKill=true;
	var time = this.getTickCount();
	var _i=this.transitions;
	while(j<_i.length)
	{
		var i=_i[j],del=false;
		if(i.lastTime!=time)
		{
			if(i.duration)
			{
				var a=(time-i.startTime)/i.duration;
				if((a>=1.0)||(a<0)){a=1.0;del=true;}
                if(i.transition)a=i.transition(a);
				rez=i.animate(a);
			}else
			{  
				rez=i.animate(Math.max(time-i.lastTime,0));
				if(!(rez&1))del=true;
			}
			i.lastTime=time;
		}
		if(rez&2)inv=true;
		if(rez&4)uFlags|=iv.INV_VERSION;
		if(del)this._removeAnimation(j,true);else j++;
	}
	if(inv)this.invalidate(uFlags);
	if(!_i.length)
	{
		clearInterval(this.transTimer);
		this.transTimer=null;
	}
}
iv.window.prototype.getAnimation=function(type)
{
	var _i=this.transitions;
	if(_i)
	{	
		for(var i=0;i<_i.length;i++)
		{
			var t=_i[i];
			if(t.type && t.type==type)
				return i;
		}
	}
	return -1;
};
iv.window.prototype._removeAnimation=function(i,f)
{
    var _i=this.transitions,t=_i[i];
    if(t.detach)t.detach(this,f);
    if(t.type)this.notify("anim.end",{type:t.type,anim:t});
	_i.splice(i,1);
}
iv.window.prototype.removeAnimationType=function(type,e)
{
	var _i=this.transitions,i,t;
	if(_i)
	{	
		for(i=0;i<_i.length;i++)
		{
			t=_i[i];
			if(t.type && t.type==type)
			{
                if(e && t.duration)t.animate(1.0);
                this._removeAnimation(i);
				return true;
			}
		}
	}
	return false;
};
iv.window.prototype.removeAnimation=function(a)
{
	var _i=this.transitions;
	if(_i){
		var i=iv.indexOf(_i,a);
		if(i>-1)
		{
            this._removeAnimation(i);
			return true;
		}}
	return false;
}
iv.window.prototype.addAnimation=function(i)
{
	i.lastTime = this.getTickCount();
	if(i.duration)i.startTime=i.lastTime;
	if(!this.transitions)this.transitions=[];
	this.transitions.push(i);
    if(i.type)this.notify("anim.start",{type:i.type,anim:i});
	if(!this.transTimer){
		this.transTimer=setInterval(this.input.a,10);
	}return true;
};


iv.window.prototype.playAnimation=function(p)
{
    var r=null,s=this.space;
    if(s){
        var info={from:s.anim?s.anim.start:0,to:s.anim?s.anim.end:1};
        if(p)for(var v in p)info[v]=p[v];
        r=new iv.anim.node(s,info);
        this.addAnimation(r);  
    }
    return r;
}


iv.anim.spin=function(wnd,t,m)
{
	this.type="spin";this.wnd=wnd;
	var a=wnd.last,k=this.kf(a.dt);
	this.x=a.x*k;
	this.y=a.y*k;
    this.mode=m;
}
iv.anim.spin.prototype.kf=function (a){return Math.pow(0.82,a/100);}
iv.anim.spin.prototype.animate=function(a)
{

	this.wnd.doOrbit(this.x,this.y);
	var k=this.kf(a);
	this.x*=k;this.y*=k;
	k=1e-1;
	if((Math.abs(this.x)<k) && (Math.abs(this.y)<k)){return 6;}
	return 7;
}


iv.window.prototype.stopAR=function(){
this.removeAnimationType("spin");

}

iv.window.prototype.searchNode = function(id)
{
	if(this.space && this.space.root)
		return this.space.root.search(id);
	return null;
}
iv.window.prototype.setModelView =function(index,flags)
{
    if(!flags)flags=iv.VIEW_ANIM_PLAY|iv.VIEW_TRANSITION;
    this.stopAR();
	if(this.space && this.space.views && index>=0 && index<this.space.views.length)
	{
		var v=this.space.views[index];
		if(v)this.setView(v,flags);
	}
}
iv.window.prototype.setStdView = function (mode,flags) {
    var v = null,V=this.view,d = vec3.distance(V.from, V.to),t = V.to,x = t[0], y = t[1], z = t[2];
    switch (mode) {
        case "left":v={from:[x+d,y,z],up:[x+d,y,z+d]};break;
        case "right":v={from:[x-d,y,z],up:[x-d,y,z+d]};break;
        case "front":v={from:[x,y-d,z],up:[x,y-d,z+d]};break;
        case "back":v={from:[x,y+d,z],up:[x,y+d,z+d]};break;
        case "top":v={from:[x,y,z+d],up:[x,y+d,z+d]};break;
        case "bottom":v={from:[x,y,z-d],up:[x,y-d,z-d]};break;
       
    }
    if (v) {
        this.stopAR();        
        v.to = V.to.slice();
        v.fov = V.fov;
        if(flags==undefined)flags=0;
        if(flags&iv.VIEW_UNDO){this.undoVp("Set "+mode);flags&=~iv.VIEW_UNDO;}
        this.setView(v,flags);
    }
}
iv.window.prototype.getZoomToFitBox=function(v,b)
{
    if(!v)v=this.getView();
    var sz=box3.size(b);
    var to=box3.middle(b);
    var l=vec3.length(sz)/2;
    if(this.view.ortho)
    {
        v.scale=1/l;
        l=vec3.sub_r(to,v.to);        
        vec3.add(v.from,l);
        vec3.add(v.up,l);
    }else{
        var dir=v.getViewVectorN();
        var up=v.getUpVector();
        vec3.scale(dir,-l/Math.sin(v.fov*Math.PI/360));
        vec3.add(to,dir,v.from);
        vec3.add(v.from,up,v.up);
    }
    vec3.cpy(v.to,to);
    return v;
}
iv.window.prototype.zoomToFitBox=function(v,b,flags)
{
    v=this.getZoomToFitBox(v,b);
    this.stopAR();
    if(flags==undefined)flags=0;
    flags|=iv.VIEW_INVALIDATE;
    this.setView(v,flags);
}
iv.window.prototype.zoomToFit=function(v,flags){
    if(this.space && this.space.root)
    {
        var b=this.space.root.getBoundingBox();
        if(b)return this.zoomToFitBox(v,b,flags);
    }
}
