(function(win) {
    var g = {};
    var myParams = {
        "Speed": 1,
        "Space": 5,
        "PageWidth": 205,
        "fill": 0,
        "MoveLock": false,
        "MoveTimeObj": null,
        "Comp": 0,
        "AutoPlayObj": null,
        "auto": true, 
        "time": 3000
    };

    g.init = function(params) {
        //自动滚动
        function AutoPlay(params, obj) {
            if(params.AutoPlayObj) {
                clearInterval(params.AutoPlayObj);
            }
            params.AutoPlayObj = setInterval(
            function(params) {
                obj.next();
                obj.stopNext();
            }, params.time); //间隔时间
        }

        //上翻动作
        function ISL_ScrUp(Space) {
            if (document.getElementById('ISL_Cont').scrollLeft <= 0) { 
                document.getElementById('ISL_Cont').scrollLeft = document.getElementById('ISL_Cont').scrollLeft + document.getElementById('List1').offsetWidth 
            }
            document.getElementById('ISL_Cont').scrollLeft -= Space;
        }

        //下翻动作
        function ISL_ScrDown(Space) { 
            if (document.getElementById('ISL_Cont').scrollLeft >= document.getElementById('List1').scrollWidth) { 
                document.getElementById('ISL_Cont').scrollLeft = document.getElementById('ISL_Cont').scrollLeft - document.getElementById('List1').scrollWidth; 
            }
            document.getElementById('ISL_Cont').scrollLeft += Space;
        }

        function _gallery(params) {
            var self = this;
            params = params || {};
            for(var key in params) {
                myParams[kye] = params[key];
            }
            self.original = myParams;
            document.getElementById("List2").innerHTML = document.getElementById("List1").innerHTML;
            document.getElementById('ISL_Cont').scrollLeft = myParams.fill;

            document.getElementById("ISL_Cont").onmouseover = function() {
                if(myParams.AutoPlayObj) {
                    clearInterval(myParams.AutoPlayObj); 
                }
            }

            document.getElementById("ISL_Cont").onmouseout = function() {
                if(myParams.auto) {
                    AutoPlay(myParams, self);
                }
            }

            if(myParams.auto) {
                AutoPlay(myParams, self);
            }
        }

        _gallery.prototype = {
            "constructor": this,
            pre: function() {
                var self = this;
                if(self.original.MoveLock) {
                    return ;
                }
                if(self.original.AutoPlayObj) {
                    clearInterval(self.original.AutoPlayObj);
                }
                self.original.MoveLock = true;
                self.original.MoveTimeObj = setInterval(
                    function() {
                        ISL_ScrUp(self.original.Space);
                    }, self.original.Speed);
            },
            next: function() {
                var self = this;
                if(self.original.MoveTimeObj) {
                    clearInterval(self.original.MoveTimeObj);
                }
                if (self.original.MoveLock) {
                    return;
                }
                if(self.original.AutoPlayObj) {
                    clearInterval(self.original.AutoPlayObj);
                }
                self.original.MoveLock = true;
                ISL_ScrDown(self.original.Space);
                self.original.MoveTimeObj = setInterval(
                    function() {
                        ISL_ScrDown(self.original.Space);
                    }, self.original.Speed);
            },
            stopPre: function() {
                var self = this;
                if(self.original.MoveTimeObj) {
                    clearInterval(self.original.MoveTimeObj);
                }
                if (document.getElementById('ISL_Cont').scrollLeft % self.original.PageWidth - self.original.fill != 0) {
                    self.original.Comp = self.original.fill - (document.getElementById('ISL_Cont').scrollLeft % self.original.PageWidth);
                    self.CompScr(self.original);
                } else {
                    self.original.MoveLock = false;
                }
                if(self.original.auto) {
                    AutoPlay(self.original, self);
                }
            },
            stopNext: function() {
                var self = this;
                if(self.original.MoveTimeObj) {
                    clearInterval(self.original.MoveTimeObj);
                }
                if (document.getElementById('ISL_Cont').scrollLeft % self.original.PageWidth - self.original.fill != 0) {
                    self.original.Comp = self.original.PageWidth - document.getElementById('ISL_Cont').scrollLeft % self.original.PageWidth + self.original.fill;
                    self.CompScr(self.original);
                } else {
                    self.original.MoveLock = false;
                }
                if(self.original.auto) {
                    AutoPlay(self.original, self);
                }
            },
            CompScr: function() {
                var self = this;
                var num;
                if (self.original.Comp == 0) { 
                    self.original.MoveLock = false; 
                    return; 
                }
                if (self.original.Comp < 0) { //上翻
                    if (self.original.Comp < -self.original.Space) {
                        self.original.Comp += self.original.Space;
                        num = self.original.Space;
                    } else {
                        num = -self.original.Comp;
                        self.original.Comp = 0;
                    }
                    document.getElementById('ISL_Cont').scrollLeft -= num;
                    setTimeout(function() {
                        self.CompScr(self.original);
                    }, self.original.Speed);
                } else { //下翻
                    if (self.original.Comp > self.original.Space) {
                        self.original.Comp -= self.original.Space;
                        num = self.original.Space;
                    } else {
                        num = self.original.Comp;
                        self.original.Comp = 0;
                    }
                    document.getElementById('ISL_Cont').scrollLeft += num;
                    setTimeout(function() {
                        self.CompScr(self.original);
                    }, self.original.Speed);
                }
            }
        };

        return new _gallery(params);
    };

    win.gallery = g;
})(window);