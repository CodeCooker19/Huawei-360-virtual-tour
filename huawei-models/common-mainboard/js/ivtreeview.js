iv.treeView=function(div,wnd,size)
{
    if(!size)size=16;
    this.div=div;
    this.view3d=wnd;
    this.size=size;
    var tree=this;
    this._doSelect=function(event){tree.doSelect(this,event);};
    this._doDblClickItem=function(event){tree.doDblClickItem(this,event);};
    this._doToggleVisibility=function(event){tree.doToggleVisibility(this);};
    this._doToggleExpand=function(event){tree.doToggleExpand(this);};
    div.onclick=function(event){if(wnd.space)wnd.space.select(null);}
}

iv.treeView.prototype.getNodeFromItem=function (obj) {
    if(obj.ivnode)return obj.ivnode;
    var item=obj.parentNode;
    if(item.className.indexOf("gitem")>=0) item=item.parentNode;
    return item.ivnode;
}


iv.treeView.prototype.isGroup=function(item)
{
	return (item.className.indexOf('group')>=0);
}

iv.treeView.prototype.groupGetGitem=function(item)
{
	_item=item.firstChild;// must be gitem
	while(_item && (_item.className.indexOf('gitem')<0))_item=_item.nextSibling;
	return _item;
}

iv.treeView.prototype.searchItem=function(node,bExpand)
{	
	var item;
	if(node.parent && node.parent.parent)item=this.searchItem(node.parent,bExpand);else {item=this.div;}
	if(item)
	{
		if(item.className=='group-c')this.doToggleExpandImp(item);
		if(item.className=='group')item=this.getGroupItems(item);
		if(!item)return null;
		var _item=item.firstChild;
		while(_item)
		{
			if(_item.ivnode && _item.ivnode==node)
				return _item;
			_item=_item.nextSibling;
		}
	}
	return null;
}

iv.treeView.prototype.ensureVisible=function(item)
{
  var y=item.offsetTop,se=this.div;
  y-=se.offsetTop;
  if(y<se.scrollTop){se.scrollTop=y;return ;}
  var height = se.clientHeight;
  y+=this.size;
  if(y>(se.scrollTop+height))
  	se.scrollTop=y-height;
};

iv.treeView.prototype.removeSelection=function (item)
{
	var item=item.firstChild;
	while(item)
	{
		var _item=item;
		if(this.isGroup(item))
		{
			var items=this.getGroupItems(item);
			if(items)
			this.removeSelection(items);
			_item=this.groupGetGitem(item);
		}
		if(_item && !(item.ivnode.state&4) ){
		var index=_item.className.indexOf(" selected");
		if(index>=0){
			_item.className=_item.className.replace(" selected","").trim();
		}}
		item=item.nextSibling;
	}
}


iv.treeView.prototype.doToggleVisibility=function(obj)
{ 
    var node=this.getNodeFromItem(obj);
   if(node)
   {
    var s;
    if(obj.className=='vis'){obj.className='hdn';s=0;}else
    {obj.className='vis';s=3;}
    node.setState(s,3);
    this.view3d.invalidate();
   }
};


iv.treeView.prototype.doDblClickItem=function (obj,event) {
    var node=this.getNodeFromItem(obj);
    if(node) {
        if(node.object instanceof iv.camera)
        {
        var c=node.object;
        var wtm=node.getWTM();
        var d={from:c.from.slice(),to:c.to.slice(),up:c.up.slice()};
        if(wtm)
        {
            mat4.mulPoint(wtm,d.from);
            mat4.mulPoint(wtm,d.to);
            mat4.mulPoint(wtm,d.up);
        }
	if(c.fov)d.fov=c.fov;else d.fov=this.view3d.fov;
        this.view3d.setView(d,iv.VIEW_TRANSITION);
        }
    }
    if(event.preventDefault)event.preventDefault();
    event.stopPropagation();
}


iv.treeView.prototype.doSelect=function(obj,event)
{
   var node=this.getNodeFromItem(obj);
   if(node)
   {
       var s=this.view3d.space;
       if(!(event.shiftKey && s.selectRange(node,s.selNode)))
        s.select(node,true,event && event.ctrlKey!=0);
   }
    if(event.preventDefault)event.preventDefault();
    event.stopPropagation();
}

iv.treeView.prototype.getGroupItems=function (group)
{
	var listItems=group.getElementsByClassName("items");
	if(listItems && listItems.length)
		return listItems[0];
	return null;
}

iv.treeView.prototype.doToggleExpandImp=function(group)
{
	if(group.className=='group')group.className='group-c';
	else {
	group.className='group';
	this.getGroupItems(group);
	var items=this.getGroupItems(group);
         if(items && !items.firstChild)
          {
            var node=group.ivnode;
	        this.expandNode(items,node)
          }
	}
}

iv.treeView.prototype.doToggleExpand=function (obj){this.doToggleExpandImp(obj.parentNode.parentNode);}



iv.treeView.prototype.newIcon=function(parent,node) 
{
    var _icon=document.createElement('span');
    //_icon.onclick=this._doSelect;
    //_icon.ondblclick=this._doDblClickItem;
    var id=8;
    if(!node.firstChild)
    {
    if(node.object)
    {
     if(node.object instanceof iv.light)
	id=11;		
       else
    if(node.object instanceof iv.camera)
	id=12;
else id=10;
    }
 }
    _icon.style.backgroundPosition="-"+id*this.size+"px 0px";
    _icon.className="node";

    var label=document.createElement('span');
    label.className="label";
    //label.onclick=this._doSelect;
    //label.ondblclick=this._doDblClickItem;
    var name=node.name;
    if(!name)
    {
        if(node.firstChild)name="Group";else name="Object";
    }
    label.innerHTML=name;
     
    var div=document.createElement('div');

    div.className=node.state&4?"selected":"normal";
    div.appendChild(_icon);
    div.appendChild(label);
    
    parent.ondblclick=this._doDblClickItem;
    parent.onclick=this._doSelect;

    parent.appendChild(div);
    return div;
}

iv.treeView.prototype.newTreeItem=function(parent,node,bGroup) {
   
    var item=document.createElement('div');
    item.ivnode=node;

    var chk=document.createElement('span');
    if(node.state&&node.state&3) chk.className="vis"; else chk.className="hdn";
    chk.onclick=this._doToggleVisibility;
    var _icon=document.createElement('span'),s;
    _icon.onclick=this._doSelect;
    _icon.ondblclick=this._doDblClickItem;

    if(bGroup) {
        
        item.className='group-c';
        
        var div=document.createElement('div');
        div.className="gitem";
        var _open=document.createElement('span');
        _open.className="open";
        _open.onclick=this._doToggleExpand;
        div.appendChild(_open);
        div.appendChild(chk);        
        s=this.newIcon(div,node);

        var _items=document.createElement('div');
        _items.className="items";
        item.appendChild(div);
        item.appendChild(_items);        
    } else {        
        item.className='item';
        item.appendChild(chk);
        s=this.newIcon(item,node);
    }   
    item.ivselitem=s;
    parent.appendChild(item);
}

iv.treeView.prototype.expandNode=function (treeParent,parent)
{
for(var node=parent.firstChild;node;node=node.next)
{
  if(node.state&128)continue;
  var g=node.firstChild!=undefined && node.firstChild!=null;
  if(g && node.state&8)g=false;
  this.newTreeItem(treeParent,node,g);

}
}

iv.treeView.prototype.updateSelection=function (item)
{
	var item=item.firstChild;
	while(item)
	{	
		if(this.isGroup(item))
		{
			var items=this.getGroupItems(item);
			if(items)
			    this.updateSelection(items);
		}
        var _item=item.ivselitem;
		if(_item ){
		var oldSel=_item.className=="selected";
        var sel=((item.ivnode.state&4)!=0);
		if(sel!=oldSel)_item.className=sel?"selected":"normal";
        }
		item=item.nextSibling;
	}
}
iv.treeView.prototype.onNodeSelected=function(node)
{
   this.updateSelection(this.div);
   if(node)
       {
	var item=this.searchItem(node,true);
	if(item)
		this.ensureVisible(item);
       }
}

iv.treeView.prototype.init=function(space)
{
    var r=space.root;
    if(r){if(r.firstChild)this.expandNode(this.div,r);else this.newTreeItem(this.div,r,false);}
}
