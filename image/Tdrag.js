/*! Tdrag 0.0.1 */
/**
 * Created by Tezml on 2016/5/26
 * You can modify my source code, if you have a good idea or a problem can be encountered by e-mail: tezml@tezml.com to find me.
 * 濡傛灉浣犳兂鍦ㄩ」鐩腑浣跨敤璇ユ彃浠讹紝璇蜂笉瑕佸垹闄よ娉ㄩ噴銆�
 */
;(function($,window,document,undefined){
    jQuery(function() {
        //鎻掍欢鍒朵綔


        $.fn.Tdrag = function (opt) {
            var call = {
                scope: null,//鐖剁骇
                grid: null,//缃戞牸
                axis:"all",//涓婁笅鎴栬€呭乏鍙�
                pos:false,//鏄惁璁颁綇浣嶇疆
                handle:null,//鎵嬫焺
                moveClass:"tezml",//绉诲姩鏃朵笉鎹綅鍔犵殑class
                dragChange:false,//鏄惁寮€鍚嫋鎷芥崲浣�
                changeMode:"point",//point & sort
                cbStart:function(){},//绉诲姩鍓嶇殑鍥炶皟鍑芥暟
                cbMove:function(){},//绉诲姩涓殑鍥炶皟鍑芥暟
                cbEnd:function(){},//绉诲姩缁撴潫鏃跺€欑殑鍥炶皟鍑芥暟
                random:false,//鏄惁鑷姩闅忔満鎺掑簭
                randomInput:null,//鐐瑰嚮闅忔満鎺掑簭鐨勬寜閽�
                animation_options:{//杩愬姩鏃剁殑鍙傛暟
                    duration:800,//姣忔杩愬姩鐨勬椂闂�
                    easing:"ease-out"//绉诲姩鏃剁殑鐗规晥锛宔ase-out銆乪ase-in銆乴inear
                },
                disable:false,//绂佹鎷栨嫿
                disableInput:null//绂佹鎷栨嫿鐨勬寜閽�
            };
            var dragfn = new Dragfn(this, opt);
            if (opt && $.isEmptyObject(opt) == false) {
                dragfn.options = $.extend(call, opt);
            } else {
                dragfn.options = call;
            }
           /* console.log("榛樿");
            console.log(call);
            console.log("options");
            console.log(opt);
            console.log("瀹為檯鐢ㄧ殑");
            console.log(dragfn.options);*/
            dragfn.firstRandom=true;
            var ele = dragfn.$element;
            dragfn.pack(ele,false);
            if(dragfn.options.randomInput!=null){
                $(dragfn.options.randomInput).bind("click",function(){
                    dragfn.pack(ele,true);
                })
            }
            //鍔犺浇鎷撳睍jquery鐨勫嚱鏁�
            dragfn.loadJqueryfn()
        };

        //渚濊禆鏋勯€犲嚱鏁�
        var Dragfn = function (ele, opt) {
            this.$element = ele;
            this.options = opt;
        };
        //鏋勯€犲嚱鏁版柟娉�
        Dragfn.prototype = {
            init: function (obj) {
                var self = this;
                self.ele=self.$element;
                self.handle=$(obj);//鎵嬫焺
                self.options = self.options;
                self.disable = self.options.disable;
                self._start = false;
                self._move = false;
                self._end = false;
                self.disX = 0;
                self.disY = 0;
                self.zIndex=1000;
                self.moving=false;


                //鐖剁骇
                self.box = $.type(self.options.scope)==="string" ? self.options.scope : null;
                //鎵嬫焺
                if(self.options.handle!=null){
                    self.handle=$(obj).find(self.options.handle);
                }

                //涓変釜浜嬩欢
                self.handle.on("mousedown", function (ev) {
                    self.start(ev, obj);
                    obj.setCapture && obj.setCapture();
                    return true;
                });
                if(self.options.dragChange) {
                    $(obj).on("mousemove", function (ev) {
                        self.move(ev, obj);
                    });
                    $(obj).on("mouseup", function (ev) {
                        self.end(ev, obj);
                    });
                }else{
                    $(document).on("mousemove", function (ev) {
                        self.move(ev, obj);
                    });
                    $(document).on("mouseup", function (ev) {
                        self.end(ev, obj);
                    });
                }
            },
            //jquery璋冨彇鍑芥暟鏃跺€欑敤
            loadJqueryfn: function(){
                var self=this;
                $.extend({
                    //杩斿洖鎸夌収index鎺掑簭鐨勫洖璋冨嚱鏁�
                    sortBox:function(obj){
                        var arr=[];
                        for (var s = 0; s < $(obj).length; s++) {
                            arr.push($(obj).eq(s));
                        }
                        for ( var i = 0; i < arr.length; i++) {
                            for ( var j = i + 1; j < arr.length; j++) {
                                if(Number(arr[i].attr("index")) > Number(arr[j].attr("index"))){
                                    var temp = arr[i];
                                    arr[i] = arr[j];
                                    arr[j] = temp;
                                }
                            }
                        }
                        return arr
                    },
                    //闅忔満鎺掑簭鍑芥暟
                    randomfn:function(obj){
                        self.pack($(obj),true);
                    },
                    //寮€鍚嫋鎷�
                    disable_open:function(){
                        self.disable=false;
                    },
                    //绂佹鎷栨嫿
                    disable_cloose:function(){
                        self.disable=true;
                    }
                });
            },
            toDisable: function(){
                var self=this;
                if(self.options.disableInput!=null){
                    $(self.options.disableInput).bind("click",function(){
                        if(self.disable==true){
                            self.disable=false
                        }else{
                            self.disable=true
                        }
                    })
                }
            },
            start: function (ev, obj) {
                var self = this;
                if (self.disable == true) {
                    return false
                }
                self._start = true;
                var oEvent = ev || event;
                self.disX = oEvent.clientX - obj.offsetLeft;
                self.disY = oEvent.clientY - obj.offsetTop;
                $(obj).css("zIndex",self.zIndex++);
                self.options.cbStart();
            },
            move: function (ev, obj) {
                var self = this;
                if (self._start != true) {
                    return false
                }
                self._move = true;
                var oEvent = ev || event;
                var l = oEvent.clientX - self.disX;
                var t = oEvent.clientY - self.disY;
                //鏈夌埗绾ч檺鍒�
                if (self.box != null) {
                    var rule = self.collTestBox(obj,self.box);
                    if (l > rule.lmax) {
                        l = rule.lmax;
                    } else if (l < rule.lmin) {
                        l = rule.lmin;
                    }
                    if (t > rule.tmax) {
                        t = rule.tmax;
                    } else if (t < rule.tmin) {
                        t = rule.tmin;
                    }
                }
                if(self.options.axis=="all"){
                    obj.style.left = self.grid(obj, l, t).left  + 'px';
                    obj.style.top = self.grid(obj, l, t).top  + 'px';
                }else if(self.options.axis=="y"){
                    obj.style.top = self.grid(obj, l, t).top  + 'px';
                }else if(self.options.axis=="x"){
                    obj.style.left = self.grid(obj, l, t).left + 'px';
                }
               /* if(self.options.changeWhen=="move") {
                    if (self.options.changeMode == "sort") {
                        self.sortDrag(obj);
                    } else if (self.options.changeMode == "point") {
                        self.pointmoveDrag(obj);
                    }
                }else{
                    self.moveAddClass(obj);
                }*/
                if(self.options.pos==true){
                    self.moveAddClass(obj);
                }
                self.options.cbMove(obj,self);

            },
            end: function (ev, obj) {
                var self = this;
                if (self._start != true) {
                    return false
                }
                if(self.options.changeMode=="sort"&&self.options.pos==true){
                    self.sortDrag(obj);
                }else if(self.options.changeMode=="point"&&self.options.pos==true){
                    self.pointDrag(obj);
                }
                if(self.options.pos==true){
                    self.animation(obj, self.aPos[$(obj).attr("index")]);
                }
                self.options.cbEnd();
                if(self.options.handle!=null){
                    $(obj).find(self.options.handle).unbind("onmousemove");
                    $(obj).find(self.options.handle).unbind("onmouseup");
                }else{
                    $(obj).unbind("onmousemove");
                    $(obj).unbind("onmouseup");
                }
                obj.releaseCapture && obj.releaseCapture();
                self._start = false;

            },
            //绠楃埗绾х殑瀹介珮
            collTestBox: function (obj, obj2) {
                var self = this;
                var l1 = 0;
                var t1 = 0;
                var l2 = $(obj2).innerWidth() - $(obj).outerWidth();
                var t2 = $(obj2).innerHeight() - $(obj).outerHeight();
                return {
                    lmin: l1,//鍙栫殑l鏈€灏忓€�
                    tmin: t1,//鍙栫殑t鏈€灏忓€�
                    lmax: l2,//鍙栫殑l鏈€澶у€�
                    tmax: t2//鍙栫殑t鏈€澶у€�
                }

            },
            //绠楃埗绾у楂樻椂鍊欏共鎺塵argin
            grid: function (obj, l, t) {//cur:[width,height]
                var self = this;
                var json = {
                    left: l,
                    top: t
                };
                if ($.isArray(self.options.grid) && self.options.grid.length == 2) {
                    var gx = self.options.grid[0];
                    var gy = self.options.grid[1];
                    json.left = Math.floor((l + gx / 2) / gx) * gx;
                    json.top = Math.floor((t + gy / 2) / gy) * gy;
                    return json
                } else if (self.options.grid == null) {
                    return json
                } else {
                    console.log("grid鍙傛暟浼犻€掓牸寮忛敊璇�");
                    return false
                }
            },
            findNearest: function(obj){
                var self=this;
                var iMin=new Date().getTime();
                var iMinIndex=-1;
                var ele=self.ele;
                for(var i=0;i<ele.length;i++){
                    if(obj==ele[i]){
                        continue;
                    }
                    if(self.collTest(obj,ele[i])){
                        var dis=self.getDis(obj,ele[i]);
                        if(dis<iMin){
                            iMin=dis;
                            iMinIndex=i;
                        }
                    }
                }
                if(iMinIndex==-1){
                    return null;
                }else{
                    return ele[iMinIndex];
                }
        },
            getDis: function(obj,obj2){
                var self=this;
                var l1=obj.offsetLeft+obj.offsetWidth/2;
                var l2=obj2.offsetLeft+obj2.offsetWidth/2;

                var t1=obj.offsetTop+obj.offsetHeight/2;
                var t2=obj2.offsetTop+obj2.offsetHeight/2;

                var a=l2-l1;
                var b=t1-t2;

            return Math.sqrt(a*a+b*b);
        },
            collTest: function(obj,obj2){
                var self=this;
                var l1=obj.offsetLeft;
                var r1=obj.offsetLeft+obj.offsetWidth;
                var t1=obj.offsetTop;
                var b1=obj.offsetTop+obj.offsetHeight;

                var l2=obj2.offsetLeft;
                var r2=obj2.offsetLeft+obj2.offsetWidth;
                var t2=obj2.offsetTop;
                var b2=obj2.offsetTop+obj2.offsetHeight;

                if(r1<l2 || r2<l1 || t2>b1 || b2<t1){
                    return false;
                }else{
                    return true;
                }
        },
            //鍒濆甯冨眬杞崲
            pack: function(ele,click){
                var self=this;
                self.toDisable();
                if(self.options.pos==false){
                    for (var i = 0; i < ele.length; i++) {
                        $(ele[i]).css("position", "fixed");
                        $(ele[i]).css("margin", "0");
                        self.init(ele[i]);
                    }
                }else if(self.options.pos==true) {
                    var arr = [];
                    if (self.options.random || click) {
                        while (arr.length < ele.length) {
                            var n = self.rnd(0, ele.length);
                            if (!self.finInArr(arr, n)) {//娌℃壘鍒�
                                arr.push(n);
                            }
                        }
                    }
                    if (self.options.random == false || click != true) {
                        var n = 0;
                        while (arr.length < ele.length) {
                            arr.push(n);
                            n++
                        }
                    }

                    //濡傛灉鏄浜屾浠ュ悗闅忔満鍒楄〃锛岄偅灏遍噸鏂版帓搴忓悗鍐嶉殢鏈猴紝鍥犱负鎴戞櫤鍟嗕笉澶熶娇锛屼笉浼氭帓浜�
                    if (self.firstRandom == false) {
                        var sortarr = [];
                        var n = 0;
                        while (sortarr.length < ele.length) {
                            sortarr.push(n);
                            n++
                        }
                        for (var i = 0; i < ele.length; i++) {
                            $(ele[i]).attr("index", sortarr[i]);
                            $(ele[i]).css("left", self.aPos[sortarr[i]].left);
                            $(ele[i]).css("top", self.aPos[sortarr[i]].top);
                        }
                    }

                    //甯冨眬杞寲
                    self.aPos = [];
                    if (self.firstRandom == false) {
                        //涓嶆槸绗竴娆�
                        for (var j = 0; j < ele.length; j++) {
                            self.aPos[j] = {
                                left: ele[$(ele).eq(j).attr("index")].offsetLeft,
                                top: ele[$(ele).eq(j).attr("index")].offsetTop
                            };
                        }
                    } else {
                        //绗竴娆�
                        for (var j = 0; j < ele.length; j++) {
                            self.aPos[j] = {left: ele[j].offsetLeft, top: ele[j].offsetTop};
                        }
                    }
                    //绗簩涓惊鐜竷灞€杞寲
                    for (var i = 0; i < ele.length; i++) {
                        $(ele[i]).attr("index", arr[i]);
                        $(ele[i]).css("left", self.aPos[arr[i]].left);
                        $(ele[i]).css("top", self.aPos[arr[i]].top);
                        $(ele[i]).css("position", "fixed");
                        $(ele[i]).css("margin", "0");
                        self.init(ele[i]);
                    }
                    self.firstRandom = false;
                }
            },
            //绉诲姩鏃跺€欏姞class
            moveAddClass: function(obj){
                var self=this;
                var oNear=self.findNearest(obj);
                $(self.$element).removeClass(self.options.moveClass);
                if(oNear && $(oNear).hasClass(self.options.moveClass)==false){
                    $(oNear).addClass(self.options.moveClass);
                }

            },
            //缁檒i鎺掑簭
            sort: function(){
                var self=this;
                var arr_li=[];
                for (var s = 0; s < self.$element.length; s++) {
                    arr_li.push(self.$element[s]);
                }
                for ( var i = 0; i < arr_li.length; i++) {
                    for ( var j = i + 1; j < arr_li.length; j++) {
                        if(Number($(arr_li[i]).attr("index")) > Number($(arr_li[j]).attr("index"))){
                            var temp = arr_li[i];
                            arr_li[i] = arr_li[j];
                            arr_li[j] = temp;
                        }
                    }
                }
                return arr_li;
            },
            //鐐瑰鐐圭殑鏂瑰紡鎹綅
            pointDrag: function(obj){
                var self=this;
                //鍏堟媿搴�
                var oNear=self.findNearest(obj);
                if (oNear) {
                    self.animation(obj,self.aPos[$(oNear).attr("index")]);
                    self.animation(oNear, self.aPos[$(obj).attr("index")]);
                    var tmp;
                    tmp = $(obj).attr("index");
                    $(obj).attr("index", $(oNear).attr("index"));
                    $(oNear).attr("index", tmp);
                    $(oNear).removeClass(self.options.moveClass);
                } else if (self.options.changeWhen == "end") {
                    self.animation(obj, self.aPos[$(obj).attr("index")]);
                }

            },
            //鎺掑簭鐨勬柟寮忔崲浣�
            sortDrag: function(obj){
                var self=this;
                //鍏堟媿搴�
                var arr_li=self.sort();
                //鎹綅缃�
                var oNear=self.findNearest(obj);
                    if(oNear){
                        if(Number($(oNear).attr("index"))>Number($(obj).attr("index"))){
                            //鍓嶆崲鍚�
                            var obj_tmp=Number($(obj).attr("index"));
                            $(obj).attr("index",Number($(oNear).attr("index"))+1);
                            for (var i = obj_tmp; i < Number($(oNear).attr("index"))+1; i++) {
                                self.animation(arr_li[i],self.aPos[i-1]);
                                self.animation(obj,self.aPos[$(oNear).attr("index")]);
                                $(arr_li[i]).removeClass(self.options.moveClass);
                                $(arr_li[i]).attr("index",Number($(arr_li[i]).attr("index"))-1);
                            }

                        }else if(Number($(obj).attr("index"))>Number($(oNear).attr("index"))){
                            //鍚庢崲鍓�
                            var obj_tmp=Number($(obj).attr("index"));
                            $(obj).attr("index",$(oNear).attr("index"));
                            for (var i = Number($(oNear).attr("index")); i < obj_tmp; i++) {
                                self.animation(arr_li[i],self.aPos[i+1]);
                                self.animation(obj,self.aPos[Number($(obj).attr("index"))]);
                                $(arr_li[i]).removeClass(self.options.moveClass);
                                $(arr_li[i]).attr("index",Number($(arr_li[i]).attr("index"))+1);
                            }
                        }
                    }else{
                        self.animation(obj,self.aPos[$(obj).attr("index")]);
                    }

            },
            //杩愬姩鍑芥暟(鍚庢湡鍐嶅姞鍙傛暟)
            animation: function(obj,json){
                var self=this;
                //鑰冭檻榛樿鍊�
                var options=self.options.animation_options; /*|| {};
                options.duration=self.options.animation_options.duration || 800;
                options.easing=options.easing.duration.easing || 'ease-out';*/
                var self=this;
                var count=Math.round(options.duration/30);
                var start={};
                var dis={};
                for(var name in json){
                    start[name]=parseFloat(self.getStyle(obj,name));
                    if(isNaN(start[name])){
                        switch(name){
                            case 'left':
                                start[name]=obj.offsetLeft;
                                break;
                            case 'top':
                                start[name]=obj.offsetTop;
                                break;
                            case 'width':
                                start[name]=obj.offsetWidth;
                                break;
                            case 'height':
                                start[name]=obj.offsetHeight;
                                break;
                            case 'marginLeft':
                                start[name]=obj.offsetLeft;
                                break;
                            case 'borderWidth':
                                start[name]=0;
                                break;
                            //...
                        }
                    }
                    dis[name]=json[name]-start[name];
                }

                var n=0;

                clearInterval(obj.timer);
                obj.timer=setInterval(function(){
                    n++;
                    for(var name in json){
                        switch(options.easing){
                            case 'linear':
                                var a=n/count;
                                var cur=start[name]+dis[name]*a;
                                break;
                            case 'ease-in':
                                var a=n/count;
                                var cur=start[name]+dis[name]*a*a*a;
                                break;
                            case 'ease-out':
                                var a=1-n/count;
                                var cur=start[name]+dis[name]*(1-a*a*a);
                                break;
                        }

                        if(name=='opacity'){
                            obj.style.opacity=cur;
                            obj.style.filter='alpha(opacity:'+cur*100+')';
                        }else{
                            obj.style[name]=cur+'px';
                        }
                    }

                    if(n==count){
                        clearInterval(obj.timer);
                        options.complete && options.complete();
                    }
                },30);
        },
            getStyle: function(obj,name){
                return (obj.currentStyle || getComputedStyle(obj,false))[name];
            },
            //闅忔満鏁�
            rnd: function(n,m){
                return parseInt(Math.random()*(m-n)+n);
            },
            //鍦ㄦ暟缁勪腑鎵�
            finInArr: function(arr,n){
                for(var i = 0 ; i < arr.length; i++){
                    if(arr[i] == n){//瀛樺湪
                        return true;
                    }
                }
                return false;
            }
        }
    })
})(jQuery,window,document);