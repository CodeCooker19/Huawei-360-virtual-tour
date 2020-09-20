var iv={
INV_MTLS:2,
INV_VERSION:4,

VIEW_TRANSITION:1,
VIEW_UNDO:2,
VIEW_INVALIDATE:4,

VIEW_ANIM_SET:8,
VIEW_ANIM_PLAY:16,


R_SELECTION:4,  
R_Z_NOWRITE:16,
R_Z_OFFSET:0x30000,// available in render queue item only
R_CLIP:    0xc0000,// number of clip planes

FILTER_LINEAR:1,
FILTER_MIPMAP:2,
FILTER_BOX:3,

createRequest:function (f,p){
	if(f==undefined)return null;
	var r = new XMLHttpRequest();
	r.open("GET", p?(p+f):f);
	return r;
},
anim:{},
indexOf:function (a,b){var c=a.length,i;for(i=0;i<c;i++){if(a[i]==b)return i;}return -1;},
any:function(a,b){return (a==undefined)?b:a;},
mtlChannels:["diffuse","specular","emissive","reflection","bump","opacity","lightmap"],
isPOW2:function(v){return (v&(v-1))==0;},
convertMatrix:function(a){var tm=mat4.identity(mat4.create()),k=0,i,j;for(i=0;i<4;i++)for(j=0;j<3;j++)tm[i*4+j]=a[k++];return tm;},
getV:function (a,i,v){v[0]=a[i*3];v[1]=a[i*3+1];v[2]=a[i*3+2];},
};

