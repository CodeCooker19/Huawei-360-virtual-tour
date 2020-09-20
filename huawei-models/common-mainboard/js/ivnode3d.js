/*
	node states
	1 - visible this
	2 - visible children
	4 - selection
	8 - closed
	16 - no z write
	32 - double sided - force double sided on/off - used in traverse only.
	64 - no hit testing
    0x80 - hide in tree view
    0xff00 - render mode
   
   0x40000 - do not use xray
   0x80000 - do not render. Reserved for future
*/

iv.node=function ()
{
	this.object=null;
	this.tm=null;
	this.name="";
	this.material=null;
	this.state=3;
	this.ref=0;
}

iv.node.prototype.addRef = function(){this.ref++;}
iv.node.prototype.release = function()
{
	this.ref--;
	if(this.ref<1)this.clear();
}
iv.node.prototype.newNode = function(){return this.insert(new iv.node());}
iv.node.prototype.insert = function(n)
{	n.ref++;
	if(this.lastChild)this.lastChild.next=n;
	else
		this.firstChild=n;
	this.lastChild=n;
	n.parent=this;
	return n;
}
iv.node.prototype.clear = function()
{
	while(this.firstChild)this.remove(this.firstChild);
	this.setObject(null);
}
iv.node.prototype.remove = function(n)
{
	if(n.parent!=this)return false;
	var _n=null;
	if(this.firstChild==n)
	{
		this.firstChild=n.next;
	}else
	{
		_n=this.firstChild;
		while(_n)
		{
			if(_n.next==n)
			{
				_n.next=n.next;
				break;
			}
			_n=_n.next;
		}
	}
	if(this.lastChild==n)
			this.lastChild=_n;
	n.parent=null;
	n.next=null;
	n.release();
	return true;
}

iv.node.prototype.setState = function(s,mask)
{
	var _state=this.state& (~mask)| mask&s;
	if(_state!=this.state)
	{
		this.state=_state;
		return true;
	}
	return false;
}

iv.node.prototype.traverse = function(ctx,ptm,astate,opacity) {
    var v=this.state;
    astate|=(v&4);//selection
    if(v&0xff00){astate&=~0xff00;astate|=v&0xff00;}//render mode    
    if(!(v&3))return;
    if(this.cull)
    {
        if(this.cull===1)astate|=32;
        else astate&=~32;
    }	
    if(this.tm)
    {
        if(ptm){
            if(!this.wtm )this.wtm=mat4.create();           
            ptm=mat4.m(this.tm,ptm,this.wtm);
        }else ptm=this.tm;
    };
    if(this.opacity!==undefined && opacity!==undefined)opacity*=this.opacity;

    if(v&1 && (!ctx.action(this,ptm,astate,opacity)))return;

    if(v&2){
        var child=this.firstChild;
        while(child)
        {
            child.traverse(ctx,ptm,astate,opacity);
            child=child.next;
        }
    }
};

iv.node.prototype.setObject = function(obj)
{
	if(this.object!=obj)
	{
		if(this.object)this.object.release();
		this.object=obj;
		if(obj)obj.ref++;
	}
}

iv.node.prototype.getBoundingBoxEmpty=function(tm,b){return b;}


iv.node.prototype.load = function(d,info)
{
var i,j,a,v;
    for(v in d)
    {
        a=d[v];
        switch(v)
        {
         case 'light':this.setObject(new iv.light(a));break;
         case 'camera':this.setObject(new iv.camera(a));break;

         

	     case 'speaker':this.setObject(new iv.speaker(a));break;  
         case 'object':this.setObject(info.objects[a]);break;
         case 'mtl':a=info.materials[a];if(a){this.material=a;if(a.bump && this.object)this.object.bump=true;}break;// generate bump tangents

         case 'bbaxis':
		    this.bbtm = mat4.create();
		    this.bbaxis=a;
		    this.traverse=this.traverseBB;
		    if(d.dir)this.bbaxisDir=d.dir;
            this.getBoundingBox=this.getBoundingBoxEmpty;
             break;


        case 'markup':
            this.traverse=this.traverseMarkup;
            this.getBoundingBox=this.getBoundingBoxEmpty;
            this.markup=a;
            if(typeof a.camera == 'number' && info.space.views)
                a.camera=info.space.views[a.camera];
            break;

        case 's':this.state=a;break;
        case 'tm':this.tm=iv.convertMatrix(d.tm);break;
        case 'i':for(i=0;i<a.length;i++)this.newNode().load(a[i],info);break;
        default:this[v]=a;
        }    
    }
}
iv.node.prototype.enableTM = function()
{
if(!this.tm)this.tm=mat4.identity(mat4.create());
return this.tm;
}
iv.node.prototype.getWTM=function(){
	var tm=null;
	var n=this;
	while(n)
	{
		if(n.tm)
		{
			if(tm)
			{
				mat4.m(tm,n.tm);
			}else tm=mat4.create(n.tm);
		}
		n=n.parent;
	}
	return tm;
};

iv.node.prototype.replaceAnimId=function(a,b)
{
    iv.anim.replace(this,a,b);
    var n=this.firstChild;
    while(n)
    {
        n.replaceAnimId(a,b);
        n=n.next;
    }
}
iv.node.prototype.activateAnimation=function(a,reset)
{
    var n=this.firstChild;
    while(n)
    {
        n.activateAnimation(a,reset);
        n=n.next;
    }
    iv.anim.activate(this,a,reset);
}


iv.getBoolTrackInfo=function(a,t)
{
	var c=a.length;
	if(!c)return false;
	if(t<=a[0].t)return a[0].v;
    if(t>=a[c-1].t)return a[c-1].v;
    var _key=null;
    for(var i=0;i<c;i++)
	{
		var key=a[i];
		if(key.t==t)key.v;
		else
		if(key.t>t)
		{
			if(_key)return _key.v;
			return false;//?
		}
		_key=key;
	}
}
iv.getFloatTrackInfo=function(a,t,old)
{
    var d={};
    if(a && iv.getTrackInfo(a,t,d))
        return d.i1?d.i1.v*(1.0-d.k)+ d.i0.v*d.k:d.i0.v;    
    return old;
}
iv.getP3DTrackInfo=function(a,t,d)
{   if(!d)d={};
	if(a && iv.getTrackInfo(a,t,d))
        return d.i1?vec3.lerp_r(d.i1.v,d.i0.v,d.k):d.i0.v;
    return null;	
}
iv.getTrackInfo=function(a,t,d)
{
	var c=a.length;
	if(!c)return false;
	if(t<=a[0].t)
	{
		d.i0=a[0];
		d.k=1;
		delete d.i1;
		return true;
	}
	if(t>=a[c-1].t)
	{
		d.i0=a[c-1];
		d.k=1;
		delete d.i1;
		return true;
	}
	var _key=null;
	for(var i=0;i<c;i++)
	{
		var key=a[i];
		if(Math.abs(key.t-t)<7e-4)
		{	 
			delete d.i1;
			d.i0=key;
			d.k=1.0;
			return true;
		}else
		if(key.t>t)
		{
			if(_key)
			{
				var dt=key.t-_key.t;
				d.i0=_key;
				d.i1=key;
				d.k= (key.t-t)/dt;
				return true;
			}else{
				delete d.i1;
				d.i0=key;
				d.k=1.0;
				return true;
			}	
		}
		_key=key;
	}
	if(_key)
	{
		delete d.i1;
		d.i0=_key;
		d.k=1.0;
		return true;
	}
	return true;
}

iv.node.prototype.getTime = function(t)
{
    var a=this.anim;
    if(a && a.time!==undefined)return a.time;
    var n=this.firstChild;
	while(n)
	{
		var rez=n.getTime();
        if(rez!==undefined)return rez;
		n=n.next;
	}
    return undefined;
}
iv.node.prototype.setTime = function(t)
{
	var rez=false,n=this.firstChild;
	if(this.anim)
	{
		var a=this.anim,d={};
		if(a.pos || a.rot || a.scale)
		{
		var tm=this.enableTM(),p;
		mat4.identity(tm);
        if(a.scale)
        {
            p=iv.getP3DTrackInfo(a.scale,t,d);
            if(p){tm[0]=p[0];tm[5]=p[1];tm[10]=p[2];}
        }
		if(a.rot && iv.getTrackInfo(a.rot,t,d))
		{
			var r=[];
			if(d.i1)
			{
				var q=[];
				quat.slerp(q, d.i1.v,d.i0.v, d.k);
				mat4.fromQuat(r,q);
			}else mat4.fromQuat(r,d.i0.v);
			mat4.m(tm,r);
		}
        if(a.pos)
        {
            p=iv.getP3DTrackInfo(a.pos,t,d);
            if(p)mat4.offset(tm,p);
        }
        }
        if(a.vis0)
        {
            if(iv.getBoolTrackInfo(a.vis0,t))this.state|=1;else this.state&=~1;
        }
        if(a.vis1)
        {
            if(iv.getBoolTrackInfo(a.vis1,t))this.state|=2;else this.state&=~2;
        }
        if(a.opacity)this.opacity=iv.getFloatTrackInfo(a.opacity,t,this.opacity);
    }
    if(this.object && this.object.setTime)this.object.setTime(a,t);
	
	while(n)
	{
		rez|=n.setTime(t);
		n=n.next;
	}
	return rez;
}

iv.anim.replace=function(n,a,b)
{
    var _i=n.anims,id=a.id;
    if(_i)    
        for(var i=0;i<_i.length;i++)
        {
            var A=_i[i];
            if(A.id==a)A.id=b;
        }
}
iv.anim.activate=function(n,a,reset)
{
    var _i=n.anims,id=a.id;
    if(_i)    
        for(var i=0;i<_i.length;i++)        
            if(_i[i].id==id)
            {
                n.anim=_i[i];return true;
            }
    if(reset)this.anim=null;
    return false;
}
iv.anim.node=function (node,p)
{
    this.type="anim";
	this.node=node;	
	this.count=1;
	this.mode=0;
    this.delayStart=0;
    this.delayEnd=0;
    for(var v in p)this[v]=p[v];
	this.d=Math.abs(this.to-this.from);
	this.t=-this.delayStart;    
}
iv.anim.node.prototype.animate=function(k) {
    if(this.speed)k*=this.speed;
    this.t+=k/1000;
    if(this.stage)
    {
        if(this.t<this.delayEnd)return 1;
        return 0;
    }else{
    if(this.d)
    {
        var ret=3,a=this.t-this.delayStart,_c=Math.floor(a/this.d);
        if(a<0)return 1;

        if((this.count>0) && (_c>=this.count)){
            if(this.delayEnd){this.stage=1;this.t=0;}else ret&=~1;
            _c=this.count-1;
        }
        a=a-this.d*_c;
        switch(this.mode)
        {
            case 1:if(_c&1)a=this.d-a;break;//ping pong
            default:break;//cycle
        }
        a/=this.d;
        this.node.setTime(this.from*(1.0-a)+this.to*a);
        return ret;
    }else {this.node.setTime(this.from);return 2;}	
    }
}

iv.node.prototype.searchId = function(id)
{
  if(this.id==id)return this;
  var n=this.firstChild;
  while(n)
  {
    var _n=n.searchId(id);
    if(_n)return _n;
    n=n.next;
  }
  return null;
}

iv.node.prototype.search = function(name)
{
  if(this.name==name)return this;
  var n=this.firstChild;
  while(n)
  {
    var _n=n.search(name);
    if(_n)return _n;
    n=n.next;
  }
  return null;
}
iv.node.prototype.visible = function()
{
    return (this.state&3)!=0;
}
iv.node.prototype.show = function(b)
{
    return this.setState((b || b==undefined)?3:0,3);
}

iv.node.prototype.showAll = function()
{
    this.state|=3;
    var n=this.firstChild;
    while(n)
    {
        n.showAll();
        n=n.next;
    }
}
iv.node.prototype.addPointToBox=function(tm,b,p) {
    if(tm) mat4.mulPoint(tm,p);
    if(b.length) {
        for(var j=0;j<3;j++) {
            if(p[j]<b[j]) b[j]=p[j]; else
                if(p[j]>b[j+3]) b[j+3]=p[j];
        }
    } else { b[3]=b[0]=p[0]; b[4]=b[1]=p[1]; b[5]=b[2]=p[2]; }
}

iv.node.prototype.getBoundingBox=function(tm,b)
{
	if(!(this.state&3))return b;
	
	if(this.object)
	{
    var p=[],obj=this.object;
	if(obj.points)
	{
		var v=obj.points;
		if(!b)b=[];
		var c=v.length;
		for(var i=0;i<c;i+=3)
		{
			p[0]=v[i];p[1]=v[i+1];p[2]=v[i+2];
            this.addPointToBox(tm,b,p);
		}
    }else
    if(obj.boxMin)
	{
        var _min=obj.boxMin,_max=obj.boxMax;
        for(var i=0;i<8;i++)
        {
            p[0]=(i&1) ? _max[0] : _min[0];
            p[1]=(i&2) ? _max[1] : _min[1];
            p[2]=(i&4) ? _max[2] : _min[2];
            this.addPointToBox(tm,b,p);
        }
	}
    }

	var child=this.firstChild,_newtm=null;
	while(child)
	{
        var newtm=null;
		if(child.tm)
		{
			if(tm){
				if(!_newtm)_newtm = mat4.create();
                newtm=_newtm;
				mat4.m(child.tm,tm,newtm);
			}else newtm=child.tm;
		}else newtm=tm;
		b=child.getBoundingBox(newtm,b);
		child=child.next;
	}
	return b;
}

;/*billboard functionality*/


iv.node.prototype.switchToBB = function(axis)
{
    this.bbtm = mat4.create();
	this.bbaxis=axis;
	this.traverse=this.traverseBB;
}

iv.node.prototype.traverseBB = function(ctx,ptm,astate,opacity)
{
	astate|=(this.state&4);
	var _ptm=ptm;
	if(this.tm)
	{
		var newtm = mat4.create();
		mat4.m(this.tm,ptm,newtm);
		ptm=newtm;
	}
	var v=this.state&3;if(!v)return;
// update matrix

	var tm=this.bbtm,w=ctx.window;

	var norg=ptm?[ptm[12],ptm[13],ptm[14]]:[0.0,0.0,0.0];// node origin in world crd
	norg=mat4.mulPoint(ctx.mvMatrix,norg);
	if(norg[2]>=0)return false; //clip

    var bbScaleFactor=1;
    if(this.bbunit&&this.bbscale) {
        if(this.bbunit=='3d') bbScaleFactor=this.bbscale; else {
            bbScaleFactor=ctx.bbScaleFactor;
            if(!ctx.ortho)
                bbScaleFactor=-bbScaleFactor*norg[2];
            bbScaleFactor*=this.bbscale;
            switch(this.bbunit) {
                case 'pt': bbScaleFactor*=1.512; if(window.devicePixelRatio) bbScaleFactor/=window.devicePixelRatio; break;
                case 'screen': bbScaleFactor*=w.gl.viewportHeight/1000; break
                case 'px': break;
            }
        }
    }

	mat4.invert(tm,ptm);
	cOrg=mat4.mulPoint(tm,ctx.view.from,[]);
	var a=this.bbaxis,alen=vec3.dot(a,a),a0=[],a1,a2;
	if(alen>1e-4)// around axis
	{	
		a2=[];
		vec3.normalize(cOrg);//billboard-to-viewer vector now
		alen=Math.sqrt(alen);
		if(this.bbaxisDir)
		{
			mat4.m(ptm,ctx.mvMatrix,tm);
			var p0=[_ptm[12],_ptm[13],_ptm[14]],p1=[],bF=false;
			mat4.mulPoint(tm,p0);
			mat4.mulPoint(tm,a,p1);
			if(this.bbaxisDir==1){bF=(p1[0]>p0[0]);}else if(this.bbaxisDir==2)bF=(p1[0]<p0[0]);
			if(bF)alen*=-1;
		}
		a1=[a[0]/alen,a[1]/alen,a[2]/alen];//normalization
		vec3.crossN(a1,cOrg,a0);
		vec3.crossN(a0,a1,a2);
	}else
	{
		var cUp=mat4.mulPoint(tm,ctx.view.up,[]);
		var cTarget=mat4.mulPoint(tm,ctx.view.to,[]);
		a2= vec3.sub_r(cOrg,cTarget); //billboard-to-viewer vector
		vec3.normalize(a2);
		var aY=vec3.sub_r(cUp,cOrg);
		vec3.normalize(aY);
		vec3.crossN(aY,a2,a0);
		a1=[0,0,0];
		vec3.crossN(a2,a0,a1);
	}
	mat4.identity(tm);
    if(bbScaleFactor!=1.0)
    {
        vec3.scale(a0,bbScaleFactor);
	    vec3.scale(a1,bbScaleFactor);
	    vec3.scale(a2,bbScaleFactor);
    }
	mat4.setRow(tm,0,a0);
	mat4.setRow(tm,1,a1);
	mat4.setRow(tm,2,a2);
	mat4.m(tm,ptm);
// update matrix
    if(this.opacity!==undefined && opacity!==undefined)opacity*=this.opacity;
if(v&1)
	ctx.action(this,tm,astate,opacity);

 if(v&2){
	var child=this.firstChild;
	while(child)
	{
		child.traverse(ctx,tm,astate,opacity);
		child=child.next;
	}
}
 return true;
}


/*billboard functionality*/

