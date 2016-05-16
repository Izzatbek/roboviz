var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = true;
var gridY = false;
var gridZ = false;
var axes = true;
var ground = true;
var arm, forearm, body, handLeft, handRight;

var all_joints = [];

function fillScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

    // LIGHTS
    var ambientLight = new THREE.AmbientLight( 0x222222 );
    var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
    light.position.set( 200, 400, 500 );
    var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
    light2.position.set( -500, 250, -200 );
    scene.add(ambientLight);
    scene.add(light);
    scene.add(light2);

    // Robot definitions
    var robotHandLeftMaterial = new THREE.MeshPhongMaterial( { color: 0xCC3399, specular: 0xCC3399, shininess: 20 } );
    var robotHandRightMaterial = new THREE.MeshPhongMaterial( { color: 0xDD3388, specular: 0xDD3388, shininess: 20 } );
    var robotBaseMaterial = new THREE.MeshPhongMaterial( { color: 0x6E23BB, specular: 0x6E23BB, shininess: 20 } );
    var robotForearmMaterial = new THREE.MeshPhongMaterial( { color: 0xF4C154, specular: 0xF4C154, shininess: 100 } );
    var robotUpperArmMaterial = new THREE.MeshPhongMaterial( { color: 0x95E4FB, specular: 0x95E4FB, shininess: 100 } );

    var torus = new THREE.Mesh(
        new THREE.TorusGeometry( 22, 15, 32, 32 ), robotBaseMaterial );
    torus.rotation.x = 90 * Math.PI/180;
    scene.add( torus );

    forearm = new THREE.Object3D();
    var faLength = 80;

    createRobotExtender( forearm, faLength, robotForearmMaterial );

    arm = new THREE.Object3D();
    var uaLength = 120;

    createRobotCrane( arm, uaLength, robotUpperArmMaterial );

    // Move the forearm itself to the end of the upper arm.
    forearm.position.y = uaLength;
    arm.add( forearm );

    scene.add( arm );

    var handLength = 38;

    handLeft = new THREE.Object3D();
    createRobotGrabber( handLeft, handLength, robotHandLeftMaterial );
    // Move the hand part to the end of the forearm.
    handLeft.position.y = faLength;
    forearm.add( handLeft );
    
    handRight = new THREE.Object3D();
    createRobotGrabber( handRight, handLength, robotHandRightMaterial );
    // Move the hand part to the end of the forearm.
    handRight.position.y = faLength;
    forearm.add( handRight );
    
    
    var base = new THREE.Object3D();
    base.position.x = 100;
    base.position.y = 20;
    base.rotation.x = - Math.PI / 2.;
    scene.add(base);
    // scene.rotation.x = - Math.PI / 2.;
    // base.rotation.x = - Math.PI / 2.;

    var pars = [
    {gamma:0, b:0, alpha:0, theta:0, d:0,r:0},
    {gamma:0, b:0, alpha:Math.PI / 2., theta:0, d:0,r:0},
    {gamma:0, b:0, alpha:0, theta:0, d:100,r:0},
    {gamma:0, b:0, alpha: - Math.PI / 2., theta:0, d:0,r:100},
    {gamma:0, b:0, alpha:Math.PI / 2., theta:0, d:0,r:0},
    {gamma:0, b:0, alpha:-Math.PI / 2., theta:0, d:0,r:0}
    ]

    all_joints = []

    var parent = base;
    for (var i = 0; i < 6; i++) {
        var par = pars[i];
        var joint = new Joint(i, parent, par.theta, par.r, par.alpha, par.d, par.gamma, par.b);
        parent = joint.obj3D;
        all_joints.push(joint);
    }
    /*

    var cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry( 15, 15, 40, 32 ), robotForearmMaterial );
    cylinder.rotation.x = 0 * Math.PI/180;
    base.add( cylinder );

    var stick = new THREE.Mesh(
        new THREE.CylinderGeometry( 3, 3, 40, 8), robotForearmMaterial );
    stick.position.x = 100;
    stick.position.y = 60;
    scene.add(stick);*/
}

function createRobotGrabber( part, length, material )
{
    var box = new THREE.Mesh(
        new THREE.CubeGeometry( 30, length, 4 ), material );
    box.position.y = length/2;
    part.add( box );
}

function createRobotExtender( part, length, material )
{
    var cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry( 22, 22, 6, 32 ), material );
    part.add( cylinder );

    var i;
    for ( i = 0; i < 4; i++ )
    {
        var box = new THREE.Mesh(
            new THREE.CubeGeometry( 4, length, 4 ), material );
        box.position.x = (i < 2) ? -8 : 8;
        box.position.y = length/2;
        box.position.z = (i%2) ? -8 : 8;
        part.add( box );
    }

    cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry( 15, 15, 40, 32 ), material );
    cylinder.rotation.x = 90 * Math.PI/180;
    cylinder.position.y = length;
    part.add( cylinder );
}

function createRobotCrane( part, length, material )
{
    var box = new THREE.Mesh(
        new THREE.CubeGeometry( 18, length, 18 ), material );
    box.position.y = length/2;
    part.add( box );

    var sphere = new THREE.Mesh(
        new THREE.SphereGeometry( 20, 32, 16 ), material );
    // place sphere at end of arm
    sphere.position.y = length;
    part.add( sphere );
}

function init() {
    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;
    var canvasRatio = canvasWidth / canvasHeight;

    // RENDERER
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor( 0xAAAAAA, 1.0 );

    // CAMERA
    camera = new THREE.PerspectiveCamera( 38, canvasRatio, 1, 10000 );
    // CONTROLS
    cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
    camera.position.set(-49, 242,54);
    cameraControls.target.set(54, 106, 33);
    fillScene();

}

function addToDOM() {
    var container = document.getElementById('container');
    var canvas = container.getElementsByTagName('canvas');
    if (canvas.length>0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild( renderer.domElement );
}

function drawHelpers() {
    if (ground) {
        Coordinates.drawGround({size:10000});
    }
    if (gridX) {
        Coordinates.drawGrid({size:10000,scale:0.01});
    }
    if (gridY) {
        Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
    }
    if (gridZ) {
        Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});
    }
    if (axes) {
        Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
    }
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);

    if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes)
    {
        gridX = effectController.newGridX;
        gridY = effectController.newGridY;
        gridZ = effectController.newGridZ;
        ground = effectController.newGround;
        axes = effectController.newAxes;

        fillScene();
        drawHelpers();
    }

    arm.rotation.y = effectController.uy * Math.PI/180; // yaw
    arm.rotation.z = effectController.uz * Math.PI/180; // roll

    forearm.rotation.y = effectController.fy * Math.PI/180; // yaw
    forearm.rotation.z = effectController.fz * Math.PI/180; // roll

    // ADD handRight yaw AND translate HERE
    handLeft.rotation.z = effectController.hz * Math.PI/180;    // yaw
    handLeft.position.z = effectController.htz; // translate
    
    handRight.rotation.z = effectController.hz * Math.PI/180;   // yaw
    handRight.position.z = -effectController.htz;   // translate

    renderer.render(scene, camera);
}

function setupGui() {

    effectController = {

        newGridX: gridX,
        newGridY: gridY,
        newGridZ: gridZ,
        newGround: ground,
        newAxes: axes,

        uy: 70.0,
        uz: -15.0,

        fy: 10.0,
        fz: 60.0,

        hz: 30.0,
        htz: 12.0
    };

    var gui = new dat.GUI();
    var h = gui.addFolder("Grid display");
    h.add( effectController, "newGridX").name("Show XZ grid");
    h.add( effectController, "newGridY" ).name("Show YZ grid");
    h.add( effectController, "newGridZ" ).name("Show XY grid");
    h.add( effectController, "newGround" ).name("Show ground");
    h.add( effectController, "newAxes" ).name("Show axes");
    h = gui.addFolder("Arm angles");
    h.add(effectController, "uy", -180.0, 180.0, 0.025).name("Upper arm y");
    h.add(effectController, "uz", -45.0, 45.0, 0.025).name("Upper arm z");
    h.add(effectController, "fy", -180.0, 180.0, 0.025).name("Forearm y");
    h.add(effectController, "fz", -120.0, 120.0, 0.025).name("Forearm z");
    h.add(effectController, "hz", -45.0, 45.0, 0.025).name("Hand z");
    h.add(effectController, "htz", 2.0, 17.0, 0.025).name("Hand spread");
}

try {
    init();
    fillScene();
    drawHelpers();
    addToDOM();
    setupGui();
    animate();
} catch(e) {
    var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
    jQuery(function($) {
        $('#container').append(errorReport+e);
    });
}

