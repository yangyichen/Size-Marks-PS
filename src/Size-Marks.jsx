﻿/*    Size Marks 0.1.0    Copyright (c) 2014 Roman Shamin https://github.com/romashamin    and licenced under the MIT licence. All rights not explicitly    granted in the MIT license are reserved. See the included    LICENSE file for more details.    https://github.com/romashamin    https://twitter.com/romanshamin    Converts rectangular selection to labeled measurement mark.    Landscape selection → horizontal mark. Portrait or square    selection → vertical mark. */#target photoshop;// DATAvar doc                 = null,    docIsExist          = false;    selBounds           = null,    selIsExist          = false;var color               = new SolidColor();    color.rgb.red       = 255;    color.rgb.green     = 0;    color.rgb.blue      = 255;var store = {        foregroundColor : app.foregroundColor,        rulerUnits      : app.preferences.rulerUnits,        typeUnits       : app.preferences.typeUnits,        font            : null,        antiAliasMethod : null    };    app.preferences.rulerUnits = Units.PIXELS;    app.preferences.typeUnits  = TypeUnits.POINTS;    app.foregroundColor        = color;try {    doc = app.activeDocument;    docIsExist = true;} catch (e) {    alert("Size Mark Script: there is no document\nUse File → New... to create one");};if (docIsExist) {    try {        selBounds = doc.selection.bounds;        selIsExist = true;    } catch (e) {        alert("Size Mark Script: there is no selection\nUse Rectangular Marquee Tool (M) to create one");    };}if (docIsExist && selIsExist) {    var halfMark    = 3,        baseRes     = 72, // px per inch        docRes      = doc.resolution,        scaleRatio  = docRes / baseRes,        scale       = setScaleF(scaleRatio),        realUnits   = "px",        scaledUnits = "pt";    var selX1 = selBounds[0].value,        selX2 = selBounds[2].value - 1,        selY1 = selBounds[1].value,        selY2 = selBounds[3].value - 1;    var selWidth  = selX2 - selX1,        selHeight = selY2 - selY1;    var val = 0,        txtLayerPos = [0, 0],        layerNamePrefix = "MSRMNT",        txtJ11n = Justification.LEFT;    doc.selection.deselect();    doc.artLayers.add();    setPenToolSize(1.000000);    if (selWidth > selHeight) {        // Draw Main Line        drawLine([selX1, selY1], [selX2, selY1]);        // Draw Edge Marks        drawLine([selX1, selY1 - halfMark],                 [selX1, selY1 + halfMark]);        drawLine([selX2, selY1 - halfMark],                 [selX2, selY1 + halfMark]);        // Set some values for text layer        layerNamePrefix = "W";        val = selWidth + 1;        txtLayerPos = [selX1 + val / 2, selY1 - halfMark];        txtJ11n = Justification.CENTER;    } else {        // Draw Main Line        drawLine([selX1, selY1], [selX1, selY2]);        // Draw Edge Marks        drawLine([selX1 - halfMark, selY1],                 [selX1 + halfMark, selY1]);        drawLine([selX1 - halfMark, selY2],                 [selX1 + halfMark, selY2]);        // Set some values for text layer        layerNamePrefix = "H";        val = selHeight + 1;        txtLayerPos = [selX1 + halfMark, selY1 + val / 2 + 4];        txtJ11n = Justification.LEFT;    }    // Add text mark    var txtLayer                 = doc.artLayers.add();    txtLayer.kind                = LayerKind.TEXT;    var txtLayerItem             = txtLayer.textItem;    store.font                   = txtLayerItem.font;    store.antiAliasMethod        = txtLayerItem.antiAliasMethod;    txtLayerItem.font            = "ArialMT";    txtLayerItem.antiAliasMethod = AntiAlias.NONE;    txtLayerItem.position        = txtLayerPos;    txtLayerItem.color           = color;    txtLayerItem.justification   = txtJ11n;    var cntnt = "";    if (baseRes !== docRes) { cntnt = scale(val) + scaledUnits + " / "; }    cntnt += val + realUnits;    txtLayerItem.contents = cntnt;    // Finish    var finishLayer              = txtLayer.merge();    finishLayer.name             = layerNamePrefix + val;    finishLayer.opacity          = 35;    // New text layer needs to restore text settings    txtLayer                     = doc.artLayers.add();    txtLayer.kind                = LayerKind.TEXT;    txtLayerItem                 = txtLayer.textItem;    txtLayerItem.font            = store.font;    txtLayerItem.antiAliasMethod = store.antiAliasMethod;    txtLayer.merge();    app.preferences.rulerUnits   = store.rulerUnits;    app.preferences.typeUnits    = store.typeUnits;    app.foregroundColor          = store.foregroundColor;}// HELPERSfunction setScaleF(ratio) {    return function(value) { return value / ratio; };}function drawLine(start, stop) {    var startPoint    = makePoint(start),        stopPoint     = makePoint(stop);    var spi           = new SubPathInfo();    spi.closed        = false;    spi.operation     = ShapeOperation.SHAPEXOR;    spi.entireSubPath = [startPoint, stopPoint];    var line = doc.pathItems.add("Line", [spi]);    line.strokePath(ToolType.PENCIL);    line.remove();};function makePoint(pnt) {    for (var i = 0; i < pnt.length; i++) {        pnt[i] = scale(pnt[i]);    };    var point = new PathPointInfo();    point.anchor         = pnt;    point.leftDirection  = pnt;    point.rightDirection = pnt;    point.kind = PointKind.CORNERPOINT;    return point;};/*    Thanks to c.pfaffenbichler for the code, it saves me    Source: https://forums.adobe.com/thread/962285?start=0&tstart=0    Comment for Feb 16, 2012 7:18 AM */function setPenToolSize(dblSize) {    var idslct = charIDToTypeID( "slct" );        var desc3 = new ActionDescriptor();        var idnull = charIDToTypeID( "null" );            var ref2 = new ActionReference();            var idPcTl = charIDToTypeID( "PcTl" );            ref2.putClass( idPcTl );        desc3.putReference( idnull, ref2 );    executeAction( idslct, desc3, DialogModes.NO );    var idsetd = charIDToTypeID( "setd" );        var desc2 = new ActionDescriptor();        var idnull = charIDToTypeID( "null" );            var ref1 = new ActionReference();            var idBrsh = charIDToTypeID( "Brsh" );            var idOrdn = charIDToTypeID( "Ordn" );            var idTrgt = charIDToTypeID( "Trgt" );            ref1.putEnumerated( idBrsh, idOrdn, idTrgt );        desc2.putReference( idnull, ref1 );        var idT = charIDToTypeID( "T   " );            var desc3 = new ActionDescriptor();            var idmasterDiameter = stringIDToTypeID( "masterDiameter" );            var idPxl = charIDToTypeID( "#Pxl" );            desc3.putUnitDouble( idmasterDiameter, idPxl, dblSize );  //1.000000        var idBrsh = charIDToTypeID( "Brsh" );        desc2.putObject( idT, idBrsh, desc3 );    executeAction( idsetd, desc2, DialogModes.NO );};