(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

let e = Module.getBaseAddress("xenia_canary.exe").add(2734816);

var t, n = !1, o = 0, r = !1, a = {}, c = 0;

function d(e) {
  return 0 != e;
}

send("ready");

let i = recv((function(e) {
  "playback" == e.type ? (r = !1, a = e.data) : r = !0;
}));

if (i.wait(), r) Interceptor.attach(e, {
  onEnter: function(e) {
    0 == this.context.rdx.toInt32() ? (n = !0, t = this.context.r8, o += 1) : o < 12e5 ? n = !1 : (send("stop"), 
    console.log("recording done due to limit"), Interceptor.detachAll());
  },
  onLeave: function() {
    if (n) {
      var e = t.add(4).readByteArray(12);
      if (0 != (128 & t.add(5).readU8())) return send("stop"), console.log("recording done"), 
      void Interceptor.detachAll();
      send("state", e);
    }
  }
}); else {
  console.log("Playing back");
  var l = Object.keys(a).length;
  Interceptor.attach(e, {
    onEnter: function() {
      if (o >= l) return Interceptor.detachAll(), console.log("Playback Done"), void send("stop");
      0 == this.context.rdx.toInt32() ? (n = !0, t = this.context.r8) : n = !1;
    },
    onLeave: function() {
      n && (t.add(4).writeByteArray(a[o]), !0 & a[o][1] && console.log(a[o]), o++);
    }
  });
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWNvcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksSUFBc0IsT0FBTyxlQUFlLG9CQUFvQixJQUFJOztBQUN4RSxJQUFJLEdBQ0EsS0FBWSxHQUNaLElBQVksR0FDWixLQUFXLEdBQ1gsSUFBWSxJQUNaLElBQVk7O0FBQ2hCLFNBQVMsRUFBUTtFQUViLE9BQWEsS0FBTjtBQUNYOztBQUNBLEtBQUs7O0FBQ0wsSUFBSSxJQUFpQixNQUFLLFNBQVM7RUFFYixjQUFmLEVBQVUsUUFDVCxLQUFXLEdBQ1gsSUFBWSxFQUFJLFFBRWhCLEtBQVc7QUFFbkI7O0FBRUEsSUFEQSxFQUFlLFFBQ1osR0FDQyxZQUFZLE9BQU8sR0FBcUI7RUFDcEMsU0FBUyxTQUFVO0lBR21CLEtBQTlCLEtBQUssUUFBUSxJQUFJLGFBRWpCLEtBQVksR0FFWixJQUFXLEtBQUssUUFBUSxJQUN4QixLQUFhLEtBQ04sSUFBWSxPQUNuQixLQUFZLEtBRVosS0FBSztJQUNMLFFBQVEsSUFBSSxnQ0FDWixZQUFZO0FBRXBCO0VBQ0EsU0FBUztJQUNMLElBQUksR0FBVztNQUVYLElBQUksSUFBVyxFQUFTLElBQUksR0FBRyxjQUFjO01BRzdDLElBQW9CLE1BQVQsTUFEUyxFQUFTLElBQUksR0FBRyxXQUtoQyxPQUhBLEtBQUssU0FDTCxRQUFRLElBQUk7V0FDWixZQUFZO01BR1osS0FBSyxTQUFTOztBQUcxQjtTQUVEO0VBQ0gsUUFBUSxJQUFJO0VBQ1osSUFBSSxJQUFRLE9BQU8sS0FBSyxHQUFXO0VBRW5DLFlBQVksT0FBTyxHQUFvQjtJQUNuQyxTQUFTO01BQ0wsSUFBRyxLQUFhLEdBSVosT0FIQSxZQUFZLGFBQ1osUUFBUSxJQUFJLHVCQUNaLEtBQUs7TUFJd0IsS0FBOUIsS0FBSyxRQUFRLElBQUksYUFDaEIsS0FBWSxHQUVaLElBQVcsS0FBSyxRQUFRLE1BS3hCLEtBQVk7QUFFcEI7SUFBRyxTQUFTO01BQ0wsTUFFQyxFQUFTLElBQUksR0FBRyxlQUFlLEVBQVUsTUFFWixJQUExQixFQUFVLEdBQVcsTUFFcEIsUUFBUSxJQUFJLEVBQVUsS0FHMUI7QUFFUiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIn0=
