
iv.space=function (view,gl){
	
	this.gl=gl;
	this.window=view;
    this.spaceId=view.spaceId;
    view.spaceId++;
	this.root=null;
	this.view=null;
	this.materials=[];
    

    this.cfgTextures=true;
	this.cfgDbl=true;
	this.cfgKeepMeshData=3;// & 1 - faces, & 2 - vertices
	this.cfgDefMtl=null;
	this.cfgSelZOffset=false;
	this.cfgRMode=0;
    this.clrSelection=view.clrSelection;
    this.anySelection=false;
    this.stdLights=false;

	// each item f - faces, e - edge, n - normals, mtl - custom material
	this.rmodes=[//render modes
	    {f:{n:true}},//solid mode
	    {f:null,e:{n:true}}//wireframe
    ];

	this.lights=[];
	this.activeShader=null;
	this.projectionTM = mat4.create();
	this.modelviewTM = mat4.create();	
	this.meshesInQueue=0;
	if(gl){
		this.e_ans = (gl.getExtension('EXT_texture_filter_anisotropic') ||gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'));

    var e=gl.getExtension("EXT_blend_minmax");
    this.e_alpha_blend=e?e.MAX_EXT:gl.FUNC_ADD;

	if(this.e_ans)	
	   this.e_ansMax = gl.getParameter(this.e_ans.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
	}
}

iv.space.prototype.onMeshLoaded=function(m)
{
	this.meshesInQueue--;
	if(!this.meshesInQueue)
	{
	var w=this.window;
	if(w && w.onMeshesReady)
		w.onMeshesReady(w,this);
	}
	this.invalidate();
};

// update shader inputs
iv.space.prototype.updateShadeArgs=function(a){
	var gl=this.gl,i;
	var p=this.activeShader;
	var ca=(p)?p.attrs.length:0,na=a?a.attrs.length:0;//current attributes, new attributes

	if(na>ca) //enable the missing attributes
	{
		for(i=ca;i<na;i++) gl.enableVertexAttribArray(i);
	}
	else if(na<ca) //disable the extra attributes
	{
		for(i=na;i<ca;i++) gl.disableVertexAttribArray(i);
	}

	ca=p?p.textures.length:0;
	for(i=0;i<ca;i++) {
		gl.activeTexture(gl.TEXTURE0+i);
		var txt=p.textures[i];
		var type=txt.txt.ivtype;
		gl.bindTexture(type===undefined?gl.TEXTURE_2D:type,null);
	}
}

iv.space.prototype.activateShader = function(s,info,flags)
{
	if(s!=this.activeShader)
		this.updateShadeArgs(s);
	if(s)s.activate(this,info,flags,s==this.activeShader);
	else this.gl.useProgram(null);
	this.activeShader=s;
}

iv.space.prototype.activateMaterial = function(m,info,flags)
{
	var s=m?m.getShader(flags):0;
	if(s && !s.bValid)
	{
		if(this.activeShader)this.activateShader(null,null);// disable material
		s.update(m);
	}
	this.activateShader(s,info,flags);
	return s;
}

iv.bk3d=function(space,txt)
{
	var gl=space.gl;
    this.uv=new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1]);
	this.uvBuffer=iv.bufferF(gl,this.uv,2);
	this.vBuffer=iv.bufferF(gl,[-1.0,-1.0, 0.0,1.0, -1.0, 0.0,-1.0,1.0, 0.0,-1.0,1.0, 0.0,1.0,-1.0, 0.0,1.0,1.0,0.0],3);
	var mtl=new iv.material(space);
	var d={wrapS:gl.CLAMP_TO_EDGE,wrapT:gl.CLAMP_TO_EDGE};
        if(typeof txt==='number')d.inline=txt;else d.texture=txt;
	mtl.load({emissive:d});
	this.mtl=mtl;
	this.texture=mtl.emissive[0].texture;
}
iv.space.prototype.drawBk=function() {

	if(this.bk&&this.bk.texture.ivready) {
		var gl=this.gl,wnd=this.window;
		if(wnd.viewportHeight&&wnd.viewportWidth) {
			gl.clear(gl.DEPTH_BUFFER_BIT);
			var bk=this.bk;
			var b=null;
			var w=512,h=512;
			var img=bk.texture.image;
			if(img && img.naturalWidth)w=img.naturalWidth;else if(bk.texture.width)w=bk.texture.width;
			if(img && img.naturalHeight)h=img.naturalHeight;else if(bk.texture.height)h=bk.texture.height;

			var s=this.activateMaterial(bk.mtl,{opacity:1.0},2);
			for(var i=0;i<s.attrs.length;i++) {
				var v=s.attrs[i];				
				switch(v.id) {
					case 4300: b=bk.vBuffer; gl.bindBuffer(gl.ARRAY_BUFFER,b); break;
					case 4302: {b=bk.uvBuffer;
						gl.bindBuffer(gl.ARRAY_BUFFER,b);

					} break;
				}

				if(b) gl.vertexAttribPointer(v.slot,b.itemSize,gl.FLOAT,false,0,0);
			}
			gl.disable(gl.DEPTH_TEST);
			gl.depthMask(false);
			gl.drawArrays(gl.TRIANGLES,0,6);
			gl.enable(gl.DEPTH_TEST);
			gl.depthMask(true);
			return true;
		}
	}
	return false;
}

iv.space.prototype.invalidate = function(f){this.window.invalidate(f);}
iv.handleLoadedTexture=function (t) {
    var t=this.ivtexture;
    var s=t.ivspace;
	if(this.naturalWidth>0 && this.naturalHeight>0)
	{
		var type=t.ivtype;
		var gl=s.gl;
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(type, t);
		gl.texImage2D(type, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
		var pot=iv.isPOW2(this.naturalWidth)&&iv.isPOW2(this.naturalHeight);
		gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, pot?gl.LINEAR_MIPMAP_NEAREST:gl.LINEAR);
		if(pot)gl.generateMipmap(type);
		gl.bindTexture(type, null);
		t.ivready=true;
		t.ivpot=pot;
		
	}else t.ivfail=true;
	delete this.ivtexture;
	delete t.ivspace;
    if(t.ivinline)
	  URL.revokeObjectURL(this.src);
	s.checkTextures();
	s.invalidate();
}
iv.handleLoadedCubeTexture=function ()
{
	var t=this.ivtexture,s=t.ivspace,gl=s.gl;
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, t);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
	gl.texImage2D(this.ivface, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	t.ivnumfaces++;
	if(t.ivnumfaces==6)
	{
		t.ivready=true;
		s.checkTextures();
		s.invalidate();		
		delete t.ivspace;
	}
	delete this.ivtexture;
       if(t.ivinline)
	  URL.revokeObjectURL(this.src);

};

// no insertion into list
iv.space.prototype.checkTextures = function()
{
   var _i=this.window.textures,l=0,f=0;
   for(var i=0;i<_i.length;i++)
	{
		var t=_i[i];
		if(t.ivready||t.ivfail)l++;
        if(t.ivfail)f++;
	}
this.window.notify('textures',{loaded:l,total:_i.length,failed:f,queue:_i.length-l});	
}
iv.space.prototype.getTexture = function(str,type,mtl) {	
	var t,_i=this.window.textures,gl=this.gl;
	for(var i=0;i<_i.length;i++)
	{
		t=_i[i];
		if((t.ivfile==str) && (t.ivtype==type)){t.ivrefcount++;return t;}
	}
	t = this.gl.createTexture();
	t.ivspace=this;
	t.ivready=false;
	t.ivfile=str;
	t.ivtype=type;
	t.ivrefcount=1;
    var path=(mtl && mtl.path)?mtl.path:this.path;
	if(type==gl.TEXTURE_CUBE_MAP)
	{
	var faces = [["posx", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
	["negx", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
	["posy", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
	["negy", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
	["posz", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
	["negz", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];

	t.ivnumfaces=0;
	var _str=str.split(".");
	if(path)_str[0]=path+_str[0];
		for(var i=0;i<6;i++)
		{
			var filename=_str[0]+faces[i][0]+"."+_str[1];
			var image = new Image();
			image.ivtexture=t;
			image.ivface=faces[i][1];
			image.onload=iv.handleLoadedCubeTexture;
			image.src=filename;
		}
	}else
    if(str=='*camera'){if(iv.HandleCameraTexture)iv.HandleCameraTexture(t);}
	else
    {
    t.image = new Image();
    t.image.setAttribute('crossOrigin', 'anonymous')
	t.image.ivtexture=t;
    t.filter=iv.FILTER_MIPMAP;
	t.image.onload=iv.handleLoadedTexture;
	t.image.src=path?path+str:str;
	}
	_i.push(t);
	return t;
}
iv.space.prototype.newMaterial=function(n){
	var mtl=new iv.material(this);
	this.materials.push(mtl);
    var t=typeof n;
	if( t=='string') mtl.name=name; 
    else
    if( t=='object') mtl.load(n);
	return mtl;
}

iv.space.prototype.merge=function(s) {
    if(s.root) { 
        var _b=s.anims,i,_i;
        if(_b)
        {
            if(this.anims && this.anims.length)
            {
                var _a=this.anims,_al=_a.length,maxId=0,a;
                for(i=0;i<_al;i++)
                {
                    a=_a[i];
                    if(a.id>maxId)maxId=a.id;
                }
                for(i=0;i<_b.length;i++)
                {
                    var b=_b[i];
                    if(b.name)
                    {
                        for(var j=0;j<_al;j++)
                        {
                            a=_a[j];
                            if(a.name==b.name)break;
                            a=null;
                        }
                    }
                    if(a)
                        s.replaceAnimId(b.id,a.id);
                    else {
                        _a.push(b);
                        maxId++;
                        s.replaceAnimId(b.id,maxId);
                    }
                }            
            }else this.anims=_b;
            s.anims=null;
            _i=s.views;
            if(_i)
            for(i=0;i<_i.length;i++)
            {
                if(!this.views)this.views=[];
                this.views.push(_i[i]);
            }
        }
        var n=s.root;
        this.root.insert(n);// check refcounts
        s.root=null;

        _i=s.materials;
        if(_i) {
            for(i=0;i<_i.length;i++) {
                var m=_i[i];
                m.space=this;
                this.materials.push(m);
            }
        }

        this.invalidate();
        return n;
    }
    return null;
};

iv.space.prototype.getBinData=function(b,i){return new Uint8Array(b,i.pos,i.szCmp);}
iv.space.prototype.loadBin=function(buffer)
{
	var data= new DataView(buffer),ms=[],is=[],l=data.byteLength,i=0,root=null;
	while(i<l)
	{
		var id=data.getUint32(i,true),a=(id>>24)&0xff;
		var d={pos:i+12,id:id,sz:data.getUint32(i+4,true),szCmp:data.getUint32(i+8,true)};
		if(a==2){
            d.format=data.getUint16(i+12,true);
			is[id&0xffffff]=d;
        }
        else
		if(a==1)
			ms[id&0xffffff]=d;
		else
		if(id==0x746f6f72)root=d;
		i+=d.szCmp+12;
	}
	if(root)
	{
	var _data=this.getBinData(buffer,root),text=ZIP.inflateStr(_data,root.sz),js=JSON.parse(text);
	if(js && js.space)
	{
        for(i=1;i<is.length;i++)this.loadInlineTexture(data,is[i],i);
		var d={objects:[],textures:is};l=ms.length;

        for(i=0;i<l;i++)d.objects.push(new iv.mesh(this.gl));
        this.loadImp(js,d);
		for(i=0;i<l;i++)
		{
			var info=ms[i];
			d.objects[i].load(this,ZIP.inflateBin(this.getBinData(buffer,info),info.sz));
		}
	}
	}
}
iv.space.prototype.loadInlineTexture=function(data,info,index) 
{
    var buffer=data.buffer,pos=info.pos+2;
    var gl=this.gl,t=gl.createTexture();
    t.ivinline=true;
    t.ivready=false;
    t.ivfile="?s"+this.spaceId+"i"+index;
    t.ivspace=this;
    t.ivrefcount=0;
    this.window.textures.push(t);
    var utype={type: info.format&1?'image\/jpeg':'image\/png'};
    if(info.format&0x100)
    {
       t.ivnumfaces=0;
       t.ivtype=gl.TEXTURE_CUBE_MAP;
       var faces=[gl.TEXTURE_CUBE_MAP_POSITIVE_X,gl.TEXTURE_CUBE_MAP_NEGATIVE_X,gl.TEXTURE_CUBE_MAP_POSITIVE_Y,gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,gl.TEXTURE_CUBE_MAP_POSITIVE_Z,gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
	for(var i=0;i<6;i++)
		{
		    var size=data.getUint32(pos,true);pos+=4;
			var arrayBufferView = new Uint8Array(buffer,pos,size);
			pos+=size;
			var blob = new Blob([arrayBufferView], utype);
			var url = URL.createObjectURL(blob),image = new Image;
			image.ivtexture=t;
			image.ivface=faces[i];
			image.onload=iv.handleLoadedCubeTexture;
			image.src=url;
		}
    }else{
    var arrayBufferView = new Uint8Array(buffer,pos,info.szCmp-2);
    var blob = new Blob([arrayBufferView], utype);
    var url = URL.createObjectURL(blob),img = new Image;
    img.onload = iv.handleLoadedTexture;
    t.ivtype=gl.TEXTURE_2D;
    t.image=img;
    img.ivtexture=t;
    t.filter=iv.FILTER_MIPMAP;
    img.src = url;
   }
}

iv.space.prototype.loadImp=function(data,d) {
	var s=data.space,i,a;
	d.materials=[];d.space=this;
	if(s.materials)
		for(i=0;i<s.materials.length;i++) {
			var mtl=this.newMaterial(s.materials[i]);
			d.materials.push(mtl);
		}
    if(s.views) this.views=s.views;
	if(s.root) {
		if(!this.root) this.root=new iv.node();
		this.root.load(s.root,d);
	}
    if(s.anims){
        this.anims=s.anims;
        for(i=0;i<s.anims.length;i++)
        {
            a=s.anims[i];
            if(a.active)
            {
                this.activateAnimation(a);
                break;
            }
        }    
    }
    var tm=this.unitMatrix=mat4.identity(mat4.create());
    if(s.bbox)
    {
     mat4.setScale(tm,s.bbox[0]);
     tm[12]=s.bbox[1];
     tm[13]=s.bbox[2];
     tm[14]=s.bbox[3];
    }

    if(s.view){
        a=s.view;
        this.view={from:a.from||a.org,to:a.to||a.target,up:a.up};
	    if(a.fov)this.view.fov=a.fov;
        if(a.viewScale)this.view.scale=a.viewScale;
        if(a.camera)this.view.camera=this.root.searchId(a.camera)
    }
    if(s.config)
    {
        var c=s.config;
        for(var v in c)
        {
            switch(v)
            {
            case "bkfaces":this.cfgDbl=c[v];break;
            }
        }
    }

     if(d.skins)	
	 for(i=0;i<d.skins.length;i++)d.skins[i].post(this);
    
	if(s.bkinline)
			this.bk=new iv.bk3d(this,s.bkinline);
	else
	if(s.bk!=undefined)
		this.bk=new iv.bk3d(this,s.bk);
}

iv.space.prototype.load=function(data){
	if(data && data.space) {
			var m=data.space.meshes;
			var d={ objects:[]};
			if(m)
				for(var i=0;i<m.length;i++) {
					var obj=new iv.mesh(this.gl);
					if(this.path)
						obj.url=this.path+m[i].ref;
					else obj.url=m[i].ref;
					d.objects.push(obj);
				}
			this.loadImp(data,d);
		}
};

iv.space.prototype.renderQueue=function(items)// t transparency
{
	var c=items.length;
	var a;
	var gl=this.gl;
	for(var i=0;i<c;i++){
		var b=items[i],d=(b.state&32)!=0;
		if(d!=a) {
			if(d) gl.disable(gl.CULL_FACE); else gl.enable(gl.CULL_FACE);
			a=d;
		}
		b.object.render(this,b);
	};
}

iv.space.prototype.updatePrjTM=function(ctx) {
    var wnd=this.window,V=wnd.view,gl=this.gl,bOk=false,far=0,near=0;
    
    for(var iPass=1;iPass<ctx.q.length;iPass++) {
        var q=ctx.q[iPass],c=q.L;
        if(!c)continue;
        var items=q.I;
        for(var iO=0;iO<c;iO++) {
            var d=items[iO];
            if(bOk)
            {
                if(d.near<near)near=d.near;
                if(d.far>far)far=d.far;
            }else {far=d.far;near=d.near;bOk=true};
        }
    }
    var kx=wnd.viewportWidth/wnd.viewportHeight;
    if(V.ortho)
    {
        var ky=1,scale=V.scale;
        if(this.unitMatrix)scale/=this.unitMatrix[0];
        kx/=scale;
        ky/=scale;
        mat4.ortho(-kx,kx,-ky,ky,near,far,this.projectionTM);
    }else{
        if(bOk) {
            var d=far-near;
            d/=100;far+=d;near-=d;// some guard distance
            d=far/1000;
            if(near<d) near=d;// avoid Z buffer corruption
        } else {
            near=0.1; far=100;
        }
        mat4.perspective(V.fov,kx,near,far,this.projectionTM);
    }
};


iv.space.prototype.zCompareFunc=function(a, b) {
	var _a = a ? a.near : -1e38, _b = b ? b.near : -1e38;
	if (_a > _b) return -1; if (_a < _b) return 1; return 0;
};

iv.space.prototype.prepareLights=function() {
    var changes=false,_i=this.lights;
    var d=_i.length-this.currentLight;
    if(d) { _i.splice(this.currentLight,l); changes=true; }
    var org=[0,0,0];
    for(i=0;i<_i.length;i++) {
        var l=_i[i],L=l.light;
        if(L.type!==l.type) { l.type=L.type; changes=true; }
        l.color=L.color;
        if(L.type!=1) {
            if(l.tm) l.org=mat4.mulPoint(l.tm,org,[]); else l.org=org;
        }
        if(L.target)
        {
        if(!l.dir)l.dir=[];
        if(!l.targetNode || (L.target!=l.tagert))l.targetNode=this.root.searchId(l.tagert=L.target);
        
        if(l.targetNode)
        {
            var wtm=l.targetNode.getWTM();
            if(wtm)
                mat4.getTranslate(wtm,l.dir);
            else vec3.cpy(l.dir,[0,0,0]);
            mat4.mulPoint(this.unitMatrix,l.dir,l.dir);
            vec3.subtractN(l.dir,l.org);            
        }

        }else{
        var dir=L.dir;
        if(dir=="camera")l.dir=this.window.view.getViewVector(l.dir);
	    else
        if(l.tm){
            if(dir) l.dir=mat4.mulVector(l.tm,dir,[]); 
        } else {
            if(dir) l.dir=dir.slice();
        }
        if(l.dir)vec3.normalize(l.dir);
        }        
        if(l.type==2)
        {
            if(!l.spot)l.spot=[0,0,0];
            var cin=Math.cos(L.inner/2),cout=Math.cos(L.outer/2);
            l.spot[0]=cin;
            l.spot[1]=cout;
        }
    }
    if(changes)this.invalidateMaterials();
}
iv.space.prototype.invalidateMaterials=function()
{
     var _i=this.materials;
     for(var i=0;i<_i.length;i++) _i[i].invalidate();
}

iv.space.prototype.render=function(ctx) {
    if(this.root) {
        mat4.copy(ctx.mvMatrix,this.modelviewTM);
        var gl=this.gl,astate=this.cfgRMode<<8,i;        
        if(this.cfgDbl)astate|=32;
        gl.cullFace(gl.BACK);
        this.currentLight=0;
        this.root.traverse(ctx,this.unitMatrix,astate,1.0);
        if(!this.stdLights)
            this.prepareLights();
        this.updatePrjTM(ctx);
        var blend=false;
        for(i=1;i<ctx.q.length;i++) {
            var q=ctx.q[i],L=q.L;
            if(!L)continue;
            var _i=q.I;
            if(_i.length>q.L)_i.splice(q.L, _i.length-q.L);
            if(i>3)
            {
                if(!blend)
                {
                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);

                    if(ctx.window.bkColor===null)gl.blendEquationSeparate(gl.FUNC_ADD, this.e_alpha_blend);

                    blend=true;
                }
                if(i>=7)gl.clear(gl.DEPTH_BUFFER_BIT);
                _i.sort(this.zCompareFunc);
            }
            this.renderQueue(_i);
            q.L=0;
        }
        if(blend)gl.disable(gl.BLEND);
        this.activateMaterial(null);//reset state
    }
};

iv.space.prototype.getMaterial=function(name){
	var it=this.materials;
	for(var i=0;i<it.length;i++) {
		var m=it[i];
		if((m.name!==undefined)&&m.name==name) return m;
	}
	return null;
}

iv.space.prototype.replaceAnimId=function(a,b)
{
    if(a==b)return;
    if(this.root)this.root.replaceAnimId(a,b);
    var _i=this.materials,i;
    for(i=0;i<_i.length;i++)
        _i[i].replaceAnimId(a,b);
    _i=this.views;
    if(_i)
    {
        for(i=0;i<_i.length;i++)
        {
            var v=_i[i];
            if(v.anim && v.anim.id==a)v.anim.id=b;
        }    
    }
}
iv.space.prototype.setTime = function(t)
{
    if(this.anim&&this.anim.snap)
    {
        var a=Math.round(t*this.anim.fps);
        t=a/this.anim.fps;
    }
    if(this.root)this.root.setTime(t);
    var _i=this.materials;
    for(var i=0;i<_i.length;i++)
        _i[i].setTime(t);
}
iv.space.prototype.activateAnimation=function(a)
{
    if(typeof a=='number')a=this.getAnimation(a);
    else if(iv.indexOf(this.anims,a)<0)a=this.getAnimation(a.id);
    this.anim=a;
    if(this.root)this.root.activateAnimation(a);
    var _i=this.materials;
    for(var i=0;i<_i.length;i++)_i[i].activateAnimation(a);
}

iv.space.prototype.getAnimation =function(id)
{
    var _i=this.anims,i;
    if(_i){
    for(i=0;i<_i.length;i++)
    {
        var a=_i[i];
        if(a.id==id)return a;
    }}
    return null;
}
