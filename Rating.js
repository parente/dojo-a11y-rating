/**
 * Accessible, internationalized rating widget.
 *
 * Copyright (c) 2008 Peter Parente under the terms of the BSD license.
 * http://creativecommons.org/licenses/BSD/
 */
dojo.provide('info.mindtrove.Rating');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojo.string');
dojo.require('dojo.i18n');
dojo.requireLocalization('info.mindtrove', 'rating');

dojo.declare('info.mindtrove.Rating', [dijit._Widget, dijit._Templated], {
    // minimum rating value
    minimumValue: 0,
    // maximum rating value
    maximumValue: 5,
    // initial value
    currentValue: 0,
    // class name to apply to an unlit star
    offIcon: 'ratingOffIcon',
    // class name to apply to a lit star
    onIcon: 'ratingOnIcon',
    templatePath: dojo.moduleUrl('info.mindtrove', 'templates/Rating.html'),

    /**
     * Constructor. Gets the bundle of localized labels.
     */
    constructor: function() {
        this.labels = dojo.i18n.getLocalization('info.mindtrove', 'rating');
    },

    /**
     * Sets the currentText property before rendering the template so the
     * aria-valuetext property is initialized correctly.
     */
    postMixInProperties: function() {
        this.currentText = this._getDescription();
    },

    /**
     * Creates the proper number of stars after the initial template renders.
     * Stars consist of spans with configurable CSS background images. Each 
     * empty background image span also contains another hidden span with a
     * text representation of a lit / unlit star which will become visible if
     * the user is visiting the page with styles turned off.
     */
    postCreate: function() {
        // build stars using DOM methods
        for(var i = this.minimumValue; i < this.maximumValue; i++) {
            // create span to hold star image
            var span = document.createElement('span');
            // style it to display properly
            dojo.style(span, {'display' : 'inline-block',
                              'cursor' : 'pointer'});
            // listen for mouse clicks on the span with the value it
            // represents in the closure
            this.connect(span, 'onclick',
                         dojo.hitch(this, this._onClick, i+1));

            // create a text node that will go in the span if styles are turned
            // off for accessibility
            var text = document.createElement('span');
            dojo.style(text, {'display' : 'none'});
            span.appendChild(text);

            // show the correct star and text
            if(i >= this.currentValue) {
                dojo.addClass(span, this.offIcon);
                text.innerHTML = '( )';
            } else {
                dojo.addClass(span, this.onIcon);
                text.innerHTML = '(*)';
            }
            this.box.appendChild(span);
        }

        // set the initial text
        this.currentText = this._getDescription();
        dijit.setWaiState(this.box, 'valuetext', this.currentText);

        // add keyboard handler
        this.connect(this.box, 'onkeypress', this._onKeyDown);
    },

    /**
     * Gets a localized description of the current value.
     * @return Current value text
     */
    _getDescription: function() {
        if(this.currentValue == 1) {
            var template = this.labels.starsSingular;
        } else {
            var template = this.labels.starsPlural;
        }
        return dojo.string.substitute(template, [this.currentValue]);        
    },

    /**
     * Updates the star classes, text, and ARIA state to reflect the current
     * value.
     */
    _update: function() {
        // update visuals
        for(var i=this.minimumValue,c=0; i < this.maximumValue; i++,c++) {
            var span = this.box.childNodes[c];
            var text = span.firstChild;
            if(i >= this.currentValue) {
                // turn stars off if greater than or equal to current
                dojo.removeClass(span, this.onIcon);
                dojo.addClass(span, this.offIcon)
                text.innerHTML = '( )';
            } else {
                // turn stars on if less than current
                dojo.removeClass(span, this.offIcon);
                dojo.addClass(span, this.onIcon);
                text.innerHTML = '(*)';
            }            
        }
        // update aria
        this.currentText = this._getDescription();
	this.box.title = this.currentText;
        dijit.setWaiState(this.box, 'valuenow', this.currentValue);
        dijit.setWaiState(this.box, 'valuetext', this.currentText);
    },

    /**
     * Called when the user clicks a star.
     * @param event The keyboard event
     */
    _onClick: function(value, event) {
        this.currentValue = value;
        this._update();
    },

    /**
     * Called when the user presses a key. Up/right increases the value.
     * Down/left decreases. Home sets the value to the minimum. End sets it
     * to the maximum.
     * @param event The keyboard event
     */
    _onKeyDown: function(event) {
        switch(event.keyCode) {
        case dojo.keys.UP_ARROW:
        case dojo.keys.RIGHT_ARROW:
            this.currentValue += 1
            this.currentValue = Math.min(this.currentValue, this.maximumValue);
            dojo.stopEvent(event);
            break;
        case dojo.keys.DOWN_ARROW:
        case dojo.keys.LEFT_ARROW:
            this.currentValue -= 1
            this.currentValue = Math.max(this.currentValue, this.minimumValue);
            dojo.stopEvent(event);
            break;
        case dojo.keys.HOME:
            this.currentValue = this.minimumValue;
            dojo.stopEvent(event);
            break;
        case dojo.keys.END:
            this.currentValue = this.maximumValue;
            dojo.stopEvent(event);
            break;
        }
        // refresh the display
        this._update();
    }
});
