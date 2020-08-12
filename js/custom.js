var isFirefox = typeof InstallTrigger !== 'undefined';
if (isFirefox) {
  var newTw = '<small style="position:relative;top:-5px;"><a target="_blank" href="https://twitter.com/share">Tweet</a></small>&nbsp;';
  $('.tw-wrap').prepend(newTw);
}


$('li.dropdown a').on('click', function() {
  if ($(this).parent().hasClass('open')) $(this).parent().removeClass('open');
  else {
    $(this).parent().siblings().removeClass('open');
    $(this).parent().addClass('open');
  }
});

var sql = new cartodb.SQL({user: 'sighrobot'});

function toggle(control, element) {
  if (element.className === 'active') {
    control.removeFrom(map);
    element.className = '';
  } else {
    control.addTo(map);
    element.className = 'active';
  }
}
var tableName0 = 'pages_etree_1_5_merge';
var tableName1 = 'pages_etree_6_8_merge';
var tableName2 = 'labels_etree'

// Create layer selector
function createSelector(layer) {
  var condition = "";
  var $options = $(".layer_selector").find("li");
  $options.click(function(e) {
    var $li = $(e.target);
    var selected = $li.attr('data');
    var type = $li.data('type');

    if (type === "cartocss") {
      $options.removeClass('cartocss_selected');
      if (selected !== "simple") {
        $li.addClass('cartocss_selected');                      
      }
      condition = $('#'+selected).text();
      layer.setCartoCSS(condition);
    } else {
      $options.removeClass('sql_selected');
      if (selected !== "") {
        $li.addClass('sql_selected');
      }
      
      layer.setSQL("SELECT * FROM " + tableName + selected);
      //layer.setSQL("SELECT * FROM labels " + selected)
    }
  });
}

var catMenuEl = document.getElementById('category-menu');

function updateCategoryMenu(catString) {
  
  catMenuEl.innerHTML = '';
  catArray = catString.split('/');
  console.log(catArray);
  var li = null;
  for (i in catArray) {
    li = document.createElement('li');
    li.setAttribute('data-type', 'sql');
    li.setAttribute('data', " WHERE category ILIKE '%" + catArray[i] + "%'");
    li.innerHTML = catArray[i].split('_').join(' ');
    catMenuEl.appendChild(li);
  }
  // reset button
  li = document.createElement('li');
  li.setAttribute('data-type', 'sql');
  li.setAttribute('data', '');
  li.setAttribute('id', 'sql-reset');
  li.innerHTML = 'Clear filters';
  catMenuEl.appendChild(li);
  
}

function main() {

  cartodb.createVis('map', 'https://sighrobot.cartodb.com/api/v2/viz/02dd96fc-fd8f-11e4-83a3-0e0c41326911/viz.json', {
    shareable: false,
    title: false,
    description: false,
    search: false,
    tiles_loader: false,
    zoom: 14,
    scrollwheel:true,
    cartodb_logo:false,
    https: true,
    zoomControl:false,
    center_lon: 2 * (Math.random() * 0.75) - 1,
    center_lat: 2 * (Math.random() * 0.75) - 1,
  })
  .done(function(vis, layers) {
    // layer 0 is the base layer, layer 1 is cartodb layer
    // setInteraction is disabled by default

    var map = vis.getNativeMap();

    var cartoLayer = layers[1];

    cartoLayer.setInteraction(true);

    var cartoSubLayer0 = cartoLayer.getSubLayer(0);
    var cartoSubLayer1 = cartoLayer.getSubLayer(1);
    var cartoSubLayer2 = cartoLayer.getSubLayer(2);

    cartoSubLayer2.setInteraction(true);
    
    cartoLayer.on('featureClick', function(e, latlng, pos, data, layer) {
      if (layer == 2) {
        sql.execute("SELECT ST_AsGeoJSON(the_geom) FROM "+ tableName2 +" WHERE cartodb_id = "+ data['cartodb_id'])
        .done(function(data) {
          coords = JSON.parse(data.rows[0].st_asgeojson).coordinates.reverse();
          if (map.getZoom() < 14) map.setView(coords, 14); 
          else map.setView(coords, 19);
        })
        .error(function(errors) {
          console.log("sql errors:" + errors);
        });
      }
    });

    /*var tooltip = $('#tooltip');

    cartoLayer.on('featureOver', function(e, latlng, pos, data, layer) {
      if (layer == 2 && map.getZoom() < 14) {
        sql.execute("SELECT category FROM "+ tableName2 +" WHERE cartodb_id = "+ data['cartodb_id'])
        .done(function(data) {
          var cat = data.rows[0].category;
          tooltip.html(cat);
          tooltip.css('display', 'block');
          tooltip.css('bottom', window.innerHeight-pos.y +'px');
          tooltip.css('left', pos.x +'px');
        })
        .error(function(errors) {
          console.log("sql errors:" + errors);
        });
      }
    });

    cartoLayer.on('featureOut', function(e, latlng, pos, data, layer) {
        tooltip.css('display', 'none');
    });*/



    // layers[1].on('featureClick', function(e, latlng, pos, data, layer) {
    //   if (layer == 0) {
    //     sql.execute("SELECT * FROM "+ tableName0 +" WHERE cartodb_id = "+ data['cartodb_id'])
    //     .done(function(data) {
    //       updateCategoryMenu(data.rows[0].category);
    //       createSelector(cartoSubLayer0);
    //     })
    //     .error(function(errors) {
    //       console.log("sql errors:" + errors);
    //     });
    //   }
    //   else if (layer == 1) {
    //     sql.execute("SELECT * FROM "+ tableName1 +" WHERE cartodb_id = "+ data['cartodb_id'])
    //     .done(function(data) {
    //       updateCategoryMenu(data.rows[0].category);
    //       createSelector(cartoSubLayer1);
    //     })
    //     .error(function(errors) {
    //       console.log("sql errors:" + errors);
    //     });
    //   }
    // });

    //createSelector(cartoSubLayer0);
    //createSelector(cartoSubLayer1);
    
    //cartoSubLayer0.infowindow.set('template', $('#infowindow_template').html());
    //cartoSubLayer1.infowindow.set('template', $('#infowindow_template').html());

    // console.log(cartoSubLayer0.infowindow)

    vis.map.set({
      minZoom:8,
      maxZoom:25,
    });


    map.on('zoomend', function() {
      //console.log(map.getZoom())
      if (map.getZoom() < 14) {
        //console.log('hiding layers');
        cartoSubLayer0.hide();
        cartoSubLayer1.hide();
      }
      else {
        //console.log('showing layers');
        cartoSubLayer0.show();
        cartoSubLayer1.show();
      }
    });
    map.attributionControl.addAttribution('<span id="dmoz-attr">&copy;&nbsp;<a href="https://dmoztools.net/docs/en/license.html" target="_blank">AOL</a></span>');
    map.attributionControl.addAttribution('Created&nbsp;by&nbsp;<a href="https://abe.sh/" target="blank">Abe&nbsp;Rubenstein</a>&nbsp;at&nbsp;<a href="https://tisch.nyu.edu/itp" target="_blank">ITP</a>');
    new L.Control.Zoom({ position: 'topleft' }).addTo(map);

  })
  .error(function(err) {
    console.log(err);
  });
}
