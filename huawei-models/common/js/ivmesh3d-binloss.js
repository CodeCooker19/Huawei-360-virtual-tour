iv.object=function()
{
    this.ref=0;
}

iv.object.prototype.clear=function(){}
iv.object.prototype.addRef = function(){this.ref++;}
iv.object.prototype.release = function(){this.ref--;if(this.ref<1)this.clear();}
iv.object.prototype.preRender=function(node,tm,space,state,opacity){return true;}
iv.object.prototype.hitTest=function(ctx,tm){return false;}
iv.object.prototype.preHitTest=function(ctx,tm){return false;}

iv.object.prototype.setTime=function(a,t){};

// light
iv.light=function (d)
{ 
    this.ref=0;
    this.type=0;
    this.dir=null;
    this.org=null;
	if(d)this.load(d);
}
iv.light.prototype=new iv.object();
iv.light.prototype.load=function(d)
{
    for(var v in d)
    {
        var a=d[v];
        switch(v)
        {
            case 'dir':
            case 'org':this[v]=a.slice();break;
            default:this[v]=a;
        }
    }
}
iv.light.prototype.preRender=function(ctx,node,tm,state,opacity)
{
    var space=ctx.space;
    if(!space.stdLights)
    {
       var l=space.lights[space.currentLight];
       if(!l)space.lights.push(l={});       
       l.tm=tm;
       l.light=this;
       space.currentLight++;
    }
    return true;
}

// camera
iv.camera=function (d)
{ 
    this.ref=0;
    if(d)this.load(d);
}

iv.camera.prototype=new iv.object();
iv.camera.prototype.load=function(d)
{
    for(var v in d)
    {
        var a=d[v];
        switch(v)
        {
            case 'from':
            case 'up':
            case 'to':this[v]=a.slice();break;
            default:this[v]=a;
        }
    }
}
iv.camera.prototype.preRender=function(node,tm,space,state,opacity)
{
    return true;
}

iv.speaker=function (d)
{   this.ref=0;
    if(d)this.load(d);
}
iv.speaker.prototype=new iv.object();
iv.speaker.prototype.load=function(d)
{
    for(var v in d)
    {
        var a=d[v];
        switch(v)
        {   
            default:this[v]=a;
        }
    }
   this.checkHW();
   this.on=false;
}
iv.speaker.prototype.checkHW=function()
{
	 if(!this.player)
	{
	 	this.player=document.createElement("audio");
		if(this.player)
		{
			this.player.autoplay=false;
			this.player.preload="auto";
			this.player.src="a.mp3"
            //this.player.volume=
		}
	}

}

iv.speaker.prototype.play=function(b)
{
    if(this.on!=b)
    {
        this.checkHW();
        this.on=b;
        if(this.player)
        {
            if(b)
            {
                this.player.currentTime=0;
                this.player.play();
            }
            else
                this.player.pause();
        }
    }
}

iv.speaker.prototype.setTime=function(a,t)
{
  if(a.playback)
   {
     if(iv.getBoolTrackInfo(a.playback,t))
	{
	   this.play(true);
	}else
	{
	   this.play(false);
	}
   }
};



iv.mesh=function (gl)
{ 
    if(gl){
	this.gl=gl;
	this.lineMode=false;
	}
}
iv.mesh.prototype=new iv.object();


iv.mesh.prototype.setPoints= function(a,keep)
{
    this.setBuffer('v',iv.bufferF(this.gl,a,3));
    if(keep)this.points=a;
}
iv.mesh.prototype.setUV= function(a,keep)
{
    this.setBuffer('uv',iv.bufferF(this.gl,a,2));
    if(keep)this.uvpoints=a;
}
iv.mesh.prototype.setUV2= function(a,keep)
{
    this.setBuffer('uv2',iv.bufferF(this.gl,a,2));
    if(keep)this.uv2points=a;
}
iv.mesh.prototype.setNormals= function(a,keep)
{
    this.setBuffer('n',iv.bufferF(this.gl,a,3));
    if(keep)this.normals=a;
}
iv.mesh.prototype.setFaces= function(f,keep)
{
    this.setBuffer('f',iv.bufferI(this.gl,f));
    if(keep)this.faces=f;
}

iv.mesh.prototype.setBuffer = function(n,b)
{
	n+='Buffer';
	var _b=this[n];
	if(_b)
	{
		_b.ref--;
		if(_b.ref<1)this.gl.deleteBuffer(_b);
	}
	this[n]=b;
	if(b)
	{
		if(b.ref)b.ref++;else b.ref=1;
	}
}

// generate edge list
iv.mesh.prototype.addEdge=function (e,v1,v2)
{
	if(v2>v1){var _v=v2;v2=v1;v1=_v;}//swap vertices
	if(e[v1]==undefined)e[v1]=v2;
	else
		if(typeof e[v1] === 'number')e[v1]=[e[v1],v2];
		else e[v1].push(v2);
};

iv.mesh.prototype.updateEdges = function()
{
	if(!this.eBuffer)
	{
		var e=[];
		var f=this.faces;
		var nf=f.length/3;
		var j=0;
		var i;
		for(i=0;i<nf;i++)
		{
			this.addEdge(e,f[j],f[j+1]);
			this.addEdge(e,f[j+1],f[j+2]);
			this.addEdge(e,f[j+2],f[j]);
			j+=3;
		}
		var ne=e.length; 
		var num=0;
		for(i=0;i<ne;i++)
		{
			var v=e[i];
			if(v!=undefined){if(typeof v ==='number')num++;else num+=v.length;}
		}
		var edges=new Uint16Array(num*2);
		var j=0;
		for(i=0;i<ne;i++)
		{
			var v=e[i];
			if(v!=undefined)
			{
				if(typeof v==='number')
				{
					edges[j]=i;edges[j+1]=v;j+=2;
				}else
				{
					for(var i1=0;i1<v.length;i1++)
					{
						edges[j]=i;edges[j+1]=v[i1];j+=2;
					}
				}
			}
		}
		this.setBuffer('e',iv.bufferI(this.gl,edges));
	}
}


iv.normalizeArray=function (v)
{
	var c=v.length/3;
	for(i=0;i<c;i++)
	{
		var j=i*3;
		var a=v[j],b=v[j+1],c=v[j+2];
		var l=Math.sqrt(a*a+b*b+c*c);
		if(l)
		{
			v[j]=a/l;v[j+1]=b/l;v[j+2]=c/l;
		}
	}
}
iv.bSetV=function (a,ref,i,v)
{
    var j=i*3;
    var X=v[0],Y=v[1],Z=v[2];
    if(ref[i])
    {
        var x=a[j],y=a[j+1],z=a[j+2];
        if((x*X+y*Y+z*Z)<0)return;        
        X+=x;Y+=y;Z+=z;
    }else ref[i]=1;    
    a[j]=X;a[j+1]=Y;a[j+2]=Z;
};

iv.mesh.prototype.updateBumpInfo = function(f,v,n,uv)
{
	if(f&&v&&n&&uv)
	{
        if(!iv.bGetT){
            iv.bGetT=function (a,i,t){t[0]=a[i*2];t[1]=a[i*2+1];};
        }
        var sV=iv.bSetV,gV=iv.getV,gT=iv.bGetT;
		var wtm=[],ttm=[],ittm=[];
		mat4.identity(wtm);mat4.identity(ttm);
		var sz=v.length,tc=f.length,i,j;
		var a=new Float32Array(sz),b=new Float32Array(sz),ra=new Uint8Array(sz/3),rb=new Uint8Array(sz/3);
		var v0=[0,0,0],v1=[0,0,0],v2=[0,0,0],t0=[0,0],t1=[0,0],t2=[0,0];
		var r=[0,0,0];
		var Z=[0,0,1],vzero=[0,0,0];
        
		for(i=0;i<tc;i++)
		{
			var i0=f[i*3],i1=f[i*3+1],i2=f[i*3+2];
			gV(v,i0,v0);gV(v,i1,v1);gV(v,i2,v2);
			gT(uv,i0,t0);gT(uv,i1,t1);gT(uv,i2,t2);
			
            vec3.subtractN(v1,v0);
			vec3.subtractN(v2,v0);
            mat4.setRow(wtm,0,v1);
            mat4.setRow(wtm,1,v2);
            mat4.setRow(wtm, 2, vec3.crossN(v1,v2));

			for (j = 0; j < 2; j++)
			{
				var tj = j? t2 : t1;
                var x=tj[0]-t0[0],y=tj[1]-t0[1];
                var d=Math.sqrt(x*x+y*y);
                if(d){r[0]=x/d;r[1]=y/d;}
				mat4.setRow(ttm,j,r);
			}

			mat4.setRow(ttm, 2, Z);			
			mat4.setRow(ttm, 3, vzero);
			mat4.invert(ittm,ttm);
			
			mat4.m(wtm,ittm,ttm);vec3.normalize(ttm,v1);
			v2[0]=ttm[4];v2[1]=ttm[5];v2[2]=ttm[6];vec3.normalize(v2);
            
			sV(a,ra,i0,v1);
            sV(a,ra,i1,v1);
            sV(a,ra,i2,v1);
			sV(b,rb,i0,v2);
            sV(b,rb,i1,v2);
            sV(b,rb,i2,v2);
		}
		iv.normalizeArray(a);iv.normalizeArray(b);
		this.setBuffer('bn',iv.bufferF(this.gl,a,3));
		this.setBuffer('bt',iv.bufferF(this.gl,b,3));
	}
}



iv.mesh.prototype.preRender=function(ctx,node,tm,state,opacity)
{
    var space=ctx.space;
    if(this.url){
        var r = iv.createRequest(this.url);
        if(r){
            space.meshesInQueue++;
            r.ivobject=this;
            r.ivspace=space;
            iv.loadMesh(r);
            r.send();}
            delete this.url;
    }
    else{
        if(state&4){if(space.cfgSelZOffset)state|=0x20000;opacity*=space.clrSelection[4];}
        else if(space.anySelection && !(node.state&0x40000))opacity*=space.clrSelection[5];
        if(this.boxMin)ctx.toRenderQueue(tm,node,state,opacity);
    }
    return true;
}

iv.mesh.prototype.activateShader=function(space,mtl,info,shFlags) {
    if(!mtl)mtl=info.mtl;
	var s=space.activateMaterial(mtl,info,shFlags);
	var gl=space.gl;
	var _i=s.attrs,c=_i.length;
	for(var i=0;i<c;i++) {
		var v=_i[i];
		var b=null,f=gl.FLOAT,n=false;
		switch(v.id) {
			case 4300: b=this.vBuffer; break;
			case 4301: b=this.nBuffer; break;
			case 4302: b=this.uvBuffer; break;
			case 4306: b=this.uv2Buffer; break;
			case 4303: b=this.bnBuffer; break;
			case 4304: b=this.btBuffer; break;
			case 4305: b=this.cBuffer;f=gl.UNSIGNED_BYTE;n=true;break;
			case 4307: b=this.ceBuffer;f=gl.UNSIGNED_BYTE;n=true;break;
		}
		if(b){gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.vertexAttribPointer(v.slot,b.itemSize,f,n,0,0);}
	}
}

iv.mesh.prototype.render=function(space,info) {
	
	if(this.vBuffer) {
		var state=info.state;
		var gl=space.gl,f,F=8;
		if(state&iv.R_Z_NOWRITE) gl.depthMask(false);
		var rmode=space.rmodes[(state&0xff00)>>8];

        if (rmode.e){
            f=F;
            var m=rmode.e;
            this.updateEdges(gl); 
            if (this.eBuffer) {
                f|=(state&(iv.R_Z_OFFSET));
                if(m.offest)f|=0x20000;
                if(this.nBuffer && m.n) f|=1;
                this.activateShader(space,m.mtl,info,f);
			    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.eBuffer);
			    gl.drawElements(gl.LINES,this.eBuffer.numItems,gl.UNSIGNED_SHORT,0);
            }
		}

        if (rmode.f)
        {
        var m=rmode.f;
        var fb=this.fBuffer;
        if(fb){
            f=F;
			if(this.nBuffer && m.n) f|=1;
			if(this.uvBuffer) f|=2;
			if(this.uv2Buffer) f|=32;
			if(this.cBuffer) f|=4;
			if(this.ceBuffer) f|=64;
			if(this.bnBuffer) f|=16;
			if(state&iv.R_SELECTION) f|=256;            
            if(state&32)f|=512;
            if(info.opacity<1.0)f|=1024;
		    f|=(state&(iv.R_Z_OFFSET));
		    this.activateShader(space,m.mtl,info,f);

		    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,fb);
		    var o=fb.offset;
		    gl.drawElements(this.lineMode?gl.LINES:gl.TRIANGLES,fb.numItems,gl.UNSIGNED_SHORT,o?o:0);
		}
        }

		if(state&iv.R_Z_NOWRITE) gl.depthMask(true);
	}
}

iv.bufferImp=function (gl,type,v,cmp,n)
{
    var b = gl.createBuffer();
	gl.bindBuffer(type,b);
	gl.bufferData(type,v,gl.STATIC_DRAW);
	b.itemSize = cmp;
	b.numItems = n;
	return b;
}

iv.bufferUpdateF=function(gl,b,v)
{
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, v, gl.DYNAMIC_DRAW);
};

iv.bufferF=function (gl,v,cmp){
    if((!(v instanceof Float32Array)) && (!(v instanceof Uint8Array)))v=new Float32Array(v);
    return iv.bufferImp(gl,gl.ARRAY_BUFFER,v,cmp,v.length/cmp);
};
iv.bufferI=function(gl,v)
{
    if(!(v instanceof Uint16Array))v=new Uint16Array(v);
    return iv.bufferImp(gl,gl.ELEMENT_ARRAY_BUFFER,v,1,v.length);
}
iv.mesh.prototype.clear = function()
{
	this.setBuffer('uv',null);
	this.setBuffer('uv2',null);
	this.setBuffer('f',null);
	this.setBuffer('v',null);
	this.setBuffer('n',null);
	this.setBuffer('e',null);
	this.setBuffer('c',null);
	this.setBuffer('ce',null);
	this.setBuffer('bn',null);
	this.setBuffer('bt',null);
}
iv.mesh.prototype.calcBBox=function(va) {
    if(!va)va=this.points;
    if(!va)return;
	var count=va.length;
	if(count) {
		var vminx=va[0],vminy=va[1],vminz=va[2];
		var vmaxx=vminx,vmaxy=vminy,vmaxz=vminz,p;
		for(var i=3;i<count;i+=3) {
			p=va[i++];
			if(p<vminx) vminx=p; else if(p>vmaxx) vmaxx=p;
			p=va[i++];
			if(p<vminy) vminy=p; else if(p>vmaxy) vmaxy=p;
			p=va[i++];
			if(p<vminz) vminz=p; else if(p>vmaxz) vmaxz=p;
		}
		if(this.boxMin) {
			this.boxMin[0]=vminx;
			this.boxMin[1]=vminy;
			this.boxMin[2]=vminz;
		} else this.boxMin=[vminx,vminy,vminz];
		if(this.boxMax) {
			this.boxMax[0]=vmaxx;
			this.boxMax[1]=vmaxy;
			this.boxMax[2]=vmaxz;
		} else this.boxMax=[vmaxx,vmaxy,vmaxz];
	}
}
;iv.loadMesh=function (request)
{
	request.responseType = "arraybuffer";//binary
	request.onreadystatechange = function () {
		if (this.readyState == 4 && this.status==200) {// this not request here
			this.ivobject.load(this.ivspace,this.response );
			this.ivspace.onMeshLoaded(this.ivobject);
		}
	}
}
;iv.bitStream=function(dv,dvpos)
{
	this.st=dv;
	this.stpos=dvpos;
	this.m_b=0;
	this.m_pos=0;
};
iv.bitStream.prototype.read = function(b)
{
	var r=0;
	while(b)
	{
		if(!this.m_pos){this.m_b=this.st.getUint8(this.stpos++);this.m_pos=8;}
		var t=b;
		if(t>this.m_pos)t=this.m_pos;
		r<<=t;
		r|=(this.m_b&0x0ff)>>(8-t);
		this.m_b<<=t;
		b-=t;
		this.m_pos-=t;
	}
	return r;
}

iv.mesh.prototype.numBits=function(index)
{
	var i=0;
	while(index){index>>=1;i++;}
	return i;
}

iv.mesh.prototype.ivdcmpf=function(cmp,v,c)
{
	var index=0,k=0,code=0;
	while(k<c)
	{
		code=cmp.read(2);
		if(code==0){v[k]=index;index++;}else
		{
			code<<=1;
			code|=cmp.read(1);
			if(code==4)v[k]=v[k-1]+1;else
			if(code==5)v[k]=v[k-cmp.read(4)-2];else
			if(code==6)v[k]=cmp.read(this.numBits(index));else
			if(code==7)//op_delta
			{
				var sign=cmp.read(1);
				var delta=cmp.read(5);
				if(sign)delta*=-1;
				v[k]=v[k-1]+delta;
			}else
			{
				var j=k-(cmp.read(code==2?4:13)+1);
				var _v1,_v2;
				if(j%3 || (j>=(k-2))){_v1=j;_v2=j-1;}else{_v2=j+2;_v1=j;}
				v[k]=v[_v1];
				v[k+1]=v[_v2];
				k++;
			}
		}
		k++;
	}
};
iv.mesh.prototype.dcdnrml=function(d,i,n,j)
{
	var nx,ny,nz,k,l;
	var a=9.5875262183254544e-005*d.getUint16(i,true);
	var b=4.7937631091627272e-005*d.getUint16(i+2,true);
	k=Math.sin(b);
	nx=Math.cos(a)*k;
	ny=Math.sin(a)*k;
	nz=Math.cos(b);
	l=Math.sqrt(nx*nx+ny*ny+nz*nz);//normalize, in order to avoid rounding 
	nx/=l;ny/=l;nz/=l;
	n[j]=nx;j++;n[j]=ny;j++;n[j]=nz;
}

iv.mesh.prototype.copyn=function (v,_n,i,j)
{
	i*=3;j*=3;
	v[i]=_n[j];
	v[i+1]=_n[j+1];
	v[i+2]=_n[j+2];
};

iv.mesh.prototype.copyn_i=function (v,_n,i,j)
{
	i*=3;j*=3;
	v[i]=-_n[j];
	v[i+1]=-_n[j+1];
	v[i+2]=-_n[j+2];
};

iv.mesh.prototype.readCmp = function(a,b,count,c,s,pos,box)
{
    var min=a.getFloat32(pos+c*4,true);
    var dx=a.getFloat32(pos+c*4+s*4,true);
    if(box){this.boxMin[c]=min;this.boxMax[c]=min+dx*65535;}
    pos+=s*8+c*2;
    for(var i=0;i<count;i++)
    {
        b[c]=dx*a.getUint16(pos,true)+min;pos+=s*2;
        c+=s;
    }
}

iv.mesh.prototype.autoNormals=function(n,v,f)
{
    var c=f.length,e1=[],e2=[],N=[],i,j;

    for(i=0;i<c;i+=3)
    {
        var i0=f[i]*3,i1=f[i+1]*3,i2=f[i+2]*3;
        for(j=0;j<3;j++)
        {
            var a=v[i0+j];
            e1[j]=v[i1+j]-a;
            e2[j]=v[i2+j]-a;
        }
        vec3.crossN(e1,e2,N);
        for(j=0;j<3;j++)
        {
            a=N[j];
            if(a){
            n[i0+j]+=a;
            n[i1+j]+=a;
            n[i2+j]+=a;
        }}
    }
    c=v.length;
    for(i=0;i<c;i+=3)
    {
        c=n[i],d=n[i+1],e=n[i+2],g=Math.sqrt(c*c+d*d+e*e);
        n[i] =c/g;
        n[i+1]=d/g;
        n[i+2]=e/g;
    }
};

iv.mesh.prototype.load = function(space,buffer) 
{
    this.boxMin=[];this.boxMax=[];
	var data= new DataView(buffer);
	var numPoints=data.getUint16(0,true);
	var nF=data.getUint16(2,true);
	var flags=data.getUint16(4,true);
    if(flags&0x400)nF+=65536;
	var offset=30+numPoints*6,n3=numPoints*3;		

	if(flags&8){this.lineMode=true;nF*=2;}else nF*=3;

	// vertices
	var v=new Float32Array(n3);
    this.readCmp(data,v,numPoints,0,3,6,true);
    this.readCmp(data,v,numPoints,1,3,6,true);
    this.readCmp(data,v,numPoints,2,3,6,true);
	this.setPoints(v,space.cfgKeepMeshData&2||this.keepPoints);


	var index=0,i;
	// faces
	var f=new Uint16Array(nF);
	if(flags&256)
	{
		var bs=new iv.bitStream(data,offset);
		this.ivdcmpf(bs,f,nF);
		offset=bs.stpos;
	}else{
	if(flags&4)
	{
		for(i=0;i<nF;i++)f[i]=data.getUint8(offset++);
	}else
	{
		for(i=0;i<nF;i++)
		{
			f[i]=data.getUint16(offset,true);offset+=2; 
		}}
	}
	this.setFaces(f,(space.cfgKeepMeshData&1));
	//normals
	if(flags&16)
	{
        var n=new Float32Array(n3);
		var cs=data.getUint16(offset,true);offset+=2;        
        if(flags&0x800)
        {
            this.autoNormals(n,v,f);
            if(cs){
            var bb=data.getUint8(offset);offset++;
            var offsetn=offset+cs;
            if(!bb)offsetn+=cs;
            for(i=0;i<cs;i++)
			{   
                if(bb)
                    index+=data.getUint8(offset+i,true);
                else
                    index+=data.getUint16(offset+i*2,true);
				this.dcdnrml(data,offsetn+4*i,n,index*3);
			}
            offset=offsetn+cs*4;            
            }
        }else{
		if(cs)
		{
			var _n=new Float32Array(cs*3);
			for(i=0;i<cs;i++)
			{
				this.dcdnrml(data,offset,_n,i*3);
				offset+=4;
			}
		var bs=new iv.bitStream(data,offset);
		i=0;var j=0,ibits=0;
		while(i<numPoints)
		{
			var cd=bs.read(1);
			if(cd)
			{
				cd=bs.read(1);
				if(ibits)index=bs.read(ibits);else index=0;
				if(cd)this.copyn(n,_n,i,index);else this.copyn_i(n,_n,i,index);
			}else
			{
				ibits=this.numBits(j);
				this.copyn(n,_n,i,j);j++;
			}
			i++;
		}
		offset=bs.stpos;
		}else{
		for(i=0;i<numPoints;i++)
		{
			this.dcdnrml(data,offset,n,i*3);
			offset+=4;
		}}
        }
		this.setNormals(n,this.keepNormals);
	}
	
	if(flags&32)// UV
	{
        var uv=new Float32Array(numPoints*2);
        this.readCmp(data,uv,numPoints,0,2,offset);
        this.readCmp(data,uv,numPoints,1,2,offset);
        offset+=numPoints*4+16;
		this.setUV(uv);
	}
	if(flags&0x200)// UV2
    {
        var uv2=new Float32Array(numPoints*2);
        this.readCmp(data,uv2,numPoints,0,2,offset);
        this.readCmp(data,uv2,numPoints,1,2,offset);
        offset+=numPoints*4+16;
        this.setUV2(uv2);
    }
	
	
	if(flags&64)// per vertex diffuse colors
	{
		var colors = new Uint8Array(n3);
		for(i=0;i<n3;i++)colors[i]=data.getUint8(offset++);
		this.setBuffer('c',iv.bufferF(this.gl,colors,3));
	}
	if(flags&128)// per vertex emissive colors
	{
		var colors = new Uint8Array(n3);
		for(i=0;i<n3;i++)colors[i]=data.getUint8(offset++);
		this.setBuffer('ce',iv.bufferF(this.gl,colors,3));
	}
	     

	if(this.bump){this.updateBumpInfo(f,v,n,uv);delete this.bump;}

}
