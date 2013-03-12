(function(){
    view.size.width = 450;
    view.size.height = 500;
    paper.install(window);
    var image = document.createElement('img');
    image.onload = function(){
        var r = new Raster(image);
        r.scale(0.4,0.2,new Point(280, 100));
        project.activeLayer.addChild(r);
    };
    image.src = '/images/artel.jpg';

    /*Slider*/
    $( "#slider" ).slider({
        range: "min",
        value: 37,
        min: 1,
        max: 700,
        slide: function( event, ui ) {
            $( "#amount" ).val( "$" + ui.value );
        }
    });

})();