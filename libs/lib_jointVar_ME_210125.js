
// function for random permutation of elements in an array
// reference: https://www.w3schools.com/js/js_array_sort.asp (The Fisher Yates Method)
function randPerms(arr){
    for (i=arr.length-1; i>0;i--){
        var j = Math.floor(Math.random()*i)
        var k = arr[i]
        arr[i] = arr[j]
        arr[j] = k
    }
    return arr
}

// function for random permutation of elements in two arrays with common indexes
function randPerms_joint(arr1, arr2){
    for (i=arr1.length-1; i>0; i--){
        var j = Math.floor(Math.random()*i)
        
        var k1 = arr1[i]
        var k2 = arr2[i]

        arr1[i] = arr1[j]
        arr2[i] = arr2[j]

        arr1[j] = k1
        arr2[j] = k2
    }
    return [arr1, arr2]
} 

// function transforming degree angles into radian angles. 
function deg2rad(angles){
    // input: single degree angle or an array of degree angles
    // output: an array of angles in radian (even single input will be embedded in array)
    if (typeof(angles)=='number'){angles = [angles]}
    var thetas = angles.map( function(angle){return angle*(Math.PI/180)}  )
    return thetas
}

// function transforming polar coordinates into Cartegian coordinates
function pol2cart(angles_deg,radius){
    const angles_rad = deg2rad(angles_deg)
    var x = angles_rad.map( function(angle_rad){return Math.cos(angle_rad)*radius} )
    var y = angles_rad.map( function(angle_rad){return Math.sin(angle_rad)*radius} )  
    return [x,y]
}

// function generating hue angle values in CIE L*a*b space 
function lab_colorwheel(angles_Deg,radius,center){
    // parameters from Zhang & Luck (2008): radius= 60; center = [70,20,38];
    var angles_rad = deg2rad(angles_Deg) // convert degree to radian (array)

    // convert angles to Cartesian coordinates 
    var a = angles_rad.map( function(angle_rad){return Math.cos(angle_rad)*radius} );
    var b = angles_rad.map( function(angle_rad){return Math.sin(angle_rad)*radius} ); 

    // centered on certain point
    L = [];
    for (i=0;i<angles_rad.length; i++){ L.push(center[0]); }
    a = a.map( function(val){return val+center[1]}  );
    b = b.map( function(val){return val+center[2]}  );
 
    return [L,a,b]
}

// function transforming hue angle values in cielab color wheel into rgb value using spectra.js
function lab2rgb_array(hues_cielab){

    var hues_rgb = [];
    const ss = hues_cielab[0].length;
    for(i=0; i<ss; i++){hues_rgb.push(0)}; // initializing

    for(i=0; i<ss; i++){
        hues_rgb[i] = Array(3);
        var spt = Spectra({l: hues_cielab[0][i],a:hues_cielab[1][i],b:hues_cielab[2][i]}) ;
        hues_rgb[i] = [spt.color.r, spt.color.g, spt.color.b];
    }
  
    return hues_rgb
}

// function generating angles based on the mean, range, and sample size
// ** note that circularity problem is not considered in this function. **
function get_angles(mean, ran, setSize){
    // circularity problem should be considered before running experiment.
    // For example, mean value might be carefully selected to avoid wrap-around problem
    // (even in the large range sitaution)
    var angMin = mean-ran/2;
    var angMax = mean+ran/2;
    
    var angles = [];
    for (i=0; i<setSize; i++){
        angles[i] = Math.floor(Math.random()*ran) + angMin;
    }
    return angles
}

// function genearting grid arrays for presenting a set of stimuli.
// current version of this function is optimized to draw 9x9 stimulus arrays.
function gen_coordinates(centerX, centerY){
    // Each array contained 69 dark bars arranged in a 9 x 9 grid excluding three in each corner.
    // Bar positions were jittered by up to 0.28 to avoid array homogeneity. 
    // Bar length3width was 0.7830.058 and bar orientation was 608 or 708 mean 6 a variation factor

    // 1. define parameters
    const c2c = 30; // distacne between the center of each grid
    const sqLength = 9; // gen sqLength x sqLength square grid

    // 2. gen 9x9 square grid    
    const initialX = centerX - c2c*(sqLength-1)/2;
    const initialY = centerY - c2c*(sqLength-1)/2;

    var coordX = []; 
    var coordY = [];

    // coordX.push(initialX);
    // coordY.push(initialY);

    for (i=0; i<sqLength*sqLength; i++){
        var row = Math.floor(i/9);
        var col = Math.floor(i%9);

        coordX.push(initialX + c2c*col);
        coordY.push(initialY + c2c*row);        
    }

    // 3. excluding corners to create circular area
    var fullIdx = [];
    for (i=0; i<sqLength*sqLength;i++){ fullIdx.push(i); }

    const cornerIdx = [0,1,7,8,9,17,63,71,72,73,79,80];
    // newIdx = fullIdx.filter( function(val){return cornerIdx.indexOf(val)==-1} );

    coordX = coordX.filter(  function(val,idx){return cornerIdx.indexOf(idx)==-1 }  )
    coordY = coordY.filter(  function(val,idx){return cornerIdx.indexOf(idx)==-1 }  )

    return {X: coordX, Y: coordY}
    // 4. adding jitters to each grid point
    // adding jitters in a different function seems to be more efficient.
}

// function adding jitters to the grid coordinates which were generated from gen_coordinates function
function add_jitter(coord,maxJitter){
    // create random jitter and add to the coordinates
    var new_coord = {};
    new_coord.X = coord.X.map( function(val){ return val + Math.floor(Math.random()*2*maxJitter-maxJitter) }  );
    new_coord.Y = coord.Y.map( function(val){ return val + Math.floor(Math.random()*2*maxJitter-maxJitter) }  );

    return {X: new_coord.X, Y: new_coord.Y} 
}

// function generating colored orientation texture
function drawTexture_colBars(oriMean, hueMean, oriRan, hueRan, coord, ctx){
    // is there efficient way to control each line's color?
    // draw orientations with certain colors in a grid

    // Parameters. These values are somewhat arbitrary, so these values have to be adjusted before running actual experiments.  
    const setSize = 81;
    const maxJitter = 4;
    const lineWidth = 3;
    const lineLength = 12;
    const cielab_radius = 60;
    const cielab_center = [70, 20, 38];

    // get orientation values
    var ori_angles = get_angles(oriMean, oriRan, setSize);
    var ori_thetas = deg2rad(ori_angles);
    var hue_angles = get_angles(hueMean, hueRan, setSize);
    // get hue values
    // convert hue values into cie lab
    var hues_cielab = lab_colorwheel(hue_angles,cielab_radius,cielab_center)
    var hues_rgb = lab2rgb_array(hues_cielab)

    // hues_rgb.map( function(val,idx){
    //     spt = Spectra({l: hues_cielab[0][idx],a:hues_cielab[1][idx],b:hues_cielab[2][idx]});
    //     rgb = Object.values(spt.color);
    //     return rgb[0,1,2];
    // })        

    // console.log(hues_rgb);

    // add jitter to the coordinates
    var jittered_coord = add_jitter(coord, maxJitter); 

    for (i=0; i<setSize; i++){

        // console.log(hues_rgb[i])

        var x1 = jittered_coord.X[i] - lineLength/2 * Math.cos(ori_thetas[i]);
        var y1 = jittered_coord.Y[i] - lineLength/2 * Math.sin(ori_thetas[i]);
        var x2 = jittered_coord.X[i] + lineLength/2 * Math.cos(ori_thetas[i]);
        var y2 = jittered_coord.Y[i] + lineLength/2 * Math.sin(ori_thetas[i]);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'rgb(' + hues_rgb[i][0] + ', ' + hues_rgb[i][1] + ', ' + hues_rgb[i][2] + ')';
        // console.log(ctx.strokeStyle);
        ctx.stroke();
    }
    return {ori_angles: ori_angles, hue_angles: hue_angles}
}