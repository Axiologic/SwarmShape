(function($){

    $.fn.detachTemp = function() {
                this.data('dt_placeholder',$('<span />').insertAfter( this ));
                this.detach();
            }

    $.fn.reattach = function() {
                if(this.data('dt_placeholder')){
                    this.insertBefore( this.data('dt_placeholder') );
                    this.data('dt_placeholder').remove();
                    this.removeData('dt_placeholder');
                }
                else if(window.console && console.error)
                    console.error("Unable to reattach this element "
                        + "because its placeholder is not available.");
            }

    $.fn.appendEachFast = function( arrayOfWrappers ){

        // Map the array of jQuery objects to an array of
        // raw DOM nodes.
        var rawArray = jQuery.map(
            arrayOfWrappers,
            function( value, index ){

                // Return the unwrapped version. This will return
                // the underlying DOM nodes contained within each
                // jQuery value.
                return  value;//.get(0));
            }
        );

        // Add the raw DOM array to the current collection.
        this.append( rawArray );

        // Return this reference to maintain method chaining.
        return( this );

    };
})(jQuery );

