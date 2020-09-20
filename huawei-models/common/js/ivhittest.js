

iv.boxTriTest=function (_min,_max,org,d,t,x)
{
	var _min_x=_min[x];
	org=org[x];
	d=d[x];
	if(d)
	{
		var t1=(_min_x-org)/d,t2=(_max[x]-org)/d;
		if(t1<t2)t.push(t1,t2);else t.push(t2,t1);
	}else { if((org<_min_x) || (org>_max[x]))return false;}
	return true;
};

iv.hitBBox=function (_min,_max,org,dir)
{
	var t=[],i;
    for(i=0;i<3;i++){if(!iv.boxTriTest(_min,_max,org,dir,t,i))return null;}
    if(!t.length)return null;
	var maxnear=t[0],minfar=t[1];
	for(i=2;i<t.length;i+=2)
	{
        var a=t[i];
		if(a>maxnear)maxnear=a;
        a=t[i+1];
		if(a<minfar)minfar=a;
	}
	if(maxnear>minfar)return null;	
    var p=vec3.scale_r(dir,maxnear);
	vec3.add_ip(p,org);
	return p;
}


iv.hitTriangle=function(loc,side1,side2,ctx)
{
	var vd,t,u,v,org=ctx.org,dir=ctx.dir;
	var s1_0=side1[0]-loc[0],s1_1=side1[1]-loc[1],s1_2=side1[2]-loc[2];
	var s2_0=side2[0]-loc[0],s2_1=side2[1]-loc[1],s2_2=side2[2]-loc[2];
	var dirX=dir[0],dirY=dir[1],dirZ=dir[2];
	var orgX=org[0],orgY=org[1],orgZ=org[2];
	var nX=s1_1*s2_2-s1_2*s2_1,nY=s1_2*s2_0-s1_0*s2_2,nZ=s1_0*s2_1-s1_1*s2_0;
	var d=Math.sqrt(nX*nX+nY*nY+nZ*nZ);
	if(!d)return false;
	nX/=d;nY/=d;nZ/=d;

	vd=nX*dirX+nY*dirY+nZ*dirZ;

	if(1)
	{
		if(vd==0.0)return false;
	}else{
		if(vd>=0.0)return false;
	}
	t=((loc[0]-orgX)*nX+(loc[1]-orgY)*nY+(loc[2]-orgZ)*nZ)/vd;
	if(t<1e-6)return false;
	
    // Precalcualte
	var s11=s1_0*s1_0+s1_1*s1_1+s1_2*s1_2;//vec3.dot(side1,side1);
	var s12= s1_0*s2_0+s1_1*s2_1+s1_2*s2_2;//vec3.dot(side1,side2);
	var s22=s2_0*s2_0+s2_1*s2_1+s2_2*s2_2;//vec3.dot(side2,side2);
	d=s11*s22-s12*s12;
	if(d<=1e-34)
		return false;

	var kuX=(s1_0*s22-s2_0*s12)/d,kuY=(s1_1*s22-s2_1*s12)/d,kuZ=(s1_2*s22-s2_2*s12)/d;
	var u0=-(loc[0]*kuX+loc[1]*kuY+loc[2]*kuZ);
	var pX=dirX*t+orgX,pY=dirY*t+orgY,pZ=dirZ*t+orgZ;
	u=u0+ pX*kuX+pY*kuY+pZ*kuZ;

	if((u<=0.0)||(u>=1.0))return false;
	var kvX=(s2_0*s11-s1_0*s12)/d,kvY=(s2_1*s11-s1_1*s12)/d,kvZ=(s2_2*s11-s1_2*s12)/d;
	var v0=-(loc[0]*kvX+loc[1]*kvY+loc[2]*kvZ);
	v=v0+pX*kvX+pY*kvY+pZ*kvZ;
	if(!((v>0.0)&&(u+v<1.0)))
		return false;
	
	if(t<ctx.lLength)
	{
	ctx.lHit=[pX,pY,pZ];
	ctx.lLength=t;
	return true;
	}
	return false;
}

iv.hcontext=function(wnd)
{
    iv.context.call(this,wnd);
    this.ray=null;
    this.nodes=[];
    this.itm=[];
}

iv.hcontext.prototype=new iv.context(null);
iv.hcontext.prototype.update=function(utm)
{
    iv.context.prototype.update.call(this,utm);
    this.nodes.length=[];
    this.ortho=this.window.view.ortho;
}

iv.hcontext.prototype.action=function(n,a,b,c)
{
    if(n.state&64)return 0;
    if(n.object)return n.hitTest(this,a);
    return true;
}


iv.getRayPoint=function(ray,i,p)
{
	if(i)i=3;
    if(!p)p=[];
    p[0]=ray[i];p[1]=ray[i+1];p[2]=ray[i+2];
	return p;
}
iv.hcontext.prototype.hitLine=function(A0,A1)
{
	var v = this.dir,u = vec3.sub_r(A1,A0),w = vec3.sub_r(A0,this.org);

	var	a = vec3.dot(u,u);// always >= 0
	var	b = vec3.dot(u,v);	
	var	d = vec3.dot(u,w);
	var	e = vec3.dot(v,w);
	var	D = a - b*b;// always >= 0
	if (D < 1e-20)// lines are almost parallel
		return false;
	
	var sc = (b*e - d) / D;
    if(sc<-0.001)return false;
    if(sc>1.001)return false;
	var tc = (a*e - b*d) / D;
    if(tc<0)return false;
    if(tc>this.lLength)return false;
	
	var p1=vec3.scale_r(u,sc),l;
        vec3.add(p1,A0,p1);    
    if(this.ortho)
    {
     var p2=vec3.scale_r(v,tc);
     vec3.add(p2,this.org,p2);    
     var l=vec3.distance(p1,p2);
    if(l>this.lineDelta)return false;    
    }else{
    vec3.subtract(p1,this.org,u);
    vec3.normalize(u);
    l=vec3.dot(u,v);
   if(l<this.lineDelta)return false;    
    
    }

	this.lHit=p1;
	    this.lLength=tc;
	    return true;
    }

iv.node.prototype.hitTest = function(ctx,tm)
{
    var obj=this.object;
	if(obj && obj.preHitTest(ctx,tm))
	{   
		var item=obj.hitTest(ctx,tm);
        if(item){
            item.top=(this.stage==7);
            item.node=this;
            ctx.nodes.push(item);             
        }
	}
    return true;
}

iv.mesh.prototype.preHitTest=function(i,tm)
{
	if(this.boxMin && this.boxMax)
	{
		var itm=mat4.invert(i.itm, tm);
		i.org=mat4.mulPoint(itm,iv.getRayPoint(i.ray,0,i.org)),i.dir=mat4.mulPoint(itm,iv.getRayPoint(i.ray,1,i.dir));
		vec3.sub_ip(i.dir,i.org);
		vec3.normalize(i.dir);
        if(this.lineMode)
        {
            var a=this.boxMin.slice(),b=this.boxMax.slice(),d=vec3.distance(a,b)/10;
            for(var j=0;j<3;j++){a[j]-=d;b[j]+=d;}
            return iv.hitBBox(a,b,i.org,i.dir);
        }else
		    return iv.hitBBox(this.boxMin,this.boxMax,i.org,i.dir);
    }
    return null;
}
iv.mesh.prototype.hitTest=function(ctx,tm) {
    var f=this.faces,p=this.points;
    if(f&&p) {
        {
            var index=0,nt=f.length,i,v0=[0,0,0],v1=[0,0,0],v2=[0,0,0],ok=false,itri=0,vi,normal,line0,line1;
            ctx.lLength=1e34;            
            if(this.lineMode) {
                nt/=2;
                for(i=0;i<nt;i++)
                {
                    vi=f[index++]*3;
                    v0[0]=p[vi]; v0[1]=p[vi+1]; v0[2]=p[vi+2];
                    vi=f[index++]*3;
                    v1[0]=p[vi]; v1[1]=p[vi+1]; v1[2]=p[vi+2];
                    if(ctx.hitLine(v0,v1)){ok=true;itri=i;}
                }
            } else {
                nt/=3;                
                for(i=0;i<nt;i++) {
                    vi=f[index++]*3;
                    v0[0]=p[vi]; v0[1]=p[vi+1]; v0[2]=p[vi+2];
                    vi=f[index++]*3;
                    v1[0]=p[vi]; v1[1]=p[vi+1]; v1[2]=p[vi+2];
                    vi=f[index++]*3;
                    v2[0]=p[vi]; v2[1]=p[vi+1]; v2[2]=p[vi+2];
                    if(iv.hitTriangle(v0,v1,v2,ctx))
                    {ok=true;itri=i;
                    if(!normal){normal=[],line0=[],line1=[];}
                    vec3.subtractN(v0,v1,line0);
			        vec3.subtractN(v1,v2,line1);
			        vec3.crossN(line0,line1,normal);
                    }
                }
            }
            if(ok) {

                var hp=mat4.mulPoint(tm,ctx.lHit,[]);
                
                var l=vec3.distance(hp,ctx.ray);
                var item={length:l,pnt:hp,lpnt:ctx.lHit,triangle:itri};
                if(normal){
		            item.normal=mat4.mulVector(tm,normal);// we don't need a.normal anymore
		            vec3.normalize(item.normal);
                }
                return item;   
                
            }
        }
    }
    return null;
}


iv.window.prototype.hitTest=function(x,y) {
    if(this.space&&this.space.root) {
        var r=this.getRay(x,y);
        if(!this.hcontext)this.hcontext=new iv.hcontext(this);
        var h=this.hcontext;
        h.update();
        h.x=x;h.y=y;
        var r1=this.getRay(x+4,y+4);
	if(h.ortho)	h.lineDelta=vec3.distance(r,r1);
		else{
        var a=[r[3]-r[0],r[4]-r[1],r1[5]-r1[2]],b=[r1[3]-r1[0],r1[4]-r1[1],r1[5]-r1[2]];
        vec3.normalize(a);
        vec3.normalize(b);
        	h.lineDelta=vec3.dot(a,b);
	}
        var tm=[];
        mat4.identity(tm);        
        h.ray=r;
        this.space.root.traverse(h,tm,0,1.0);
        if(h.nodes.length) {
            h.nodes.sort(function(a,b) {
                if(a.top!=b.top) { return (a.top)?-1:1; }
                return (a.length<b.length)?-1:1;
            });
            for(i=0;i<h.nodes.length;i++) {
                var hi=h.nodes[i];
                var n=hi.node0=hi.node;
                while(n)// handle closed nodes
                {
                    if(n.state&8)hi.node=n;
                    n=n.parent;
                }
            }
            var hi=h.nodes[0];
            h.node=hi.node;
            h.pnt=hi.pnt;
            h.length=hi.length;

            return h;
        }
    }
    return null;
}

iv.node.prototype.select = function(n,s,k)
{
	var b=false;
	if(n==this)
	{
		b|=this.setState(s?4:0,4);
	}else
	if(!k)b|=this.setState(0,4);
	var c=this.firstChild;
	while(c)
	{
		b|=c.select(n,s,k);
		c=c.next;
	}
	return b;
}

iv.node.prototype.getSelection = function(a)
{
    if(this.state&4){if(!a)a=[];a.push(this);}
    var c=this.firstChild;
    while(c)
    {
        a=c.getSelection(a);c=c.next;
    }
    return a;
}
iv.space.prototype.select = function(n,s,k)
{ 
    var r=this.root,old=r.getSelection(null);
    if(r.select(n,s,k))this.invalidate();
    var i={old:old,current:r.getSelection(null),node:n};
    if(n) { if(s)this.selNode=n; }
    else this.selNode=null;
    this.window.notify("selection",i);

    if(this.clrSelection[5]<1.0)
        this.anySelection=(n&&s)||this.isAnySelected();
    else this.anySelection=false;

    return false;
}
iv.space.prototype._enumObjects=function(i,n)
{
   i.push(n);
   if(n.state&8)return;
   n=n.firstChild;
   while(n){this._enumObjects(i,n);n=n.next;}
}
iv.space.prototype.selectRange=function(a,b)
{
var ok=false;
        if(a && b && a!=b)
        {
            var items=[];
            this._enumObjects(items,this.root);
            var i0=iv.indexOf(items,a);
            var i1=iv.indexOf(items,b);
            if((i0>=0)&&(i1>=0))
            {
                ok=true;
                var sign=(i0<i1)?1:-1;
                while(true){
                    var n=items[i0];                            
                    if(i0==i1){this.select(n,true,true);break;}
                    else n.state|=4;
                    i0+=sign;
                }
            }
        }
   if(ok)this.invalidate();
   return ok;
}



iv.node.prototype.isAnySelected=function()
{
    if(this.state&4)return true;
    var c=this.firstChild;
    while(c)
    {
        if(c.isAnySelected())return true;
        c=c.next;
    }
    return false;
}

iv.space.prototype.isAnySelected=function()
{
    if(this.root)
        return this.root.isAnySelected();
    return false;
}

