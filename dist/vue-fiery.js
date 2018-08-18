!function(e,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?exports.VueFiery=r():e.VueFiery=r()}(window,function(){return function(e){var r={};function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)t.d(n,o,function(r){return e[r]}.bind(null,o));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=8)}([function(e,r,t){"use strict";function n(e){return"[object Object]"===Object.prototype.toString.call(e)}function o(e){return e&&e instanceof Array}function i(e){return e&&e instanceof Date}function a(e){return void 0!==e}Object.defineProperty(r,"__esModule",{value:!0}),r.isObject=n,r.isFunction=function(e){return"function"==typeof e},r.isArray=o,r.isDate=i,r.isDefined=a,r.coalesce=function(e,r){return a(e)?e:r},r.isCollectionSource=function(e){return!!e.where},r.getFields=function(e,r){return e?"string"==typeof e?[e]:e:r},r.forEach=function(e,r){if(o(e)){for(var t=0;t<e.length;t++)r(e[t],t,e);return!0}if(n(e)){for(var i in e)r(e[i],i,e);return!0}return!1},r.createRecord=function(e,r){var t=r.options;if(t.record){var n=t.recordOptions,o=r.recordFunctions;n.sync&&(e[n.sync]=o.sync),n.update&&(e[n.update]=o.update),n.remove&&(e[n.remove]=o.remove),n.clear&&(e[n.clear]=o.clear),n.getChanges&&(e[n.getChanges]=o.getChanges),n.ref&&(e[n.ref]=o.ref)}return e},r.isEqual=function e(r,t){if(r===t)return!0;if(!r||!t)return!1;if(typeof r!=typeof t)return!1;if(o(r)&&o(t)){if(r.length!==t.length)return!1;for(var a=0;a<r.length;a++)if(!e(r[a],t[a]))return!1;return!0}if(i(r)&&i(t))return r.getTime()===t.getTime();if(n(r)&&n(t)){for(var c in r)if(!e(r[c],t[c]))return!1;for(var c in t)if(!(c in r))return!1;return!0}return!1}},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(3),o=t(5),i=t(2);function a(e,t){var o=e.storeKey+n.UID_SEPARATOR+t.path;if(o in r.globalCache)return f(r.globalCache[o],e),r.globalCache[o];var i=e.options.newDocument();i[n.PROP_UID]=o;var a={uid:o,data:i,uses:0,sub:{},firstEntry:e,entries:[],removed:!1};return r.globalCache[o]=a,a.uid in e.instance.cache||(e.instance.cache[a.uid]=a,a.uses++),f(a,e),a}function c(e){return r.globalCache[e[n.PROP_UID]]}function s(e,r){if(r&&r.uid in e.children){e.options;var t=r.entries,n=t.indexOf(e);if(-1!==n&&t.splice(n,1),delete e.children[r.uid],0===t.length)l(r);else{for(var i=!1,a=0;a<t.length;a++)if(t[a].instance===e.instance){i=!0;break}for(var c in i||d(r,e.instance),r.sub)u(r,c)||o.closeEntry(r.sub[c],!0)}}}function u(e,r){for(var t=e.entries,n=(e.sub,0);n<t.length;n++){var o=t[n].options.sub;if(o&&r in o)return!0}return!1}function f(e,r){e.uid in r.children||(e.entries.push(r),r.children[e.uid]=e,i.addSubs(e,r))}function d(e,r,t){if(void 0===t&&(t=!0),e.uid in r.cache){e.uses--,delete r.cache[e.uid];for(var n=e.entries,o=n.length-1;o>=0;o--){var i=n[o];i.instance===r&&s(i,e)}t&&e.uses<=0&&l(e)}}function l(e){for(var t=e.entries,n=0;n<t.length;n++)d(e,t[n].instance,!1);for(var i in e.sub)o.closeEntry(e.sub[i],!0);e.uses<=0&&!e.removed&&(delete r.globalCache[e.uid],delete e.doc,delete e.sub,delete e.data,e.entries.length=0,e.removed=!0)}r.globalCache={},r.getCacheForReference=a,r.getCacheForDocument=function(e,r){return a(e,r.ref)},r.getCacheForData=c,r.removeDataFromEntry=function(e,r){s(e,c(r))},r.removeCacheFromEntry=s,r.isReferencedSub=u,r.addCacheToEntry=f,r.removeCacheFromInstance=d,r.destroyCache=l},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(3),o=t(0),i=t(5),a=t(6);function c(e,r){var t=r.options,o=e.data,c=e.doc;if(t.sub&&c)for(var u in t.sub)if(!s(e,u)){var f=t.sub[u],d=e.uid+n.ENTRY_SEPARATOR+u,l=f.doc?c.ref.parent.doc(c.id+n.ENTRY_SEPARATOR+u):c.ref.collection(u),p=i.getEntry(r.instance,l,f,d,!1);o[u]=a.factory(p),e.sub[u]=p}}function s(e,r){return r in e.sub&&e.sub[r].live}function u(e,r,t){for(var n in t)t.hasOwnProperty(n)&&e.setProperty(r,n,t[n]);return r}function f(e,r){if(r.decode)e=r.decode(e);else if(r.decoders)for(var t in r.decoders)t in e&&(e[t]=r.decoders[t](e[t],e));return e}function d(e,r){var t,n=e.data(),i=o.isObject(n)?n:((t={})[r.propValue]=n,t);return i&&r.key&&(i[r.key]=e.id),i}r.refreshData=function(e,r,t){var n=t.instance.system,i=t.options,a=f(d(r,i),i),s=e.data,l=!e.doc;return u(n,s,a),e.doc=r,l&&(o.createRecord(s,t),c(e,t)),s},r.addSubs=c,r.hasLiveSub=s,r.copyData=u,r.decodeData=f,r.encodeData=function(e,r,t){var n={},i=o.getFields(t,r.include);if(i)for(var a=0;a<i.length;a++)(c=i[a])in e&&(n[c]=e[c]);else for(var c in e)c in r.exclude||(n[c]=e[c]);if(r.encoders)for(var c in r.encoders)c in n&&(n[c]=r.encoders[c](n[c],e));return n},r.parseDocument=d},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.PROP_VALUE=".value",r.PROP_UID=".uid",r.UID_SEPARATOR="///",r.ENTRY_SEPARATOR="/",r.STORE_SEPARATOR="/",r.RECORD_OPTIONS={sync:"$sync",update:"$update",remove:"$remove",ref:"$ref",clear:"$clear",getChanges:"$getChanges"}},function(e,r,t){"use strict";var n=this&&this.__assign||Object.assign||function(e){for(var r,t=1,n=arguments.length;t<n;t++)for(var o in r=arguments[t])Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o]);return e};Object.defineProperty(r,"__esModule",{value:!0});var o=t(3),i=t(0);function a(e,t){if(t)for(var n in r.mergeOptions){var o=n,i=r.mergeOptions[o];e[o]=i(e[o],t[o])}}r.globalOptions={defined:{},user:void 0,defaults:{onError:function(e){},onMissing:function(){},onSuccess:function(e){},onRemove:function(){},liveOptions:{},propValue:o.PROP_VALUE,recordOptions:o.RECORD_OPTIONS,newDocument:function(e){return{}}},id:0,map:{}},r.getOptionsByKey=function(e){return r.globalOptions.map[parseInt(e)]},r.getOptions=function e(t,n){if("string"==typeof t){if(!(t in r.globalOptions.defined))throw"The definition "+t+" was not found. You must call define before you use the definition";return e(r.globalOptions.defined[t])}if(t&&i.isObject(t)||(t={}),t.id&&t.id in r.globalOptions.map)return t;if(t.id||(t.id=++r.globalOptions.id,r.globalOptions.map[t.id]=t),t.extends&&a(t,e(t.extends)),a(t,r.globalOptions.user),a(t,r.globalOptions.defaults),n&&!t.shared&&(t.instance=n,n.options[t.id]=t),t.type){var c=t.type;t.newDocument=function(e){return new c}}t.newCollection||(t.newCollection=t.map?function(){return{}}:function(){return[]});var s={};if(t.exclude?i.isArray(t.exclude)?i.forEach(t.exclude,function(e,r){return s[e]=!0}):s=t.exclude:t.key&&(s[t.key]=!0),s[t.propValue]=!0,s[o.PROP_UID]=!0,i.forEach(t.recordOptions,function(e,r){return s[e]=!0}),t.exclude=s,t.sub)for(var u in t.sub){var f=e(t.sub[u],n);f.parent=t,t.sub[u]=f,s[u]=!0}return t},r.recycleOptions=function(e){var r=e.instance;r&&delete r.options[e.id]},r.define=function(e,t){if("string"==typeof e)(o=t).shared=!0,r.globalOptions.defined[e]=o;else for(var n in e){var o;(o=e[n]).shared=!0,r.globalOptions.defined[n]=o}},r.setGlobalOptions=function(e){e&&(e.shared=!0),r.globalOptions.user=e},r.performMerge=a,r.mergeStrategy={ignore:function(e,r){return e},replace:function(e,r){return i.coalesce(e,r)},chain:function(e,r){return i.isDefined(r)?i.isDefined(e)?function(){r.apply(this,arguments)(e).apply(this,arguments)}:r:e},shallow:function(e,r){return i.isDefined(r)?i.isDefined(e)?n({},r,e):r:e},concat:function(e,r){if(!i.isDefined(r))return e;if(!i.isDefined(e))return r;if(i.isArray(e)&&i.isArray(r)){for(var t=e.concat(r),n={},o=t.length-1;o>=0;o--)t[o]in n?t.splice(o,1):n[t[o]]=!0;return t}},exclude:function(e,t){var n=r.mergeStrategy.concat(e,t);if(!n&&e&&t){var o={},a=i.isArray(t),c=i.isArray(e);return i.forEach(t,function(e,r){return e?o[a?e:r]=!0:0}),i.forEach(e,function(e,r){return e?o[c?e:r]=!0:0}),o}return n}},r.mergeOptions={extends:r.mergeStrategy.ignore,id:r.mergeStrategy.ignore,parent:r.mergeStrategy.ignore,shared:r.mergeStrategy.ignore,vm:r.mergeStrategy.ignore,key:r.mergeStrategy.replace,query:r.mergeStrategy.replace,map:r.mergeStrategy.replace,once:r.mergeStrategy.replace,type:r.mergeStrategy.replace,newDocument:r.mergeStrategy.replace,newCollection:r.mergeStrategy.replace,decode:r.mergeStrategy.replace,decoders:r.mergeStrategy.shallow,encoders:r.mergeStrategy.shallow,record:r.mergeStrategy.replace,recordOptions:r.mergeStrategy.replace,recordFunctions:r.mergeStrategy.replace,propValue:r.mergeStrategy.replace,onceOptions:r.mergeStrategy.replace,liveOptions:r.mergeStrategy.replace,include:r.mergeStrategy.concat,exclude:r.mergeStrategy.exclude,onError:r.mergeStrategy.replace,onSuccess:r.mergeStrategy.replace,onMissing:r.mergeStrategy.replace,onRemove:r.mergeStrategy.replace,sub:r.mergeStrategy.shallow}},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(0),o=t(4),i=t(12),a=t(1),c=t(7);function s(e,r){void 0===r&&(r=!1),e&&e.live&&(e.off&&(e.off(),delete e.off),e.live=!1,r&&n.forEach(e.children,function(r){a.removeCacheFromEntry(e,r)}))}function u(e){return{sync:function(r){return c.sync.call(e,this,r)},update:function(r){return c.update.call(e,this,r)},remove:function(r){return void 0===r&&(r=!1),c.remove.call(e,this,r)},ref:function(r){return c.ref.call(e,this,r)},clear:function(r){return c.clear.call(e,this,r)},getChanges:function(r,t,n){return c.getChanges.call(e,this,r,t,n)}}}r.closeEntry=s,r.getEntry=function(e,r,t,n,a){void 0===a&&(a=!0);var c=o.getOptions(t,e),f=i.getStoreKey(r);if(n&&n in e.entry){var d=e.entry[n];return s(d),c.id!==d.options.id&&o.recycleOptions(d.options),d.source=r,d.options=c,d.storeKey=f,d.live=!0,d}var l={name:n,options:c,source:r,instance:e,storeKey:f,children:{},recordFunctions:u(e),live:!0};return n&&n in e.entry||(l.index=e.entryList.length,e.entryList.push(l)),n&&(e.entry[n]=l),n&&a&&(e.sources[n]=r),l},r.getEntryRecordFunctions=u},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(11),o=t(13),i=t(14);function a(e){return(e.source.where?e.options.map?o.default:i.default:n.default)(e)}r.factory=a,r.default=a},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(2),o=t(0),i=t(1);function a(e,r){void 0===r&&(r=!1);var t=i.getCacheForData(e);if(t&&t.doc){var n=t.firstEntry.options;if(!r&&n.sub)for(var c in n.sub)o.forEach(e[c],function(e){a(e)});return t.doc.ref.delete()}}r.update=function(e,r){var t=i.getCacheForData(e);if(t&&t.doc){var o=t.firstEntry.options,a=n.encodeData(e,o,r);return t.doc.ref.update(a)}},r.sync=function(e,r){var t=i.getCacheForData(e);if(t&&t.doc){var o=t.firstEntry.options,a=n.encodeData(e,o,r);return t.doc.ref.set(a)}},r.remove=a,r.clear=function(e,r){var t=i.getCacheForData(e),n=o.getFields(r);if(t&&t.doc){for(var c=t.firstEntry.options,s=t.doc,u=s.ref.firestore,f={},d=0,l=0,p=n;l<p.length;l++){var y=p[l];if(c.sub&&y in c.sub&&e[y])o.forEach(e[y],function(e){a(e)});else if(y in e){var g=u.app.firebase_;g&&(f[y]=g.firestore.FieldValue.delete(),d++)}}if(d>0)return s.ref.update(f)}},r.getChanges=function(e,r,t,a){var c=i.getCacheForData(e);if(c&&c.doc){var s=o.isFunction(r)?void 0:o.getFields(r),u=s?t:r,f=(s?a:t)||o.isEqual,d=c.firstEntry.options,l=n.encodeData(e,d,s);return c.doc.ref.get().then(function(e){var r=n.parseDocument(e,d),t={},o={},i=!1;for(var a in l){var c=r[a],s=l[a];f(c,s)||(i=!0,t[a]=c,o[a]=s)}u(i,t,o)})}},r.ref=function(e,r){var t=i.getCacheForData(e);if(t&&t.doc){var n=t.doc;return r?n.ref.collection(r):n.ref}}},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(9);r.default=n.default},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(4),o=t(10);function i(){var e=this;this.$fiery=o.getInstance({removeNamed:function(r){e[r]=null},setProperty:function(r,t,n){e.$set(r,t,n)},removeProperty:function(r,t){e.$delete(r,t)},arrayInsert:function(e,r,t){e.splice(r,0,t)},arrayRemove:function(e,r){e.splice(r,1)},arrayMove:function(e,r,t,n){e.splice(r,1),e.splice(t,0,n)},arraySet:function(e,r,t){e.splice(r,1,t)},arrayAdd:function(e,r){e.push(r)},arrayClear:function(e){e.splice(0,e.length)}}),this.$fires=this.$fiery.sources}function a(){this.$fiery.destroy(),this.$fiery=function(){},this.$fires={}}function c(){for(var e=this.$fiery.entryList,r=0;r<e.length;r++){var t=e[r];if(null!==t)if(!t.options.parent&&!t.name)for(var n in this)if(this[n]===t.target){t.name=n,this.$fiery.entry[n]=t,this.$fires[n]=t.source;break}}}r.init=i,r.destroy=a,r.link=c,r.plugin={mergeOptions:n.mergeOptions,mergeStrategy:n.mergeStrategy,define:n.define,setGlobalOptions:n.setGlobalOptions,install:function(e){e.mixin({beforeCreate:i,created:c,beforeDestroy:a})}},"undefined"!=typeof window&&window.Vue&&window.Vue.use(r.plugin),r.default=r.plugin},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(0),o=t(6),i=t(5),a=t(1),c=t(4),s=t(7);function u(){var e=this;n.forEach(this.options,function(e){return delete c.globalOptions.map[e.id]}),n.forEach(this.cache,function(r){return a.removeCacheFromInstance(r,e)}),n.forEach(this.entryList,function(e){return i.closeEntry(e,!0)}),this.entry={},this.entryList=[],this.options={},this.sources={},this.cache={}}r.getInstance=function(e){var r=function(e,t,n){return o.factory(i.getEntry(r,e,t,n))};return r.system=e,r.entry={},r.entryList=[],r.options={},r.sources={},r.cache={},r.update=s.update,r.sync=s.sync,r.remove=s.remove,r.clear=s.clear,r.getChanges=s.getChanges,r.ref=s.ref,r.destroy=u,r}},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(2),o=t(1);function i(e){var r=e.source,t=e.options,n=o.getCacheForReference(e,r),i=e.target,c=function(r){a(n,e,r)};return t.once?e.promise=r.get(t.onceOptions).then(c).catch(t.onError):e.off=r.onSnapshot(t.liveOptions,c,t.onError),i&&i!==n.data&&o.removeCacheFromEntry(e,n),e.target=n.data,e.target}function a(e,r,t){var i=r.options,a=r.instance.system;t.exists?(n.refreshData(e,t,r),i.onSuccess(e.data)):(o.destroyCache(e),r.name&&a.removeNamed(r.name))}r.factory=i,r.handleDocumentUpdate=a,r.default=i},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0}),r.stores={keyNext:0,map:{},idToKey:{}},r.getStoreKey=function(e){var t=e.firestore,n=t.app.name,o=r.stores.idToKey[n];return o||(o=++r.stores.keyNext,r.stores.map[o]=t,r.stores.idToKey[n]=o),o}},function(e,r,t){"use strict";var n=this&&this.__assign||Object.assign||function(e){for(var r,t=1,n=arguments.length;t<n;t++)for(var o in r=arguments[t])Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o]);return e};Object.defineProperty(r,"__esModule",{value:!0});var o=t(0),i=t(2),a=t(1);function c(e){var r=e.options,t=e.instance.system;return function(c){var s=e.target,u=n({},s);c.forEach(function(r){var n=a.getCacheForDocument(e,r);i.refreshData(n,r,e),t.setProperty(s,r.id,n.data),delete u[r.id]},r.onError),o.forEach(u,function(e,r){return t.removeProperty(s,r)}),o.forEach(u,function(r){return a.removeDataFromEntry(e,r)}),r.onSuccess(s)}}r.default=function(e){var r=e.options,t=r.query?r.query(e.source):e.source;return r.once?e.promise=t.get(r.onceOptions).then(c(e)).catch(r.onError):e.off=t.onSnapshot(r.liveOptions,function(e){var r=c(e),t=function(e){var r=e.options,t=e.instance.system;return function(n){var o=e.target;n.docChanges().forEach(function(r){var n=r.doc,c=a.getCacheForDocument(e,n);switch(r.type){case"modified":case"added":var s=i.refreshData(c,n,e);t.setProperty(o,n.id,s);break;case"removed":t.removeProperty(o,n.id),n.exists?a.removeCacheFromEntry(e,c):a.destroyCache(c)}},r.onError),r.onSuccess(o)}}(e),n=r;return function(e){n(e),n=t}}(e),r.onError),e.target||(e.target=r.newCollection()),e.target}},function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(3),o=t(2),i=t(1),a=t(0);function c(e){var r=e.options,t=r.query?r.query(e.source):e.source;return r.once?e.promise=t.get(r.onceOptions).then(s(e)).catch(r.onError):e.off=t.onSnapshot(r.liveOptions,function(e){var r=s(e),t=function(e){var r=e.options,t=e.instance.system;return function(n){var a=e.target;n.docChanges().forEach(function(r){var n=r.doc,c=i.getCacheForDocument(e,n);switch(r.type){case"added":var s=o.refreshData(c,n,e);t.arrayInsert(a,r.newIndex,s);break;case"removed":t.arrayRemove(a,r.oldIndex),n.exists?i.removeCacheFromEntry(e,c):i.destroyCache(c);break;case"modified":var u=o.refreshData(c,n,e);r.oldIndex!==r.newIndex?t.arrayMove(a,r.oldIndex,r.newIndex,u):t.arraySet(a,r.newIndex,u)}},r.onError),r.onSuccess(a)}}(e),n=r;return function(e){n(e),n=t}}(e),r.onError),e.target||(e.target=r.newCollection()),e.target}function s(e){var r=e.options,t=e.instance.system,c=e.target;return function(s){var u=e.target,f={};if(c)for(var d=0;d<u.length;d++){var l=u[d];f[l[n.PROP_UID]]=l}t.arrayClear(u),s.forEach(function(r){var n=i.getCacheForDocument(e,r);o.refreshData(n,r,e),t.arrayAdd(u,n.data),delete f[n.uid]},r.onError),a.forEach(f,function(r){return i.removeDataFromEntry(e,r)}),r.onSuccess(u)}}r.factory=c,r.default=c}]).default});