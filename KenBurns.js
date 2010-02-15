/**
 * Ken Burns effect in a Dojo widget.
 *
 * Copyright (c) 2009 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('info.mindtrove.KenBurns');
dojo.require('dojo.fx');
dojo.require('dojo.fx.easing');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

dojo.declare('info.mindtrove.KenBurns', [dijit._Widget, dijit._Templated], {
    images : null,
    fadeTime : 1,
    width : '100%',
    height : '100%',
    loop : true,
    randomZoomRange : [90, 120],
    randomPanRange : [20, 80],
    randomTimeRange : [3.0, 4.0],
    templateString: '<div style="position: relative; overflow: hidden;" class="mtKenBurns" dojoAttachPoint="containerNode"></div>',
    postMixInProperties: function() {
        this._loadTimer = null;
        this._fadeTimer = null;
        this._currentImage = null;
        this.index = 0;
        this.state = 'idle';
        this.images = dojo.clone(this.images);
    },
    
    postCreate: function() {
        dojo.forEach(this.images, function(image, i) {
            var node = dojo.create('img', {
                src : image.src,
                style : {
                    position: 'absolute',
                    opacity : '0'
                },
            }, this.containerNode, 'last');
            image.node = node;
        }, this);
    },
    
    play: function() {
        if(this.state == 'idle') {
            var loaded = dojo.every(this.images, function(image) {
                image.width = image.node.width;
                image.height = image.node.height;
                return (image.width + image.height);
            });
            if(!loaded) {
                this._loadTimer = setTimeout(dojo.hitch(this, 'play'), 1000);
                return;
            }
            // clear the load timer
            clearTimeout(this._loadTimer);
            // switch to playing state
            this.state = 'playing';
            // start iterating
            this._iterate();
        }
    },
    
    onShow: function(index, src) {
        // extension point
    },

    _iterate: function() {
        try {
            this.onShow(this.index);
        } catch(e) {
            console.error(e.message);
        }
        var image = this.images[this.index++];
        var from, to, time;
        if(image.from) {
            from = dojo.map(image.from.split(' '), parseFloat);
        } else {
            var p = (this.randomPanRange[1] - this.randomPanRange[0]);
            var z = (this.randomZoomRange[1] - this.randomZoomRange[0]);
            from = [(Math.random() * p) + this.randomPanRange[0],
                    (Math.random() * p) + this.randomPanRange[0],
                    (Math.random() * z) + this.randomZoomRange[0]];
        }
        if(image.to) {
            to = dojo.map(image.to.split(' '), parseFloat);
        } else {
            var p = (this.randomPanRange[1] - this.randomPanRange[0]);
            var z = (this.randomZoomRange[1] - this.randomZoomRange[0]);
            to = [(Math.random() * p) + this.randomPanRange[0],
                  (Math.random() * p) + this.randomPanRange[0],
                  (Math.random() * z) + this.randomZoomRange[0]];
        }
        if(image.time) {
            time = image.time;
        } else {
            var t = (this.randomTimeRange[1] - this.randomTimeRange[0]);
            time = (Math.random() * t) + this.randomTimeRange[0]; 
        }
        
        // container width and height (fixed)
        var bw = this.containerNode.offsetWidth;
        var bh = this.containerNode.offsetHeight;

        // starting image width and height
        var fwidth = (from[2]/100 * image.width);
        var fheight = (from[2]/100 * image.height);

        // starting difference between image and container width and height
        var wspace = fwidth - bw;
        var hspace = fheight - bh;

        // starting image top and left
        var fleft = -(from[0]/100 * wspace);
        var ftop = -(from[1]/100 * hspace);
        
        // ending image width and height
        var twidth = (to[2]/100 * image.width);
        var theight = (to[2]/100 * image.height);        
        
        // ending difference between image and container width and height
        wspace = twidth - bw;
        hspace = theight - bh;        
        
        // ending image top and left
        var tleft = -(to[0]/100 * wspace);
        var ttop = -(to[1]/100 * hspace);

        var anims = [];
        // create movement animation
        var move = dojo.animateProperty({
            duration : (time + this.fadeTime*2) * 1000,
            node : image.node,
            easing: dojo.fx.easing.linear,
            properties: {
                top : {start: ftop, end: ttop, units: 'px'},
                left: {start: fleft, end: tleft, units: 'px'},
                width : {start: fwidth, end: twidth, units : 'px'},
                height : {start: fheight, end: theight, units : 'px'}
            }
        });
        anims.push(move);
        
        if(this._currentImage != null) {
            // create fade out for current image
            var fadeOut = dojo.fadeOut({
                duration : this.fadeTime * 1000,
                node : this._currentImage.node,
                easing: dojo.fx.easing.linear
            });
            anims.push(fadeOut);
        }

        // create fade in for this image
        var fadeIn = dojo.fadeIn({
            duration : this.fadeTime * 1000,
            node : image.node,
            easing: dojo.fx.easing.linear
        });
        anims.push(fadeIn);
        
        // set a timer for when to transition to the next image if there is
        // a next image
        if(this.loop || this.index < this.images.length) {
            this._fadeTimer = setTimeout(dojo.hitch(this, '_iterate'), 
                (this.fadeTime + time) * 1000);
        }

        // combine fade out, fade in, and move animations
        var allAnims = dojo.fx.combine(anims);
        allAnims.play();
        
        // store current image
        this.index = this.index % this.images.length;
        this._currentImage = image;
    }
});